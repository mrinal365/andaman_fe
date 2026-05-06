'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { socket } from '@/utils/socket';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { chatConfig } from '@/config/chatConfig';
import { getConversations } from '@/services/chatServices';
import { addMessage, setLastReadAt } from '@/store/features/chat/chatSlice';
import { updateLastMessage, setConversations, setTypingStatus, setSelectedConversation, resetUnread, setOnlineUsers, setUserOnline, setUserOffline } from '@/store/features/chat/conversationSlice';
import { Conversation } from '../../../types/chat';

import { Avatar } from '@/components/common/Avatar';
import { RootState } from '@/store/store';

interface NotificationMessage {
    id: string;
    conversationId: string;
    text: string;
    senderName: string;
    senderAvatar?: string;
    media?: any[];
    createdAt: string;
}

export const ChatNotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const selectedConversationId = useAppSelector((state: RootState) => state.conversations.selectedConversationId);
    const currentUser = useAppSelector((state: RootState) => state.user.user);
    const isMessagesPage = pathname?.includes('/messages');

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addNotification = useCallback((msg: any) => {
        // Don't show if it's our own message
        if (msg.sender?.id === currentUser?.id || msg.senderId === currentUser?.id || msg.sender?._id === currentUser?.id) return;

        // Don't show if we are already in this conversation on the messages page
        if (isMessagesPage && selectedConversationId === msg.conversationId) return;

        const newNotification: NotificationMessage = {
            id: msg._id || Math.random().toString(),
            conversationId: msg.conversationId,
            text: msg.text || (msg.media?.length > 0 ? "📷 Photo" : ""),
            senderName: msg.sender?.name || "New Message",
            senderAvatar: msg.sender?.avatar,
            media: msg.media,
            createdAt: msg.createdAt
        };

        setNotifications((prev) => {
            // Filter out existing notifications for the same conversation if you want to only show the latest
            const filtered = prev.filter(n => n.conversationId !== msg.conversationId);
            const updated = [newNotification, ...filtered];
            return updated.slice(0, chatConfig.maxNotifications);
        });

        // Auto remove after duration
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, chatConfig.notificationDuration);
    }, [currentUser?.id, isMessagesPage, selectedConversationId, removeNotification]);

    useEffect(() => {
        if (!chatConfig.enableGlobalNotifications) return;

        const onReceiveMessage = (data: any) => {
            // Update Redux state globally so counters etc work everywhere
            dispatch(addMessage(data));
            dispatch(updateLastMessage({
                conversationId: data.conversationId,
                message: data.text,
                media: data.media,
                time: new Date(data.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                createdAt: data.createdAt,
                isOwn: data.senderId === currentUser?.id || data.sender?.id === currentUser?.id,
                isOpen: selectedConversationId === data.conversationId && isMessagesPage
            }));

            addNotification(data);
        };

        const onConnect = () => {
            if (currentUser?.id) {
                socket.emit("register_user", currentUser.id);
            }

            // Fetch and Join all rooms when socket connects
            getConversations().then((res) => {
                const conversation = res as any
                const chats = Array.isArray(conversation) ? res : (conversation?.conversations || []);
                if (Array.isArray(chats)) {
                    chats.forEach(convo => {
                        socket.emit("join_conversation", convo.conversationId);
                    });
                }
            });
        };

        const onUserOnline = (data: { userId: string }) => {
            dispatch(setUserOnline(data.userId));
        };


        const onUserOffline = (data: { userId: string; lastSeen: string }) => {
            dispatch(setUserOffline(data));
        };


        const onOnlineUsersList = (users: string[]) => {
            dispatch(setOnlineUsers(users));
        };

        const onUserTyping = (data: any) => {
            dispatch(setTypingStatus({ conversationId: data.conversationId, isTyping: true }));
        };

        const onUserStoppedTyping = (data: any) => {
            dispatch(setTypingStatus({ conversationId: data.conversationId, isTyping: false }));
        };

        const onMessagesSeen = (data: any) => {
            if (data.userId !== currentUser?.id) {
                dispatch(setLastReadAt({ conversationId: data.conversationId, lastReadAt: data.lastReadAt }));
            }
        };

        socket.on("receive_message", onReceiveMessage);
        socket.on("user_typing", onUserTyping);
        socket.on("user_stopped_typing", onUserStoppedTyping);
        socket.on("messages_seen", onMessagesSeen);
        socket.on("user_online", onUserOnline);
        socket.on("user_offline", onUserOffline);
        socket.on("online_users_list", onOnlineUsersList);
        socket.on("connect", onConnect);


        // Initial load
        onConnect();

        return () => {
            socket.off("receive_message", onReceiveMessage);
            socket.off("user_typing", onUserTyping);
            socket.off("user_stopped_typing", onUserStoppedTyping);
            socket.off("messages_seen", onMessagesSeen);
            socket.off("user_online", onUserOnline);
            socket.off("user_offline", onUserOffline);
            socket.off("online_users_list", onOnlineUsersList);
            socket.off("connect", onConnect);

        };
    }, [dispatch, currentUser?.id, selectedConversationId, isMessagesPage, addNotification]);

    const handleNotificationClick = (convoId: string, id: string) => {
        dispatch(setSelectedConversation(convoId));
        dispatch(resetUnread(convoId));
        router.push(`/messages`);
        removeNotification(id);
    };

    return (
        <>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {notifications.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onClose={() => removeNotification(n.id)}
                            onClick={() => handleNotificationClick(n.conversationId, n.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
};

const NotificationItem = ({ notification, onClose, onClick }: {
    notification: NotificationMessage;
    onClose: () => void;
    onClick: () => void;
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className="pointer-events-auto w-[340px] bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/50 p-4 flex gap-4 cursor-pointer group ring-1 ring-black/[0.03]"
        >
            <div className={cn(
                "relative shrink-0",
                chatConfig.namePrivacyEnabled && "blur-[6px] select-none"
            )}>
                <Avatar src={notification.senderAvatar} name={notification.senderName} size="md" />
                <div className="absolute -bottom-1 -right-1 bg-[var(--color-primary)] text-white p-1 rounded-full shadow-sm">
                    <MessageCircle size={10} strokeWidth={3} />
                </div>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between mb-0.5">
                    <p className={cn(
                        "text-[14px] font-bold text-gray-900 truncate leading-tight",
                        chatConfig.namePrivacyEnabled && "blur-[4px] select-none"
                    )}>
                        {notification.senderName}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-400">just now</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="text-gray-300 hover:text-gray-500 transition-colors p-1 -mr-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <p className={cn(
                    "text-[13px] text-gray-600 line-clamp-2 leading-relaxed mt-0.5",
                    chatConfig.textPrivacyEnabled && "blur-[5px] select-none"
                )}>
                    {notification.text || "📷 Photo"}
                </p>
            </div>
        </motion.div>
    );
};
