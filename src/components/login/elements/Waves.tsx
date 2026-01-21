import React from 'react';

export const Waves = () => {
    return (
        <>
            {/* Wave 1 - Deep Rolling Swell (Furthest) */}
            <div className="absolute bottom-0 left-0 w-[200%] h-[45%] text-neutral-900/50 animate-wave-slow">
                <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none" fill="currentColor">
                    <path fillOpacity="1" d="M0,192 C320,160 420,240 720,200 C1020,160 1180,240 1440,200 V320 H0 Z"></path>
                </svg>
            </div>

            {/* Wave 2 - Asymmetric Swell (Middle-Back) */}
            <div className="absolute bottom-0 left-0 w-[200%] h-[40%] text-neutral-800/40 animate-wave-medium" style={{ animationDelay: '-5s' }}>
                <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none" fill="currentColor">
                    <path fillOpacity="1" d="M0,240 C240,200 400,280 680,230 C960,180 1200,280 1440,240 V320 H0 Z"></path>
                </svg>
            </div>

            {/* Wave 3 - Breaking Crests (Middle-Front) */}
            <div className="absolute bottom-[-10px] left-0 w-[200%] h-[35%] text-neutral-900/30 animate-wave-medium" style={{ animationDelay: '-10s' }}>
                <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none" fill="currentColor">
                    <path fillOpacity="1" d="M0,180 C180,140 280,200 480,170 C680,140 820,200 960,170 C1160,140 1280,200 1440,170 V320 H0 Z"></path>
                </svg>
            </div>

            {/* Wave 4 - Surface Chop (Closest) */}
            <div className="absolute bottom-[-20px] left-0 w-[200%] h-[30%] text-neutral-700/20 animate-wave-fast">
                <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none" fill="currentColor">
                    <path fillOpacity="1" d="M0,220 C120,190 180,240 300,210 C420,180 540,240 660,210 C780,180 900,240 1020,210 C1140,180 1260,240 1440,210 V320 H0 Z"></path>
                </svg>
            </div>
        </>
    );
};
