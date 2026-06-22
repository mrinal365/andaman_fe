'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = '_pwa_install_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Shows an "Add to Home Screen" banner on mobile.
 * - Only shows if the browser fires beforeinstallprompt (Chrome/Edge/Samsung)
 * - Remembers dismissal for 7 days
 * - iOS users get a different message (use Safari share menu)
 */
export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already installed
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsStandalone(standalone);
        if (standalone) return;

        // Check if on iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Check if previously dismissed
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            if (Date.now() - dismissedAt < DISMISS_DURATION_MS) {
                return; // Still within dismiss period
            }
            localStorage.removeItem(DISMISS_KEY);
        }

        // For iOS, show the banner after a delay
        if (ios) {
            const timer = setTimeout(() => setShowBanner(true), 5000);
            return () => clearTimeout(timer);
        }

        // For Chrome/Edge — intercept the install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    }, [deferredPrompt]);

    const handleDismiss = useCallback(() => {
        setShowBanner(false);
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }, []);

    // Don't render if already installed or not showing
    if (isStandalone || !showBanner) return null;

    return (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4">
                {/* App icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Explore.baby" className="w-10 h-10 object-contain" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">Install Explore.baby</p>
                    {isIOS ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                            Tap <span className="inline-flex items-center"><svg className="w-3.5 h-3.5 mx-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a1 1 0 01-1 1h-3v3a1 1 0 11-2 0V9H6a1 1 0 010-2h3V4a1 1 0 012 0v3h3a1 1 0 011 1z" /></svg></span> then &quot;Add to Home Screen&quot;
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-0.5">
                            Add to home screen for quick access
                        </p>
                    )}
                </div>

                {/* Actions */}
                {!isIOS && deferredPrompt && (
                    <button
                        onClick={handleInstall}
                        className="shrink-0 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                    >
                        <Download size={14} />
                        Install
                    </button>
                )}

                {/* Dismiss */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
