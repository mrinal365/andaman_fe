'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * A slim banner that slides in at the top when the user goes offline.
 * Auto-hides when the connection is restored.
 */
export function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            // Hide "reconnected" message after 3 seconds
            setTimeout(() => setShowReconnected(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Nothing to show when online and no reconnected message
    if (isOnline && !showReconnected) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ease-out ${
                (!isOnline || showReconnected) ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold tracking-wide ${
                    isOnline
                        ? 'bg-green-500 text-white'
                        : 'bg-neutral-900 text-white'
                }`}
            >
                {isOnline ? (
                    <>
                        <Wifi size={14} className="animate-pulse" />
                        <span>Back online</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={14} />
                        <span>You&apos;re offline — some features may be limited</span>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Hook to check online/offline status reactively.
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
