'use client';

import { Search } from 'lucide-react';

export const CommunityHero = () => {
    return (
        <div className="relative w-full h-[240px] rounded-xl overflow-hidden mb-4 group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2666&auto=format&fit=crop')` }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent/30"></div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-3xl">
                {/* Badge */}
                <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-widest">
                        Premium Travel Network
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                    Coastal <br /> Connections
                </h1>

                {/* Subtitle */}
                <p className="text-gray-200 text-xs font-medium max-w-lg leading-relaxed mb-4 opacity-90">
                    Join the conversation with locals and travelers in exclusive beach communities worldwide.
                </p>

                {/* Search Bar - Smaller */}
                <div className="relative max-w-[360px] w-full">
                    <div className="relative bg-white rounded-lg p-1 flex items-center">
                        <div className="pl-3 pr-2 text-gray-400">
                            <Search className="h-3.5 w-3.5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find your beach destination..."
                            className="flex-1 bg-transparent border-none outline-none px-2 text-[12px] font-medium text-gray-900 placeholder:text-gray-400 h-8"
                        />
                        <button className="bg-[var(--color-primary)] text-white px-4 h-8 rounded-md text-[11px] font-bold hover:bg-[var(--color-primary-hover)] transition-all transform active:scale-95 uppercase tracking-wide">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
