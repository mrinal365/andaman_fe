'use client';

import { Sidebar } from '@/components/feed/Sidebar';
import { RightSidebar } from '@/components/feed/RightSidebar';
import { MobileTopNav, MobileBottomNav } from '@/components/feed/MobileNav';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Pages that have their own custom headers/back buttons
    const hideTopNav = pathname.startsWith('/post/') || pathname === '/notifications';

    return (
        <div className="h-screen bg-white flex justify-center w-full overflow-hidden">
            {!hideTopNav && <MobileTopNav />}

            <div className={`flex w-full max-w-[1440px] gap-0 lg:gap-4 px-0 lg:px-4 h-full border-x border-gray-100 ${!hideTopNav ? 'pt-14 lg:pt-0' : 'pt-0'}`}>
                {/* Left Navigation (Common) */}
                <div className="hidden lg:block w-[260px] shrink-0 h-full">
                    <Sidebar />
                </div>

                {/* Main Content Area (Flexible center) */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                    {children}
                </div>

                {/* Desktop sidebar (Right) */}
                <div className="hidden xl:block w-[380px] shrink-0 h-full">
                    <RightSidebar />
                </div>
            </div>

            <MobileBottomNav />
        </div>
    );
}
