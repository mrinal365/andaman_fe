'use client';

import { Users, Shield, Calendar } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import Image from 'next/image';
import { Notification } from './data';
import { cn } from '@/utils/cn';

interface NotificationItemProps {
    notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
    const { type, actor, content, timestamp, isUnread, actionLabel, previewImage } = notification;

    // Helper to render the appropriate avatar or icon
    const renderAvatar = () => {
        if (type === 'trending') {
            return (
                <div className="h-9 w-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Users className="h-4.5 w-4.5 text-[var(--color-primary)]" />
                </div>
            );
        }
        if (type === 'system') {
            return (
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Shield className="h-4.5 w-4.5 text-gray-600" />
                </div>
            );
        }
        if (type === 'reminder') {
            return (
                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="h-4.5 w-4.5 text-blue-500" />
                </div>
            );
        }

        // Default Avatar
        return <Avatar src={actor.avatar} name={actor.name} size="md" className="h-9 w-9 text-xs" />;
    };

    return (
        <div className={cn(
            "flex items-start gap-3 py-3 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group relative",
            isUnread ? "bg-white" : "bg-white"
        )}>
            {/* Unread Indicator */}
            {isUnread && (
                <span className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></span>
            )}

            {/* Avatar/Icon */}
            {renderAvatar()}

            {/* Content Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[13px] text-gray-900 leading-snug">
                    {(() => {
                        if (type === 'trending') {
                            const parts = content.split(actor.name);
                            return (
                                <>
                                    <span className="text-gray-900">{parts[0]}</span>
                                    <span className="font-bold text-gray-900">{actor.name}</span>
                                    <span className="text-gray-900">{parts.slice(1).join(actor.name)}</span>
                                </>
                            );
                        }
                        if (type === 'reminder') {
                            return (
                                <>
                                    <span className="font-bold text-gray-900">{actor.name}: </span>
                                    <span className="text-gray-900 font-bold">Design Team Sync</span>
                                    <span className="text-gray-900"> starts in 15 minutes.</span>
                                </>
                            );
                        }
                        return (
                            <>
                                <span className="font-bold text-gray-900">{actor.name}</span>
                                <span className="text-gray-900"> {content}</span>
                            </>
                        );
                    })()}
                </p>

                <p className={cn(
                    "text-[10px] font-medium mt-0.5",
                    isUnread ? "text-[var(--color-primary)]" : "text-gray-400"
                )}>{timestamp}</p>
            </div>

            {/* Right Side Action/Preview */}
            {actionLabel && (
                <button className="px-3 py-1 border border-gray-200 rounded-full text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wide shrink-0">
                    {actionLabel}
                </button>
            )}

            {previewImage && (
                <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
                    <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    );
};
