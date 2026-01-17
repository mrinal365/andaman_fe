import { Sidebar } from '@/components/feed/Sidebar';
import { MobileTopNav, MobileBottomNav } from '@/components/feed/MobileNav';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white flex justify-center w-full">
            <MobileTopNav />

            <div className="flex w-full max-w-[1280px] gap-8 px-0 lg:px-6 pt-0 lg:pt-0 pb-0 lg:pb-0">
                {/* Left Navigation (Common) */}
                <div className="hidden lg:block w-[280px] pr-8 shrink-0">
                    <Sidebar />
                </div>

                {/* Main Content Area */}
                {children}
            </div>

            <MobileBottomNav />
        </div>
    );
}
