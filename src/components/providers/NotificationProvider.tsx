'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { addLiveNotification, setUnreadCount, setUnreadConversationIds } from '@/store/features/notificationSlice';
import { updateLastMessage } from '@/store/features/chat/conversationSlice';
import { addMessage } from '@/store/features/chat/chatSlice';
import { setLastReadAt } from '@/store/features/chat/chatSlice';
import { getUnreadCount } from '@/services/notificationService';
import { socket } from '@/utils/socket';

/**
 * Global notification provider.
 * Mount this once at the (token) layout level.
 * Handles:
 *   - Joining the user's personal socket room
 *   - Receiving live notifications via socket
 *   - Receiving messages via socket (for unread badge on any page)
 *   - Fetching initial unread count from API
 */
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state: RootState) => state.user.user);
    const selectedConversationId = useAppSelector((state: RootState) => state.conversations.selectedConversationId);
    const selectedConversationIdRef = useRef(selectedConversationId);

    // Keep ref in sync so socket callbacks always have latest value
    useEffect(() => {
        selectedConversationIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    useEffect(() => {
        if (!currentUser?._id) return;

        // Fetch initial unread count
        getUnreadCount()
            .then(({ unreadCount, unreadConversationIds }) => {
                dispatch(setUnreadCount(unreadCount));
                dispatch(setUnreadConversationIds(unreadConversationIds || []));
            })
            .catch(() => {});

        // Join personal user room for notifications
        const joinUserRoom = () => {
            socket.emit('join_user_room', currentUser._id);
        };

        if (socket.connected) joinUserRoom();
        socket.on('connect', joinUserRoom);

        // Listen for live notifications
        const onNotification = (data: any) => {
            // If it's a message and we're currently looking at that conversation, 
            // don't increment the unread count or show a toast.
            if (data.type === 'message' && data.data?.conversationId === selectedConversationIdRef.current) {
                return;
            }
            dispatch(addLiveNotification(data));
        };

        socket.on('notification', onNotification);

        return () => {
            socket.off('connect', joinUserRoom);
            socket.off('notification', onNotification);
        };
    }, [currentUser?._id, dispatch]);

    return <>{children}</>;
};
