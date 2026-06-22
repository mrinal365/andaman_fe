'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Registers the service worker and handles updates.
 * Place this in the root layout — it's a client component that renders nothing.
 */
export function ServiceWorkerRegistration() {
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Register service worker
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                registrationRef.current = registration;
                console.log('[PWA] Service Worker registered, scope:', registration.scope);

                // Check for updates periodically (every 30 minutes)
                const updateInterval = setInterval(() => {
                    registration.update();
                }, 30 * 60 * 1000);

                // Listen for new service worker waiting
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            toast.info(
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">New version available</span>
                                    <button
                                        onClick={() => {
                                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                                            window.location.reload();
                                        }}
                                        className="text-xs font-bold bg-black text-white px-3 py-1 rounded-md hover:bg-neutral-800 transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>,
                                {
                                    toastId: 'sw-update',
                                    autoClose: false,
                                    closeOnClick: false,
                                }
                            );
                        }
                    });
                });

                return () => clearInterval(updateInterval);
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Optionally reload on controller change
            // window.location.reload();
        });
    }, []);

    // This component renders nothing — it's just a side-effect
    return null;
}
