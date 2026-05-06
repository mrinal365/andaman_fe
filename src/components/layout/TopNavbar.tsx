'use client';
 
import { User } from '../../../types/user';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Waves, Users, MessageSquare, ChevronDown, LogOut } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { chatConfig } from '@/config/chatConfig';
import { useLogout } from '@/hooks/useLogout';

export const TopNavbar = () => {
    const pathname = usePathname();
    const { logout } = useLogout();
    const router = useRouter();

    const unreadNotifications = useAppSelector((state: RootState) => state.notifications.unreadCount);
    const unreadMessages     = useAppSelector((state: RootState) => state.notifications.unreadMessages);
    const currentUser        = useAppSelector((state: RootState) => state.user.user);



    const NAV_ITEMS = [
        { icon: Users,        route: '/communities',   badge: 0, comingSoon: chatConfig.comingSoon.communities },
        { icon: MessageSquare, route: '/messages',     badge: unreadMessages },
        { icon: Bell,          route: '/notifications', badge: unreadNotifications },
    ];

    return (
        <header className="h-[60px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
                <Link href="/feed" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Waves className="h-5 w-5 fill-current" />
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight hidden md:block">Andaman</span>
                </Link>
            </div>

            {/* Center: Navigation Icons */}
            <div className="flex items-center gap-1 md:gap-2 absolute left-1/2 -translate-x-1/2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.route);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.route}
                            href={item.route}
                            className={cn(
                                "h-10 w-10 md:h-10 md:w-14 flex items-center justify-center rounded-xl transition-all relative",
                                isActive
                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />

                            {item.badge > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                                    {item.badge > 50 ? '50+' : item.badge}
                                </span>
                            )}
                            {(item as any).comingSoon && (
                                <span className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded bg-blue-500 text-white text-[8px] font-black uppercase tracking-tighter shadow-sm border border-white">
                                    Soon
                                </span>
                            )}

                            {isActive && (
                                <span className="absolute -bottom-2.5 h-1 w-12 bg-[var(--color-primary)] rounded-t-full hidden md:block"></span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                    <Search className="h-4 w-4" />
                </button>
                <Link href={`/u/${currentUser?.handle}`} className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer">
                    <Avatar src={currentUser?.avatar} name={currentUser?.name} handle={currentUser?.handle} size="sm" />
                </Link>
                <button
                    onClick={logout}
                    className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
};
