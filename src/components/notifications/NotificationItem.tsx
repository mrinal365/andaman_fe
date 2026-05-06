'use client';

import { Heart, MessageCircle, UserPlus, Repeat2, Bell, X } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';
import { renderTextWithTags } from '@/utils/textParser';

interface NotificationItemProps {
    notification: {
        _id: string;
        type: string;
        title?: string;
        body?: string;
        read: boolean;
        sender?: {
            _id?: string;
            name?: string;
            avatar?: string;
            handle?: string;
        };
        createdAt: string;
        data?: Record<string, any>;
    };
    onMarkRead?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    likePost:    { icon: Heart,          color: 'text-red-500',    bg: 'bg-red-50'    },
    likeComment: { icon: Heart,          color: 'text-red-400',    bg: 'bg-red-50'    },
    comment:     { icon: MessageCircle, color: 'text-blue-500',   bg: 'bg-blue-50'   },
    reply:       { icon: MessageCircle, color: 'text-blue-400',   bg: 'bg-blue-50'   },
    follow:      { icon: UserPlus,      color: 'text-green-500',  bg: 'bg-green-50'  },
    resharePost: { icon: Repeat2,       color: 'text-purple-500', bg: 'bg-purple-50' },
    message:     { icon: MessageCircle, color: 'text-gray-500',   bg: 'bg-gray-100'  },
};

const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const NotificationItem = ({ notification, onMarkRead, onDelete }: NotificationItemProps) => {
    const { _id, type, body, read, sender, createdAt } = notification;
    const config = TYPE_CONFIG[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
    const Icon = config.icon;

    return (
        <div
            data-id={_id}
            data-read={read}
            className={cn(
                "flex items-start gap-3 py-3 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group relative",
                !read && "bg-[var(--color-primary)]/[0.02]"
            )}
            onClick={() => !read && onMarkRead?.(_id)}
        >
            {/* Unread Indicator */}
            {!read && (
                <span className="absolute left-1.5 top-4.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />
            )}

            {/* Avatar with type icon badge */}
            <div className="relative shrink-0">
                <Avatar src={sender?.avatar} name={sender?.name || '?'} size="md" className="h-9 w-9 text-xs" />
                <div className={cn("absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center shadow-sm border border-white", config.bg)}>
                    <Icon className={cn("h-2.5 w-2.5", config.color)} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[13px] text-gray-900 leading-snug">
                    {sender?.name && <span className="font-bold">{sender.name} </span>}
                    <span className="text-gray-600 whitespace-pre-wrap">{renderTextWithTags(body || '')}</span>
                </p>
                <p className={cn(
                    "text-[10px] font-medium mt-0.5",
                    !read ? "text-[var(--color-primary)]" : "text-gray-400"
                )}>
                    {timeAgo(createdAt)}
                </p>
            </div>

            {/* Delete button (visible on hover) */}
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(_id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0"
                >
                    <X className="h-3 w-3 text-gray-500" />
                </button>
            )}
        </div>
    );
};
