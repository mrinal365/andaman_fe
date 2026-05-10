import { SubpageNavbar } from '@/components/layout/SubpageNavbar';

export default function SubpageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full bg-white flex justify-center overflow-hidden">
            {/* Central Page Container */}
            <div className="w-full max-w-[1440px] bg-white border-x border-gray-100 flex flex-col h-full relative">
                <SubpageNavbar />
                <main className="flex-1 w-full relative overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
