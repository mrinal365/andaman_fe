import { Sidebar } from '@/components/feed/Sidebar';
import { MobileTopNav, MobileBottomNav } from '@/components/feed/MobileNav';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-white flex justify-center w-full overflow-hidden">
            <MobileTopNav />

            <div className="flex w-full max-w-[1440px] gap-0 lg:gap-4 px-0 lg:px-4 h-full border-x border-gray-100">
                {/* Left Navigation (Common) */}
                <div className="hidden lg:block w-[260px] shrink-0 h-full">
                    <Sidebar />
                </div>

                {/* Main Content Area */}
                {children}
            </div>

            <MobileBottomNav />
        </div>
    );
}
