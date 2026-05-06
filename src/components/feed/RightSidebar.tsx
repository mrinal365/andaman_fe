'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { ChevronDown, Layout, Coffee, Leaf, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { chatConfig } from '@/config/chatConfig';
import { ComingSoonPoster } from '@/components/common/ComingSoonPoster';
import { NewsWidget, EventsWidget } from '@/components/layout/CommonWidgets';
import { useLogout } from '@/hooks/useLogout';

const COMMUNITIES = [
    { name: 'UI/UX Designers', members: '12k', icon: Layout },
    { name: 'Minimalist Living', members: '8.5k', icon: Coffee },
    { name: 'Yoga & Wellness', members: '5.2k', icon: Leaf },
];

export const RightSidebar = () => {
    const user = useAppSelector((state) => state.user.user);
    const [isProfileExpanded, setIsProfileExpanded] = useState(true);
    const { logout } = useLogout();

    return (
        <aside className="h-full w-full flex flex-col gap-4 overflow-y-auto no-scrollbar pt-6 pb-4">
            <Card
                className="group relative flex flex-col rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 bg-white transition-all overflow-hidden cursor-pointer active:scale-[0.99] shrink-0"
                padding="none"
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
                <div className="flex items-center gap-3 py-2.5 px-4 w-full">
                    <Avatar name={user?.name} src={user?.avatar} size="md" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[14px] text-gray-900 leading-tight">{user?.name}</h4>
                        <p className="text-[12px] text-gray-400 font-medium">@{user?.handle}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); logout(); }}
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mr-1"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 stroke-[2]" />
                    </button>
                    <ChevronDown
                        className={cn(
                            "h-5 w-5 text-gray-400 stroke-[1.5] transition-transform duration-300",
                            isProfileExpanded ? "rotate-180 text-[var(--color-primary)]" : ""
                        )}
                    />
                </div>

                <div className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-in-out",
                    isProfileExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}>
                    <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-50">
                            {user?.bio && (
                                <p className="text-[12px] text-gray-600 font-medium leading-relaxed pt-2">
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {user?.tags && user.tags.length > 0 ? (
                                    user.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-gray-50 text-gray-900 border-gray-200 uppercase tracking-tighter">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-300 italic">- no tags</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-center">
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">{user?.stats?.posts}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Posts</div>
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">{user?.stats?.followers}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Followers</div>
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">{user?.stats?.following}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Following</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <NewsWidget />
            <EventsWidget />

            <Card className="p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">COMMUNITIES</h3>
                </div>
                {chatConfig.comingSoon.communities ? (
                    <ComingSoonPoster
                        compact
                        title="Communities Coming Soon"
                        description="Join groups that share your passions."
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        {COMMUNITIES.map((c) => (
                            <div key={c.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                        <c.icon className="h-5 w-5 text-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[14px] text-gray-900">{c.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">{c.members} members</p>
                                    </div>
                                </div>
                                <button className="h-[28px] px-4 rounded-full border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-50 bg-white transition-colors">
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </aside>
    );
};
