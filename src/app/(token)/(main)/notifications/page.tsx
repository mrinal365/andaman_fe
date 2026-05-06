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
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FILTERS = ['All', 'Unread', 'Likes', 'Comments', 'Follows', 'Messages'];

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

    const [filter, setFilter] = useState('Unread');
    const [isLoading, setIsLoading] = useState(true);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Filter items client-side
    const filtered = items.filter((n) => {
        if (filter === 'All') return true;
        if (filter === 'Unread') return !n.read;
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
                            <div className="flex items-center gap-2">
                                <h1 className="text-[19px] font-black text-gray-900 tracking-tight leading-tight">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                                        {unreadCount > 50 ? '50+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Activity</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider px-2"
                        >
                            Mark all as read
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
                                "px-3.5 py-1 rounded-full text-[12px] font-medium transition-all whitespace-nowrap",
                                filter === f
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <p className="text-sm font-medium text-gray-400">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col" ref={containerRef}>
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


                    {/* Load More */}
                    {!isLoading && hasMore && (
                        <div className="p-6 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="px-4 py-2 rounded-full border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                    </span>
                                ) : 'Load more'}
                            </button>
                        </div>
                    )}

                    {!isLoading && !hasMore && filtered.length > 0 && (
                        <div className="p-8 text-center">
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">End of notifications</p>
                        </div>
                    )}
                </div>
        </div>
    );
}
