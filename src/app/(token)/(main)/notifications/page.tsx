'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import {
    setNotifications,
    appendNotifications,
    markOneRead,
    markAllRead,
    markMultipleReadOptimistic,
    removeNotification,
} from '@/store/features/notificationSlice';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    markMultipleNotificationsRead,
    deleteNotification,
} from '@/services/notificationService';

import { NotificationItem } from '@/components/notifications/NotificationItem';
import { cn } from '@/utils/cn';
import { Loader2, ArrowLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FILTERS = ['All', 'Likes', 'Comments', 'Follows', 'Messages'];

const TYPE_FILTER_MAP: Record<string, string[]> = {
    Likes:    ['likePost', 'likeComment'],
    Comments: ['comment', 'reply'],
    Follows:  ['follow'],
    Messages: ['message'],
};

export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { items, hasMore, page, unreadCount } = useAppSelector((state: RootState) => state.notifications);

    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, page]);
    
    // Filter items client-side
    const filtered = items.filter((n) => {
        if (filter === 'All') return true;
        const types = TYPE_FILTER_MAP[filter];
        return types ? types.includes(n.type) : true;
    });
    
    // Viewport-based mark as read logic
    const observer = useRef<IntersectionObserver | null>(null);
    const pendingMarkRead = useRef<Set<string>>(new Set());
    const markReadTimer = useRef<NodeJS.Timeout | null>(null);

    const flushMarkRead = useCallback(async () => {
        const ids = Array.from(pendingMarkRead.current);
        if (ids.length === 0) return;

        pendingMarkRead.current.clear();
        dispatch(markMultipleReadOptimistic(ids));
        await markMultipleNotificationsRead(ids).catch(() => {});
    }, [dispatch]);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('data-id');
                const isRead = entry.target.getAttribute('data-read') === 'true';
                if (id && !isRead) {
                    pendingMarkRead.current.add(id);
                    
                    if (markReadTimer.current) clearTimeout(markReadTimer.current);
                    markReadTimer.current = setTimeout(flushMarkRead, 1500); // 1.5s delay before marking
                }
            }
        });
    }, [flushMarkRead]);

    const containerNode = useRef<HTMLDivElement | null>(null);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        containerNode.current = node;
    }, []);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();
        
        if (containerNode.current) {
            observer.current = new IntersectionObserver(handleIntersection, {
                root: containerNode.current.parentElement,
                threshold: 0.6,
            });
            
            const unreadItems = containerNode.current.querySelectorAll('[data-read="false"]');
            unreadItems.forEach((el) => observer.current?.observe(el));
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [filtered, handleIntersection]);

    const fetchInitial = async () => {
        setIsLoading(true);
        try {
            const res = await getNotifications(1, 20);
            dispatch(setNotifications({
                notifications: res.notifications,
                hasMore: res.pagination.hasMore,
                unreadCount: res.unreadCount,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitial();
        return () => {
            if (markReadTimer.current) clearTimeout(markReadTimer.current);
        };
    }, []);


    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await getNotifications(page + 1, 20);
            dispatch(appendNotifications({
                notifications: res.notifications,
                hasMore: res.pagination.hasMore,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        dispatch(markOneRead(id));
        await markNotificationRead(id).catch(() => {});
    };

    const handleMarkAllRead = async () => {
        dispatch(markAllRead());
        await markAllNotificationsRead().catch(() => {});
    };

    const handleDelete = async (id: string) => {
        dispatch(removeNotification(id));
        await deleteNotification(id).catch(() => {});
    };


    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white scroll-smooth no-scrollbar flex flex-col">
            {/* Header Section (Sticky) */}
            <div className="sticky top-0 shrink-0 border-b border-gray-100 bg-white/90 backdrop-blur-xl z-30">
                <div className="px-4 py-2 flex items-center justify-between min-h-[53px]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-900" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[19px] font-black text-gray-900 tracking-tight leading-tight">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold animate-pulse">
                                        {unreadCount > 50 ? '50+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Activity History</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider px-2"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="px-6 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap shadow-sm border",
                                filter === f
                                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                    : "text-gray-500 hover:text-gray-900 bg-white border-gray-100"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col w-full">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] opacity-40" />
                        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Inbox</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-40 px-10 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Bell className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Your inbox is empty</h2>
                        <p className="text-sm font-medium text-gray-400">Notifications about your activity and network will appear here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col w-full" ref={containerRef}>
                        {filtered.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Trigger & Spinner */}
                <div 
                    ref={loadMoreRef} 
                    className={cn(
                        "w-full py-10 flex flex-col items-center justify-center transition-opacity duration-300",
                        !hasMore && filtered.length > 0 ? "opacity-100" : "opacity-100"
                    )}
                >
                    {isLoadingMore && (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)] mb-2" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching more...</p>
                        </>
                    )}
                    
                    {!isLoading && !hasMore && filtered.length > 0 && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-px w-12 bg-gray-100" />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">End of activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
