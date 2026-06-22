'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            // Auto-reload when connection returns
            setTimeout(() => window.location.replace('/'), 500);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsRetrying(true);
        // Try to reload the page
        setTimeout(() => {
            if (navigator.onLine) {
                window.location.replace('/');
            } else {
                setIsRetrying(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-sm w-full text-center flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="relative">
                    <img
                        src="/logo.png"
                        alt="Explore.baby"
                        className="w-20 h-20 object-contain opacity-30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <WifiOff size={24} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        You&apos;re offline
                    </h1>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Check your internet connection and try again. 
                        The page will reload automatically when you&apos;re back online.
                    </p>
                </div>

                {/* Retry button */}
                <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw
                        size={18}
                        className={isRetrying ? 'animate-spin' : ''}
                    />
                    {isRetrying ? 'Checking...' : 'Try Again'}
                </button>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {isOnline ? 'Connected' : 'No connection'}
                    </span>
                </div>
            </div>
        </div>
    );
}
