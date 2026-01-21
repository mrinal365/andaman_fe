import React from 'react';

export const Tree = () => {
    return (
        <div className="absolute bottom-[-50px] right-[-100px] w-[600px] h-[600px] z-10 pointer-events-none opacity-90">
            <svg viewBox="0 0 500 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sand Pit */}
                <path d="M300 450 C350 430 450 430 500 450 V 500 H 250 C 250 500 250 470 300 450 Z" fill="#171717" />

                {/* Tree Group */}
                <g className="animate-tree-sway origin-bottom-center" style={{ transformOrigin: '380px 450px' }}>
                    {/* Trunk - Curved and textured appearance via silhouette */}
                    <path d="M380 450 C380 450 350 350 400 250 L 420 255 C 380 350 410 450 410 450 Z" fill="#1a1a1a" />

                    {/* Leaves - Big, Spiky, Silhouette */}
                    <g transform="translate(410, 250)">
                        {/* Leaf 1 - Left Long */}
                        <path d="M0 0 C -40 -30 -120 -20 -180 50 C -120 0 -50 -10 0 10 Z" fill="#1a1a1a" />
                        {/* Leaf 2 - Top Left */}
                        <path d="M0 0 C -30 -40 -80 -90 -120 -100 C -70 -70 -30 -30 0 5 Z" fill="#1a1a1a" />
                        {/* Leaf 3 - Top Right */}
                        <path d="M0 0 C 30 -40 80 -90 140 -80 C 80 -60 30 -30 0 10 Z" fill="#1a1a1a" />
                        {/* Leaf 4 - Right Long */}
                        <path d="M0 0 C 50 -20 120 0 160 60 C 110 20 50 10 0 15 Z" fill="#1a1a1a" />
                        {/* Leaf 5 - Center Top */}
                        <path d="M0 0 C -10 -50 10 -120 0 -160 C 10 -100 20 -40 10 0 Z" fill="#1a1a1a" />
                    </g>
                </g>
            </svg>
        </div>
    );
};
