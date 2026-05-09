// features/message/messageSlice.js
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../../../../types/chat";

interface MessageState {
    byId: Record<string, Message>;
    byConversation: Record<string, string[]>;
    lastReadAt: Record<string, string>;
    hasMore: Record<string, boolean>;
}

const initialState: MessageState = {
    byId: {},
    byConversation: {},
    lastReadAt: {},
    hasMore: {},
};

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        // ✅ Initial API load
        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[]; otherUserLastReadAt?: string; hasMore?: boolean }>) => {
            const { conversationId, messages, otherUserLastReadAt, hasMore } = action.payload;

            if (otherUserLastReadAt) {
                state.lastReadAt[conversationId] = otherUserLastReadAt;
            }

            state.hasMore[conversationId] = !!hasMore;

            // Reset conversation messages on initial load to avoid accumulation
            state.byConversation[conversationId] = [];

            messages.forEach((msg: Message) => {
                const messageId = msg.id || msg._id || Math.random().toString(36).substr(2, 9);
                state.byId[messageId] = { ...msg, id: messageId };

                if (!state.byConversation[conversationId].includes(messageId)) {
                    state.byConversation[conversationId].push(messageId);
                }
            });

            // 🔥 Ensure correct order (by sequence)
            state.byConversation[conversationId].sort((a, b) => {
                const seqA = state.byId[a]?.sequence || 0;
                const seqB = state.byId[b]?.sequence || 0;
                return seqA - seqB;
            });
        },

        // ✅ Add single message (socket/send)
        addMessage: (state, action: PayloadAction<Message & { conversationId: string }>) => {
            const msg = action.payload;
            const conversationId = msg.conversationId;
            const messageId = msg.id || msg._id || Math.random().toString(36).substr(2, 9);

            if (!state.byConversation[conversationId]) {
                state.byConversation[conversationId] = [];
            }

            // 1. Check for ID collision (already added by API response or another socket)
            if (state.byId[messageId] || state.byConversation[conversationId].includes(messageId)) {
                state.byId[messageId] = { ...state.byId[messageId], ...msg, id: messageId };
                return;
            }

            // 2. Optimistic matching: if we receive a real message that matches an optimistic one
            if (msg._id || msg.id) {
                const senderId = msg.senderId || (typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender);
                
                const duplicateTempId = state.byConversation[conversationId].find(id => {
                    const m = state.byId[id];
                    if (!m) return false;
                    
                    const isOptimistic = id.startsWith('temp-') || m.status === 'sending' || m.status === 'failed';
                    if (!isOptimistic) return false;

                    const mSenderId = m.senderId || (typeof m.sender === 'object' ? (m.sender?._id || m.sender?.id) : m.sender);
                    const isSameSender = mSenderId === senderId;
                    const isSameText = m.text === msg.text;
                    
                    // Within 1 minute of each other
                    const timeDiff = Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime());
                    const isRecent = timeDiff < 60000;

                    return isSameSender && isSameText && isRecent;
                });

                if (duplicateTempId) {
                    // Replace the optimistic message
                    delete state.byId[duplicateTempId];
                    state.byId[messageId] = { ...msg, id: messageId, status: 'sent' };
                    state.byConversation[conversationId] = state.byConversation[conversationId].map(id =>
                        id === duplicateTempId ? messageId : id
                    );
                    
                    // Re-sort because sequence changed
                    state.byConversation[conversationId].sort((a, b) => {
                        const seqA = state.byId[a]?.sequence || 0;
                        const seqB = state.byId[b]?.sequence || 0;
                        return seqA - seqB;
                    });
                    return;
                }
            }

            // 3. Normal add
            state.byId[messageId] = { ...msg, id: messageId };
            state.byConversation[conversationId].push(messageId);

            // 🔥 Keep order correct
            state.byConversation[conversationId].sort((a, b) => {
                const seqA = state.byId[a]?.sequence || 0;
                const seqB = state.byId[b]?.sequence || 0;
                return seqA - seqB;
            });
        },

        // ✅ Pagination (older messages)
        prependMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[]; hasMore?: boolean }>) => {
            const { conversationId, messages, hasMore } = action.payload;

            state.hasMore[conversationId] = !!hasMore;

            if (!state.byConversation[conversationId]) {
                state.byConversation[conversationId] = [];
            }

            const existing = state.byConversation[conversationId];
            const newIds: string[] = [];

            messages.forEach((msg: Message) => {
                const messageId = msg.id || msg._id || Math.random().toString(36).substr(2, 9);
                state.byId[messageId] = { ...msg, id: messageId };

                if (!existing.includes(messageId)) {
                    newIds.push(messageId);
                }
            });

            const merged = [...newIds, ...existing];

            // 🔥 Sort again to maintain correct order
            state.byConversation[conversationId] = merged.sort((a, b) => {
                const seqA = state.byId[a]?.sequence || 0;
                const seqB = state.byId[b]?.sequence || 0;
                return seqA - seqB;
            });
        },

        // ✅ Set Last Read At (when socket event received)
        setLastReadAt: (state, action) => {
            const { conversationId, lastReadAt } = action.payload;
            state.lastReadAt[conversationId] = lastReadAt;
        },

        // ✅ Update Message Status (optimistic)
        updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: 'sending' | 'sent' | 'failed' }>) => {
            const { messageId, status } = action.payload;
            if (state.byId[messageId]) {
                state.byId[messageId].status = status;
            }
        },

        // ✅ Replace Temp Message with Real Message
        replaceMessage: (state, action: PayloadAction<{ tempId: string; message: Message & { conversationId: string } }>) => {
            const { tempId, message } = action.payload;
            const conversationId = message.conversationId;
            const realId = message.id || message._id;

            if (state.byId[tempId]) {
                delete state.byId[tempId];
                state.byId[realId] = { ...message, id: realId, status: 'sent' };

                if (state.byConversation[conversationId]) {
                    state.byConversation[conversationId] = state.byConversation[conversationId].map(id =>
                        id === tempId ? realId : id
                    );
                }
            }
        }
    }
});

export const { setMessages, addMessage, prependMessages, setLastReadAt, updateMessageStatus, replaceMessage } =
    messageSlice.actions;

export default messageSlice.reducer;