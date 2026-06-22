/**
 * Explore.baby — Service Worker
 *
 * Caching strategies:
 *   - Static assets (_next/static): Cache-First (content-hashed, immutable)
 *   - App shell pages (/, /login, /signup, /feed, /offline): Stale-While-Revalidate
 *   - API calls: Network-First with cache fallback
 *   - Images: Cache-First with 7-day expiry
 *   - Fonts: Cache-First (immutable)
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE, API_CACHE, IMAGE_CACHE];

// Pages to precache on install (app shell)
const PRECACHE_PAGES = [
    '/',
    '/login',
    '/signup',
    '/offline',
];

// Static assets to precache
const PRECACHE_ASSETS = [
    '/logo.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then((cache) =>
                cache.addAll(PRECACHE_ASSETS)
            ),
            // Cache app shell pages
            caches.open(PAGES_CACHE).then((cache) =>
                cache.addAll(PRECACHE_PAGES).catch((err) => {
                    // Non-fatal: some pages might not be available during build
                    console.warn('[SW] Failed to precache some pages:', err);
                })
            ),
        ]).then(() => self.skipWaiting())
    );
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !ALL_CACHES.includes(name))
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension, ws, etc.
    if (!url.protocol.startsWith('http')) return;

    // ── Static assets (JS, CSS from _next/static) ──
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ── Fonts ──
    if (url.pathname.includes('/fonts/') || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ── API requests ──
    if (url.pathname.startsWith('/api/') || url.hostname.includes('andaman-be')) {
        event.respondWith(networkFirst(request, API_CACHE));
        return;
    }

    // ── Images ──
    if (isImageRequest(request, url)) {
        event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE, 7 * 24 * 60 * 60 * 1000)); // 7 days
        return;
    }

    // ── Navigation requests (HTML pages) ──
    if (request.mode === 'navigate') {
        event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
        return;
    }

    // ── Everything else: network first ──
    event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ─── Caching Strategies ──────────────────────────────────────────────────────

/**
 * Cache-First: Try cache, fall back to network.
 * Best for immutable assets (hashed JS/CSS, fonts).
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Cache-First with expiry: Like cache-first but respects a max-age.
 * Best for images that don't change often.
 */
async function cacheFirstWithExpiry(request, cacheName, maxAgeMs) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        const dateHeader = cached.headers.get('sw-cache-date');
        if (dateHeader) {
            const cacheAge = Date.now() - parseInt(dateHeader, 10);
            if (cacheAge < maxAgeMs) {
                return cached;
            }
        } else {
            // No date header, still return cached
            return cached;
        }
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            // Clone and add cache timestamp
            const headers = new Headers(response.headers);
            headers.set('sw-cache-date', String(Date.now()));
            const timedResponse = new Response(await response.clone().blob(), {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
            cache.put(request, timedResponse);
        }
        return response;
    } catch {
        // Return stale cached version if available
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network-First: Try network, fall back to cache.
 * Best for API data that should be fresh.
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // For navigation requests, redirect to offline page
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline');
            if (offlinePage) return offlinePage;
        }

        return new Response(
            JSON.stringify({ message: 'You are offline', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * Stale-While-Revalidate: Return cached immediately, update in background.
 * Best for pages that should load fast but stay fresh.
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => {
            // If offline and no cache, serve offline page
            if (!cached) {
                return caches.match('/offline');
            }
            return null;
        });

    // Return cached if available, otherwise wait for network
    if (cached) {
        // Trigger background update but don't await
        fetchPromise;
        return cached;
    }

    const response = await fetchPromise;
    return response || new Response('Offline', { status: 503 });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isImageRequest(request, url) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif'];
    const imageHosts = ['images.unsplash.com', 'i.pravatar.cc', 'picsum.photos', 'placehold.co'];

    if (imageHosts.includes(url.hostname)) return true;
    if (imageExtensions.some((ext) => url.pathname.endsWith(ext))) return true;
    if (request.headers.get('accept')?.includes('image/')) return true;

    return false;
}

// ─── Push Notification Placeholder ───────────────────────────────────────────
// Ready for future push notification support

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || 'Explore.baby', {
                body: data.body || '',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                data: data.url ? { url: data.url } : undefined,
            })
        );
    } catch (e) {
        // Silently ignore malformed push data
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Focus existing tab if open
            for (const client of clients) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
