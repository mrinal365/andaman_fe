import React from 'react';

export const Hill = () => {
    return (
        <div className="absolute bottom-0 left-0 w-[50%] h-[60%] z-0 pointer-events-none opacity-90 transition-opacity duration-1000">
            <svg viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="none" fill="currentColor">
                {/* Rugged Cliff Path */}
                <path d="M0,500 L0,150 L30,160 L60,140 L100,180 L140,170 L180,240 L220,260 L280,320 L320,340 L380,420 L440,500 H0 Z" fill="#171717" />
            </svg>
        </div>
    );
};
