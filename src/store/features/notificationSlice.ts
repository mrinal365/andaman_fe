import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Notification } from '../../../types/notification';

interface NotificationState {
    items: Notification[];
    unreadCount: number;
    unreadMessages: number;
    unreadConversationIds: string[];
    hasMore: boolean;
    page: number;
    toastQueue: Notification[];
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    unreadMessages: 0,
    unreadConversationIds: [],
    hasMore: true,
    page: 1,
    toastQueue: [],
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<{
            notifications: Notification[];
            hasMore: boolean;
            unreadCount: number;
            unreadMessages: number;
            unreadConversationIds?: string[];
        }>) => {
            state.items = action.payload.notifications;
            state.hasMore = action.payload.hasMore;
            state.unreadCount = action.payload.unreadCount;
            state.unreadMessages = action.payload.unreadMessages;
            state.unreadConversationIds = action.payload.unreadConversationIds || [];
            state.page = 1;
        },

        appendNotifications: (state, action: PayloadAction<{
            notifications: Notification[];
            hasMore: boolean;
        }>) => {
            const existingIds = new Set(state.items.map(n => n._id));
            const newItems = action.payload.notifications.filter(n => !existingIds.has(n._id));
            state.items.push(...newItems);
            state.hasMore = action.payload.hasMore;
            state.page += 1;
        },

        addLiveNotification: (state, action: PayloadAction<Notification>) => {
            state.items.unshift(action.payload);
            if (action.payload.type === 'message') {
                const convoId = action.payload.data?.conversationId;
                if (convoId && !state.unreadConversationIds.includes(convoId)) {
                    state.unreadConversationIds.push(convoId);
                    state.unreadMessages = state.unreadConversationIds.length;
                }
            } else {
                state.unreadCount += 1;
            }
            state.toastQueue.push(action.payload);
        },

        dismissToast: (state, action: PayloadAction<string>) => {
            state.toastQueue = state.toastQueue.filter(t => t._id !== action.payload);
        },

        markOneRead: (state, action: PayloadAction<string>) => {
            const n = state.items.find(n => n._id === action.payload);
            if (n && !n.read) {
                n.read = true;
                if (n.type === 'message') {
                    state.unreadMessages = Math.max(0, state.unreadMessages - 1);
                } else {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },

        markAllRead: (state) => {
            state.items.forEach(n => { n.read = true; });
            state.unreadCount = 0;
            state.unreadMessages = 0;
        },

        markMultipleReadOptimistic: (state, action: PayloadAction<string[]>) => {
            const ids = new Set(action.payload);
            state.items.forEach(n => {
                if (ids.has(n._id) && !n.read) {
                    n.read = true;
                    if (n.type === 'message') {
                        state.unreadMessages = Math.max(0, state.unreadMessages - 1);
                    } else {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                }
            });
        },


        removeNotification: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(n => n._id !== action.payload);
        },

        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },

        setUnreadMessages: (state, action: PayloadAction<number>) => {
            state.unreadMessages = action.payload;
        },

        setUnreadConversationIds: (state, action: PayloadAction<string[]>) => {
            state.unreadConversationIds = action.payload;
            state.unreadMessages = action.payload.length;
        },

        incrementUnreadMessages: (state) => {
            state.unreadMessages += 1;
        },

        clearUnreadMessages: (state) => {
            state.unreadMessages = 0;
        },
        markConversationMessagesRead: (state, action: PayloadAction<string>) => {
            state.items.forEach(n => {
                if (n.type === 'message' && n.data?.conversationId === action.payload) {
                    n.read = true;
                }
            });
            state.unreadConversationIds = state.unreadConversationIds.filter(id => id !== action.payload);
            state.unreadMessages = state.unreadConversationIds.length;
        },
    },
});

export const {
    setNotifications,
    appendNotifications,
    addLiveNotification,
    dismissToast,
    markOneRead,
    markAllRead,
    markMultipleReadOptimistic,
    removeNotification,
    setUnreadCount,
    setUnreadMessages,
    setUnreadConversationIds,
    incrementUnreadMessages,
    clearUnreadMessages,
    markConversationMessagesRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
