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

            state.byId[messageId] = { ...msg, id: messageId };

            if (!state.byConversation[conversationId]) {
                state.byConversation[conversationId] = [];
            }

            if (!state.byConversation[conversationId].includes(messageId)) {
                state.byConversation[conversationId].push(messageId);
            }

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
        }
    }
});

export const { setMessages, addMessage, prependMessages, setLastReadAt } =
    messageSlice.actions;

export default messageSlice.reducer;