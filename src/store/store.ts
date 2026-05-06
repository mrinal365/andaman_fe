import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import postReducer from './features/postSlice';
import commentReducer from './features/commentSlice';
import conversationReducer from './features/chat/conversationSlice';
import chatReducer from './features/chat/chatSlice';
import notificationReducer from './features/notificationSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        posts: postReducer,
        comments: commentReducer,
        conversations: conversationReducer,
        chats: chatReducer,
        notifications: notificationReducer,
    },
    devTools: process.env.NODE_ENV !== 'production', // Explicitly enable/disable
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
