'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { FeedPost } from '@/components/feed/FeedPost';
import { PostSkeleton } from '@/components/feed/PostSkeleton';
import { StoryReel } from '@/components/feed/StoryReel';
import { getFeed } from '@/services/feedService';
import { appendFeed } from '@/store/features/postSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { cn } from '@/utils/cn';

interface FeedMeta {
    cursor: string | null;
    hasMore: boolean;
    loading: boolean;
}

function useInfiniteScroll(onIntersect: () => void | Promise<void>, containerRef: React.RefObject<any>) {
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const callbackRef = useRef(onIntersect);

    useEffect(() => {
        callbackRef.current = onIntersect;
    }, [onIntersect]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                callbackRef.current();
            }
        }, {
            root: containerRef.current,
            rootMargin: '100px'
        });

        const element = loaderRef.current;
        if (element) observer.observe(element);
        return () => {
            if (element) observer.unobserve(element);
        };
    }, [containerRef]);

    return loaderRef;
}

export default function FeedPage() {
    const dispatch = useAppDispatch();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const posts = useAppSelector((state: RootState) =>
        state.posts.feedIds.map((id) => state.posts.byId[id])
    );

    const firstPostId = posts[0]?.id;
    const prevFirstPostIdRef = useRef(firstPostId);

    // Scroll to top when a new post is added
    useEffect(() => {
        if (firstPostId && prevFirstPostIdRef.current && firstPostId !== prevFirstPostIdRef.current) {
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        prevFirstPostIdRef.current = firstPostId;
    }, [firstPostId]);

    const [meta, setMeta] = useState<FeedMeta>({
        cursor: null,
        hasMore: true,
        loading: false,
    });

    const metaRef = useRef(meta);
    useEffect(() => {
        metaRef.current = meta;
    }, [meta]);

    const fetchFeed = useCallback(async () => {
        const { loading, hasMore, cursor } = metaRef.current;
        if (loading || !hasMore) return;

        setMeta((prev) => ({ ...prev, loading: true }));

        try {
            const response = await getFeed(cursor ?? undefined);
            const posts = response.posts.map((post: any) => ({
                ...post,
                id: post._id,
            }));

            dispatch(appendFeed({ posts }));
            setMeta({
                cursor: response.nextCursor,
                hasMore: response.hasMore,
                loading: false,
            });
        } catch (error) {
            console.error(error);
            setMeta((prev) => ({ ...prev, loading: false }));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const loaderRef = useInfiniteScroll(fetchFeed, scrollRef);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        setShowScrollTop(scrollRef.current.scrollTop > 1000);
    };

    return (
        <main
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 flex flex-col gap-2 max-w-[740px] mx-auto w-full pt-14 md:pt-4 pb-20 h-full overflow-y-auto no-scrollbar px-3 md:px-0 relative"
        >
            <StoryReel />

            <div className="flex flex-col gap-4 pb-4">
                {posts.map((post) => (
                    <FeedPost key={post.id} post={post} />
                ))}

                {meta.loading && (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                )}
            </div>

            <div ref={loaderRef} />

            {!meta.hasMore && (
                <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">End of feed</p>
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                    </div>
                </div>
            )}

            {/* Go to Top Button */}
            <button
                onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                    "fixed bottom-24 right-6 md:right-[calc(50%-370px-60px)] w-11 h-11 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)] transition-all duration-300 z-50 border border-gray-100 active:scale-90",
                    showScrollTop ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-50 pointer-events-none"
                )}
            >
                <ChevronUp className="h-6 w-6 stroke-[2.5]" />
            </button>
        </main>
    );
}