'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { dismissToast } from '@/store/features/notificationSlice';
import { Avatar } from '@/components/common/Avatar';
import { Heart, MessageCircle, UserPlus, Repeat2, Bell } from 'lucide-react';
import { cn } from '@/utils/cn';
import { renderTextWithTags } from '@/utils/textParser';

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    likePost: { icon: Heart, color: 'text-red-500', label: 'liked your post' },
    likeComment: { icon: Heart, color: 'text-red-400', label: 'liked your comment' },
    comment: { icon: MessageCircle, color: 'text-blue-500', label: 'commented on your post' },
    reply: { icon: MessageCircle, color: 'text-blue-400', label: 'replied to your comment' },
    follow: { icon: UserPlus, color: 'text-green-500', label: 'started following you' },
    resharePost: { icon: Repeat2, color: 'text-purple-500', label: 'reshared your post' },
    message: { icon: MessageCircle, color: 'text-gray-600', label: 'sent you a message' },
};

const NotificationToast = ({ notification }: { notification: any }) => {
    const dispatch = useAppDispatch();
    const config = TYPE_CONFIG[notification.type] || { icon: Bell, color: 'text-gray-600', label: '' };
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(dismissToast(notification._id));
        }, 4000);
        return () => clearTimeout(timer);
    }, [notification._id, dispatch]);

    return (
        <div
            className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 w-[320px] animate-in slide-in-from-right-5 fade-in duration-300 cursor-pointer"
            onClick={() => dispatch(dismissToast(notification._id))}
        >
            {/* Avatar with icon badge */}
            <div className="relative shrink-0">
                <Avatar
                    src={notification.sender?.avatar}
                    name={notification.sender?.name}
                    size="sm"
                />
                <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-sm"
                )}>
                    <Icon className={cn("h-2.5 w-2.5", config.color)} />
                </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-900 leading-snug">
                    <span className="font-bold">{notification.sender?.name || 'Someone'}</span>
                    {' '}
                    <span className="text-gray-600">{config.label}</span>
                </p>
                {notification.body && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{renderTextWithTags(notification.body)}</p>
                )}
            </div>
        </div>
    );
};

/**
 * Renders floating toast notifications in the bottom-right corner.
 * Mount this once at app level (in token layout).
 */
export const NotificationToastContainer = () => {
    const toastQueue = useAppSelector((state: RootState) => state.notifications.toastQueue);

    if (!toastQueue.length) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
            {toastQueue.map((n) => (
                <div key={n._id} className="pointer-events-auto">
                    <NotificationToast notification={n} />
                </div>
            ))}
        </div>
    );
};
