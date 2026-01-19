'use client';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
    Bell,
    Compass,
    BookOpen,
    Home,
    MessageSquare,
    Settings,
    Users,
    Waves,
    PenTool,
    Cloud,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
    { icon: Home, label: 'Feed', route: '/feed' },
    { icon: BookOpen, label: 'Guides', route: '/guides' },
    { icon: Compass, label: 'Explore', route: '/explore' },
    { icon: Users, label: 'Communities', route: '/communities' },
    { icon: MessageSquare, label: 'Messages', route: '/messages' },
    { icon: Bell, label: 'Notifications', route: '/notifications' },
    { icon: Settings, label: 'Settings', route: '/settings' },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="sticky top-0 h-screen w-[260px] flex flex-col gap-6 overflow-y-auto no-scrollbar py-6">
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Waves className="h-6 w-6 fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">Andaman</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.route;
                    const baseClasses = "inline-flex items-center justify-start gap-4 px-6 text-[15px] font-semibold tracking-normal rounded-xl transition-colors focus-visible:outline-none w-full h-[46px]";
                    const variantClasses = isActive
                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50';

                    return (
                        <Link
                            key={item.label}
                            href={item.route}
                            className={`${baseClasses} ${variantClasses}`}
                        >
                            <item.icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* New Post Button */}
            <Button variant="primary" size="lg" className="mt-auto w-full gap-2 rounded-xl h-[44px] shrink-0">
                <Plus className="h-5 w-5 stroke-[3]" />
                <span className="text-[14px] font-bold tracking-wide">New Post</span>
            </Button>

            {/* Weather Widget (Bottom Left in design) */}
            <Card className="bg-[#F8F9FA]/60 border-0 shadow-none border-[1px] border-gray-200 border shrink-0" padding="md">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-[17px] text-gray-900 leading-none">Sri Vijaya Puram - Port Blair, Andaman</h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-1">Clear Sky</p>
                    </div>
                    {/* <Cloud className="h-5 w-5 text-gray-400 fill-gray-100" /> */}
                </div>
                <div className="text-[32px] font-bold text-gray-900 mb-6 tracking-tight">72°</div>

                <div className="flex justify-between text-center gap-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => (
                        <div key={day} className="flex flex-col items-center gap-1.5">
                            <span className="text-[9px] font-bold text-gray-400 tracking-wider">{day}</span>
                            <Cloud className="h-2.5 w-2.5 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-600">
                                {[68, 74, 70, 75, 65][i]}°
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </aside>
    );
};
