'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { Community } from './data';
import { Lock, Globe } from 'lucide-react';

interface CommunityCardProps {
    community: Community;
}

export const CommunityCard = ({ community }: CommunityCardProps) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 group flex flex-col h-full">
            {/* Cover Image Container - Smaller Height */}
            <div className="h-[140px] relative w-full bg-gray-200">
                <Image
                    src={community.coverImage}
                    alt={community.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Badge - Smaller */}
                <div className="absolute top-3 right-3 z-10">
                    <div className={cn(
                        "px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md border",
                        community.isPrivate
                            ? "bg-black/60 text-white border-white/20"
                            : "bg-white/90 text-gray-800 border-white/50"
                    )}>
                        {community.isPrivate ? (
                            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                        ) : (
                            <Globe className="h-2.5 w-2.5" strokeWidth={2.5} />
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-wider leading-none pt-0.5">
                            {community.isPrivate ? 'Private' : 'Public'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Body - Compact Padding */}
            <div className="px-5 pb-5 flex-1 flex flex-col relative w-full">

                {/* Avatar Overlap - Slightly less aggressive overlap, smaller size */}
                <div className="relative -mt-8 mb-3 w-full">
                    <div className="h-[52px] w-[52px] rounded-full p-0.5 bg-white inline-block ring-2 ring-white relative z-10">
                        <div className="h-full w-full rounded-full overflow-hidden relative bg-gray-100">
                            <Image
                                src={community.avatar}
                                alt={community.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-[var(--color-primary)] transition-colors tracking-tight">
                    {community.name}
                </h3>

                {/* Metadata Line */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span>{community.members}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-gray-300"></span>
                    <span>{community.tagStr}</span>
                </p>

                {/* Description */}
                <p className="text-[12px] text-gray-600 leading-relaxed mb-5 line-clamp-2 font-medium">
                    {community.description}
                </p>

                {/* Footer Button - Compact */}
                <div className="mt-auto w-full">
                    <button className={cn(
                        "w-full py-2.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98] uppercase tracking-wide",
                        community.isPrivate
                            ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                    )}>
                        {community.actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
