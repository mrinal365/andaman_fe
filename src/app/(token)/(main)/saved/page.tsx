'use client'

import { FeedPost } from '@/components/feed/FeedPost';
import { getSavedPosts } from '@/services/feedService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Use a separate slice of feedIds for saved posts
export default function SavedPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const loaderRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const cursorRef = useRef<string | null>(null);

    useEffect(() => {
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        cursorRef.current = cursor;
    }, [loading, hasMore, cursor]);

    const fetchSaved = async (cursorParam?: string | null) => {
        if (loadingRef.current) return;

        setLoading(true);
        try {
            const res = await getSavedPosts(cursorParam || undefined);
            const normalizedPosts = res.posts.map((p: any) => ({
                ...p,
                id: p._id,
            }));

            setSavedPosts((prev) =>
                cursorParam ? [...prev, ...normalizedPosts] : normalizedPosts
            );
            setCursor(res.nextCursor);
            setHasMore(res.hasMore);
        } catch (err) {
            console.error('Failed to fetch saved posts', err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchSaved();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (
                entry.isIntersecting &&
                hasMoreRef.current &&
                !loadingRef.current
            ) {
                fetchSaved(cursorRef.current);
            }
        });

        const el = loaderRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, []);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-white no-scrollbar">
            {/* Header Section (Sticky) */}
            <div className="sticky top-0 shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-md z-30">
                <div className="px-4 py-2 flex items-center justify-between min-h-[53px]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-900" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[19px] font-black text-gray-900 tracking-tight leading-tight">Saved Posts</h1>
                            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Bookmarks</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[740px] mx-auto w-full pt-8 pb-20 px-3 md:px-0">

            {initialLoad ? (
                <div className="flex justify-center py-20">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />
                </div>
            ) : savedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Bookmark className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-500">No saved posts yet</p>
                    <p className="text-[13px] text-gray-400">Bookmark posts from your feed to see them here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4 pb-10">
                    {savedPosts.map((post) => (
                        <FeedPost key={post.id} post={post} />
                    ))}
                </div>
            )}

            <div ref={loaderRef} />

            {loading && !initialLoad && (
                <p className="text-center text-gray-500">Loading...</p>
            )}

            {!hasMore && savedPosts.length > 0 && (
                <p className="text-center text-gray-400 pb-6">
                    No more saved posts
                </p>
            )}
        </main>
        </div>
    );
}
