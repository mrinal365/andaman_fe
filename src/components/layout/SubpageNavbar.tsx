'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Waves } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import Link from 'next/link';

export const SubpageNavbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state: RootState) => state.user.user);

    // Generate a simple title from pathname
    const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';

    return (
        <header className="h-[60px] w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-900" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-[17px] font-black text-gray-900 leading-none capitalize">{pageTitle}</h1>
                    <Link href="/feed" className="text-[11px] text-[var(--color-primary)] font-bold hover:underline">
                        Back to Feed
                    </Link>
                </div>
            </div>

            {/* Right: User Details */}
            <Link href={user?.handle ? `/u/${user.handle}` : '/login'} className="flex items-center gap-3 active:opacity-70 transition-opacity">
                <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[13px] font-black text-gray-900 leading-none">{user?.name || 'Guest'}</span>
                    <span className="text-[11px] text-gray-400 font-bold leading-none mt-1">@{user?.handle || 'guest'}</span>
                </div>
                <Avatar src={user?.avatar} name={user?.name} size="sm" className="border border-gray-100 shadow-sm" />
            </Link>
        </header>
    );
};
