'use client';

import { useState } from 'react';
import { CommunityHero } from '@/components/communities/CommunityHero';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { PopularCommunities } from '@/components/communities/PopularCommunities';
import { COMMUNTIES_DATA, FILTERS } from '@/components/communities/data';
import { cn } from '@/utils/cn';

export default function CommunitiesPage() {
    const [activeFilter, setActiveFilter] = useState('All Coastal');

    return (
        // Changed bg-[#FAFAFA] to bg-white
        <div className="h-full w-full overflow-y-auto bg-white no-scrollbar">
            <div className="w-full flex justify-center min-h-full pb-10">
                {/* Centered Content - Tighter Padding py-4 */}
                <div className="w-full max-w-[1440px] px-4 lg:px-6 py-4">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                        {/* Main Content (Left, 9 Cols) */}
                        <div className="lg:col-span-8 xl:col-span-9 w-full">
                            {/* Hero */}
                            <CommunityHero />

                            {/* Filters - Extremely Compact */}
                            <div className="mb-4 overflow-x-auto no-scrollbar py-0.5">
                                <div className="flex items-center gap-1.5">
                                    {FILTERS.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border shadow-sm",
                                                activeFilter === filter
                                                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                                    : "bg-white text-gray-600 border-gray-50 hover:border-gray-200 hover:text-gray-900 hover:shadow-sm" // borders made lighter/dimmer
                                            )}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Grid - Gap 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {COMMUNTIES_DATA.map((community) => (
                                    <CommunityCard key={community.id} community={community} />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar (Right, 3 Cols) - Sticky */}
                        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 w-full pl-0 sticky top-4">
                            <PopularCommunities />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
