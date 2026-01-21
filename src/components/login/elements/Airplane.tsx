import React from 'react';

export const Airplane = () => {
    return (
        <div className="absolute top-[10%] left-0 w-full h-[15%] pointer-events-none z-0 animate-airplane-fly">
            <svg viewBox="0 0 1000 200" className="w-full h-full opacity-40" fill="currentColor">
                <g className="text-neutral-500">
                    {/* Airplane Silhouette */}
                    <path d="M850 80 L 890 82 L 900 70 L 910 70 L 900 83 L 940 85 L 950 80 L 955 80 L 950 86 L 960 87 L 960 90 L 850 90 Z" />
                    <path d="M880 82 L 880 95 L 870 95 L 875 82 Z" /> {/* Engine/Wing detail */}
                </g>
            </svg>
        </div>
    );
};
