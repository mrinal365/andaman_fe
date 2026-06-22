/**
 * Offline Storage Module
 *
 * Lightweight IndexedDB wrapper for caching feed data for offline access.
 * Stores the last N posts so users can browse their feed without internet.
 *
 * Uses the browser's native IndexedDB — no external dependencies.
 */

const DB_NAME = 'explore_offline';
const DB_VERSION = 1;
const FEED_STORE = 'feed_posts';
const MAX_CACHED_POSTS = 20;

// ─── Database Initialization ─────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB not available'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(FEED_STORE)) {
                const store = db.createObjectStore(FEED_STORE, { keyPath: 'id' });
                store.createIndex('cachedAt', 'cachedAt', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ─── Feed Post Caching ───────────────────────────────────────────────────────

/**
 * Cache feed posts for offline access.
 * Stores up to MAX_CACHED_POSTS, replacing older entries.
 */
export async function cacheFeedPosts(posts: any[]): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(FEED_STORE, 'readwrite');
        const store = tx.objectStore(FEED_STORE);

        const now = Date.now();

        for (const post of posts.slice(0, MAX_CACHED_POSTS)) {
            store.put({
                ...post,
                cachedAt: now,
            });
        }

        // Clean up: keep only the most recent MAX_CACHED_POSTS
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            const total = countRequest.result;
            if (total > MAX_CACHED_POSTS) {
                const index = store.index('cachedAt');
                const deleteCount = total - MAX_CACHED_POSTS;
                let deleted = 0;

                const cursorRequest = index.openCursor();
                cursorRequest.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor && deleted < deleteCount) {
                        cursor.delete();
                        deleted++;
                        cursor.continue();
                    }
                };
            }
        };

        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        db.close();
    } catch (error) {
        console.warn('[Offline Storage] Failed to cache feed posts:', error);
    }
}

/**
 * Retrieve cached feed posts for offline viewing.
 * Returns posts sorted by cachedAt (newest first).
 */
export async function getCachedFeedPosts(): Promise<any[]> {
    try {
        const db = await openDB();
        const tx = db.transaction(FEED_STORE, 'readonly');
        const store = tx.objectStore(FEED_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const posts = request.result || [];
                // Sort by cachedAt descending (newest first)
                posts.sort((a: any, b: any) => (b.cachedAt || 0) - (a.cachedAt || 0));
                db.close();
                resolve(posts);
            };
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    } catch (error) {
        console.warn('[Offline Storage] Failed to read cached feed:', error);
        return [];
    }
}

/**
 * Clear all cached feed data.
 */
export async function clearCachedFeed(): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(FEED_STORE, 'readwrite');
        const store = tx.objectStore(FEED_STORE);
        store.clear();

        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        db.close();
    } catch (error) {
        console.warn('[Offline Storage] Failed to clear cached feed:', error);
    }
}
