'use client';

import { useState } from 'react';
import { CommunityHero } from '@/components/communities/CommunityHero';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { COMMUNTIES_DATA, FILTERS } from '@/components/communities/data';
import { cn } from '@/utils/cn';
import { chatConfig } from '@/config/chatConfig';
import { ComingSoonPoster } from '@/components/common/ComingSoonPoster';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommunitiesPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('All Coastal');

    if (chatConfig.comingSoon.communities) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6 bg-gray-50">
                <ComingSoonPoster 
                    title="Communities Coming Soon"
                    description="We're building a vibrant space for islanders to connect, share, and grow together. Join us soon!"
                    className="max-w-xl w-full shadow-2xl shadow-blue-500/5"
                />
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto bg-white no-scrollbar">
            {/* Header Section (Sticky) */}
            <div className="sticky top-0 shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-md z-30">
                <div className="px-4 py-2 flex items-center justify-between min-h-[53px]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-900" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[19px] font-black text-gray-900 tracking-tight leading-tight">Communities</h1>
                            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Connect</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[740px] mx-auto w-full pt-8 pb-20 px-3 md:px-0">
                {/* Hero */}
                <CommunityHero />

                {/* Filters - Extremely Compact */}
                <div className="my-4 overflow-x-auto no-scrollbar py-0.5">
                    <div className="flex items-center gap-1.5">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border shadow-sm",
                                    activeFilter === filter
                                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                        : "bg-white text-gray-600 border-gray-50 hover:border-gray-200 hover:text-gray-900 hover:shadow-sm"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid - Gap 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {COMMUNTIES_DATA.map((community) => (
                        <CommunityCard key={community.id} community={community} />
                    ))}
                </div>
            </div>
        </div>
    );
}
