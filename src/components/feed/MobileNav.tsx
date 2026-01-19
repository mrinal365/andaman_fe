'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Compass, Users, Settings, Bell, MessageSquare, BadgeCheck, Plus } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';

export const MobileTopNav = () => {
    return (
        <nav className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4">
            {/* Left: Profile */}
            <div className="flex items-center gap-3">
                <Avatar src="https://i.pravatar.cc/150?u=me" size="sm" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 leading-none">Jane Doe</span>
                        <BadgeCheck className="h-[14px] w-[14px] text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">@janedoe</span>
                </div>
            </div>

            {/* Right: Notifications & Messages */}
            <div className="flex items-center gap-4">
                <Link href="/notifications" className="text-gray-600 hover:text-gray-900">
                    <Bell className="h-6 w-6" />
                </Link>
                <Link href="/messages" className="text-gray-600 hover:text-gray-900">
                    <MessageSquare className="h-6 w-6" />
                </Link>
            </div>
        </nav>
    );
};

export const MobileBottomNav = () => {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { icon: Home, label: 'Feed', route: '/feed' },
        { icon: BookOpen, label: 'Guide', route: '/guides' },
        { icon: Plus, label: 'Create', route: '/create', isAction: true },
        { icon: Compass, label: 'Explore', route: '/explore' },
        { icon: Users, label: 'Communities', route: '/communities' },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-2 pb-safe">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.route;

                if (item.isAction) {
                    return (
                        <Link
                            key={item.label}
                            href={item.route}
                            className="flex items-center justify-center h-10 w-10 bg-[var(--color-primary)] text-white rounded-full shadow-sm active:scale-95 transition-all"
                        >
                            <item.icon className="h-6 w-6 stroke-[2.5]" />
                        </Link>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.route}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px] fill-current' : 'stroke-[2px]'}`} />
                    </Link>
                );
            })}
        </nav>
    );
};
