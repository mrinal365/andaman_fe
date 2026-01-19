import { TopNavbar } from '@/components/layout/TopNavbar';

export default function SubpageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full bg-white flex justify-center overflow-hidden">
            {/* Central Page Container */}
            <div className="w-full max-w-[1440px] bg-white border-x border-gray-100 flex flex-col h-full relative">
                <TopNavbar />
                <main className="flex-1 w-full relative overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
