'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { Home, Bookmark, Bell, MessageSquare, BadgeCheck, Plus, User } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { chatConfig } from '@/config/chatConfig';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

export const MobileTopNav = () => {
    const user = useAppSelector((state: RootState) => state.user.user);
    const { unreadCount, unreadMessages } = useAppSelector((state: RootState) => state.notifications);

    return (
        <nav className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4">
            {/* Left: Profile */}
            <Link href={user?.handle ? `/u/${user.handle}` : '/login'} className="flex items-center gap-3 active:opacity-70 transition-opacity">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-gray-900 leading-none">{user?.name || 'Guest'}</span>
                        {user?.verified && (
                            <BadgeCheck className="h-[14px] w-[14px] text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                        )}
                    </div>
                    <span className="text-[11px] text-gray-500 font-bold leading-none mt-0.5">@{user?.handle || 'guest'}</span>
                </div>
            </Link>

            {/* Right: Notifications & Messages */}
            <div className="flex items-center gap-3">
                <Link href="/notifications" className="text-gray-900 relative p-1">
                    <Bell className="h-6 w-6 stroke-[2]" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border border-white">
                            {unreadCount > 50 ? '50+' : unreadCount}
                        </span>
                    )}
                </Link>
                <Link href="/messages" className="text-gray-900 relative p-1">
                    <MessageSquare className="h-6 w-6 stroke-[2]" />
                    {unreadMessages > 0 && (
                        <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border border-white">
                            {unreadMessages > 50 ? '50+' : unreadMessages}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
};

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const user = useAppSelector((state: RootState) => state.user.user);
    const { unreadCount } = useAppSelector((state: RootState) => state.notifications);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const NAV_ITEMS = [
        { icon: Home, label: 'Feed', route: '/feed' },
        { icon: Bookmark, label: 'Saved', route: '/saved' },
        { icon: Plus, label: 'Create', route: '#', isAction: true },
        { icon: Bell, label: 'Notifications', route: '/notifications', badge: unreadCount },
        { icon: User, label: 'Profile', route: user?.handle ? `/u/${user.handle}` : '/login', verified: user?.verified },
    ];

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-2 pb-safe">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.route;

                    if (item.isAction) {
                        return (
                            <button
                                key={item.label}
                                onClick={() => setIsPostModalOpen(true)}
                                className="flex items-center justify-center h-11 w-11 bg-[var(--color-primary)] text-white rounded-full shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all -mt-4 border-4 border-white"
                            >
                                <Plus className="h-7 w-7 stroke-[3]" />
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.route}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all relative ${
                                isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'
                            }`}
                        >
                            <div className="relative">
                                <item.icon 
                                    className={`h-6 w-6 transition-all ${isActive ? 'stroke-[2.5px] fill-current scale-110' : 'stroke-[2px]'}`} 
                                />
                                {(item as any).badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full border border-white">
                                        {(item as any).badge > 50 ? '50+' : (item as any).badge}
                                    </span>
                                )}
                                {(item as any).verified && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                        <BadgeCheck className="h-3 w-3 text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <CreatePostModal 
                isOpen={isPostModalOpen} 
                onClose={() => setIsPostModalOpen(false)} 
            />
        </>
    );
};
