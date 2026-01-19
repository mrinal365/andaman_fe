'use client';

import { useState } from 'react';
import { ArrowUpRight, Bell, Check, X } from 'lucide-react';
import { POPULAR_COMMUNITIES, INVITES_DATA } from './data';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';

export const PopularCommunities = () => {
    const [activeTab, setActiveTab] = useState<'my_communities' | 'invites'>('my_communities');

    const getUnreadCount = (id: string) => {
        if (activeTab === 'invites') return 0;
        const count = id.charCodeAt(0) % 5;
        return count > 3 ? 0 : count + 1;
    };

    const data = activeTab === 'my_communities' ? POPULAR_COMMUNITIES : INVITES_DATA;

    return (
        // Changed bg to match main content if needed, but sidebar is usually distinct. 
        // User asked for "white background" for the Page. Sidebar is usually white too.
        <div className="bg-white rounded-xl p-4 border border-gray-100 sticky top-4 w-full h-[calc(100vh-40px)] flex flex-col">

            {/* Header with Toggle */}
            <div className="flex flex-col gap-3 mb-3 shrink-0">
                <div className="flex items-center justify-between">
                    {/* Toggle Buttons */}
                    <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg w-full">
                        <button
                            onClick={() => setActiveTab('my_communities')}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all text-center uppercase tracking-wide",
                                activeTab === 'my_communities'
                                    ? "bg-white text-gray-900 border border-gray-200"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            My Communities
                        </button>
                        <button
                            onClick={() => setActiveTab('invites')}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all text-center uppercase tracking-wide",
                                activeTab === 'invites'
                                    ? "bg-white text-gray-900 border border-gray-200"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Invites
                            {/* Optional Badge for Invites */}
                            <span className="ml-1 text-[var(--color-primary)]">{INVITES_DATA.length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {data.map((group) => {
                    const unread = getUnreadCount(group.id);
                    return (
                        <div key={group.id} className="flex items-center justify-between group cursor-pointer w-full p-2 hover:bg-gray-50 rounded-lg transition-all">
                            {/* Avatar & Text Container - Used min-w-0 to allow text truncation */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="shrink-0 relative">
                                    {group.avatar ? (
                                        <Avatar src={group.avatar} name={group.name} size="sm" className="h-9 w-9 rounded-lg" />
                                    ) : (
                                        <div className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-700",
                                            group.color || "bg-gray-100"
                                        )}>
                                            {group.name.substring(0, 1)}
                                        </div>
                                    )}

                                    {unread > 0 && activeTab === 'my_communities' && (
                                        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[var(--color-primary)] flex items-center justify-center border border-white">
                                            <span className="text-[8px] font-bold text-white">{unread}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <h3 className="text-[11px] font-bold text-gray-900 leading-none truncate group-hover:text-[var(--color-primary)] transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className={cn(
                                        "text-[9px] font-medium mt-1 truncate",
                                        unread > 0 ? "text-[var(--color-primary)] font-bold" : "text-gray-400"
                                    )}>
                                        {activeTab === 'invites'
                                            ? group.members // "Invite from Mark"
                                            : (unread > 0 ? `${unread} new posts` : group.members)
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="shrink-0 flex items-center gap-1 ml-2">
                                {activeTab === 'my_communities' ? (
                                    <button className="h-7 w-7 rounded-md text-gray-300 flex items-center justify-center group-hover:bg-white group-hover:text-[var(--color-primary)] transition-all shrink-0">
                                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </button>
                                ) : (
                                    <>
                                        <button className="h-7 w-7 rounded-md bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex items-center justify-center transition-all">
                                            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        </button>
                                        <button className="h-7 w-7 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white flex items-center justify-center transition-all">
                                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Removed Footer as requested */}
        </div>
    );
};
