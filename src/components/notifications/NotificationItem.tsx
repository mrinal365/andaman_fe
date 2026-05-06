import { Heart, MessageCircle, UserPlus, Repeat2, Bell, X, Share2, Tag } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';
import { renderTextWithTags } from '@/utils/textParser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmModal } from '@/components/common/ConfirmModal';

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

const DEPARTMENTS: Record<string, { label: string; color: string; bg: string }> = {
    likePost:    { label: 'LIKE',    color: 'text-red-600',    bg: 'bg-red-50' },
    likeComment: { label: 'LIKE',    color: 'text-red-600',    bg: 'bg-red-50' },
    comment:     { label: 'COMMENT', color: 'text-blue-600',   bg: 'bg-blue-50' },
    reply:       { label: 'COMMENT', color: 'text-blue-600',   bg: 'bg-blue-50' },
    tagComment:  { label: 'MENTION', color: 'text-orange-600', bg: 'bg-orange-50' },
    tagPost:     { label: 'MENTION', color: 'text-orange-600', bg: 'bg-orange-50' },
    follow:      { label: 'NETWORK', color: 'text-green-600',  bg: 'bg-green-50' },
    resharePost: { label: 'SHARE',   color: 'text-purple-600', bg: 'bg-purple-50' },
    message:     { label: 'CHAT',    color: 'text-gray-600',   bg: 'bg-gray-100' },
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    likePost:    { icon: Heart,          color: 'text-red-500',    bg: 'bg-red-50'    },
    likeComment: { icon: Heart,          color: 'text-red-400',    bg: 'bg-red-50'    },
    comment:     { icon: MessageCircle, color: 'text-blue-500',   bg: 'bg-blue-50'   },
    reply:       { icon: MessageCircle, color: 'text-blue-400',   bg: 'bg-blue-50'   },
    tagComment:  { icon: Tag,            color: 'text-orange-500', bg: 'bg-orange-50' },
    tagPost:     { icon: Tag,            color: 'text-orange-500', bg: 'bg-orange-50' },
    follow:      { icon: UserPlus,      color: 'text-green-500',  bg: 'bg-green-50'  },
    resharePost: { icon: Share2,        color: 'text-purple-500', bg: 'bg-purple-50' },
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
    const router = useRouter();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    
    const { _id, type, body, read, sender, createdAt, data } = notification;
    
    const config = TYPE_CONFIG[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
    const dept = DEPARTMENTS[type] || { label: 'SYSTEM', color: 'text-gray-600', bg: 'bg-gray-50' };
    const Icon = config.icon;

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Mark as read if unread
        if (!read) onMarkRead?.(_id);

        // Smart Navigation
        switch (type) {
            case 'likePost':
            case 'comment':
            case 'resharePost':
            case 'tagPost':
            case 'tagComment':
            case 'likeComment':
            case 'reply':
                if (data?.postId) router.push(`/post/${data.postId}`);
                break;
            case 'follow':
                if (sender?.handle) router.push(`/u/${sender.handle}`);
                break;
            case 'message':
                if (sender?._id) router.push(`/messages?u=${sender._id}`);
                break;
            default:
                if (sender?.handle) router.push(`/u/${sender.handle}`);
                break;
        }
    };

    return (
        <>
            <div
                data-id={_id}
                data-read={read}
                className={cn(
                    "flex items-start gap-4 py-4 px-5 border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group relative",
                    !read && "bg-[var(--color-primary)]/[0.03] shadow-[inset_3px_0_0_0_var(--color-primary)]"
                )}
                onClick={handleNavigate}
            >
                {/* Avatar with type icon badge */}
                <div className="relative shrink-0">
                    <Avatar 
                        src={sender?.avatar} 
                        name={sender?.name || '?'} 
                        size="md" 
                        className="h-11 w-11 shadow-sm border-2 border-white ring-1 ring-gray-100" 
                    />
                    <div className={cn(
                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-110", 
                        config.bg
                    )}>
                        <Icon className={cn("h-3 w-3", config.color)} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        {/* Department Chip */}
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full transition-all group-hover:shadow-sm",
                            dept.bg, dept.color
                        )}>
                            {dept.label}
                        </span>
                        <span className={cn(
                            "text-[10px] font-bold shrink-0",
                            !read ? "text-[var(--color-primary)]" : "text-gray-400"
                        )}>
                            {timeAgo(createdAt)}
                        </span>
                    </div>

                    <p className="text-[14px] text-gray-900 leading-snug">
                        {sender?.name && (
                            <span 
                                className="font-bold hover:text-[var(--color-primary)] hover:underline cursor-pointer transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (sender.handle) router.push(`/u/${sender.handle}`);
                                }}
                            >
                                {sender.name}
                            </span>
                        )}{' '}
                        <span className="text-gray-600 font-medium whitespace-pre-wrap">
                            {renderTextWithTags(body || '')}
                        </span>
                    </p>
                    
                    {data?.postId && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-primary)] opacity-80 hover:opacity-100 transition-opacity">
                            <Bell className="w-3 h-3" />
                            <span>View activity</span>
                        </div>
                    )}
                </div>

                {/* Delete button (visible on hover) */}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsDeleteConfirmOpen(true); }}
                        className="opacity-0 group-hover:opacity-100 transition-all h-8 w-8 rounded-xl bg-white shadow-lg border border-gray-100 flex items-center justify-center shrink-0 hover:bg-red-50 hover:border-red-100 hover:text-red-500"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={() => {
                    onDelete?.(_id);
                    setIsDeleteConfirmOpen(false);
                }}
                title="Delete Notification"
                message="Are you sure you want to remove this notification? This cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </>
    );
};
