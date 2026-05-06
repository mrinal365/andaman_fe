'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils';
import { TOKEN_KEY } from '@/constants';

export default function Home() {
    const router = useRouter();
    
    useEffect(() => {
        const token = getCookie(TOKEN_KEY);
        if (token) {
            router.replace('/feed');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
