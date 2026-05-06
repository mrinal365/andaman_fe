import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation } from "../../../../types/chat";

interface ConversationsState {
  byId: Record<string, Conversation>;
  allIds: string[];
  loading: boolean;
  selectedConversationId: string | null;
  onlineUsers: string[];
}

const initialState: ConversationsState = {
  byId: {},
  allIds: [],
  loading: false,
  selectedConversationId: null,
  onlineUsers: []
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    setUserOnline: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },


    setUserOffline: (state, action: PayloadAction<{ userId: string; lastSeen: string }>) => {
      const { userId, lastSeen } = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
      
      // Update lastSeen in any conversation where this user is the "other" user
      Object.values(state.byId).forEach((convo: any) => {
        if (convo.otherUserId === userId) {
          convo.lastSeen = lastSeen;
        }
      });
    },


    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setConversations: (state, action) => {
      const chats = action.payload;
      const currentTemp = state.selectedConversationId && state.byId[state.selectedConversationId]?.isTemp 
        ? state.byId[state.selectedConversationId] 
        : null;

      state.byId = {};
      state.allIds = [];

      chats.forEach((chat: any) => {
        state.byId[chat.conversationId] = chat;
        state.allIds.push(chat.conversationId);
      });

      // Restore temp if it's still selected and not in the new list
      if (currentTemp && !state.byId[currentTemp.conversationId]) {
        state.byId[currentTemp.conversationId] = currentTemp;
        state.allIds.unshift(currentTemp.conversationId);
      }
    },

    addOrUpdateConversation: (state, action) => {
      const chat = action.payload;

      state.byId[chat.conversationId] = chat;

      if (!state.allIds.includes(chat.conversationId)) {
        state.allIds.unshift(chat.conversationId);
      }
    },

    updateLastMessage: (state, action) => {
      const { conversationId, message, time, isOwn, isOpen, media, createdAt } = action.payload;

      const chat = state.byId[conversationId];
      if (!chat) return;

      const textPrefix = isOwn ? "You: " : "";
      let messageText = message;
      if (!messageText && media && media.length > 0) {
          messageText = "📷 Photo";
      }

      chat.lastMessage = textPrefix + messageText;
      chat.lastMessageTime = time;
      chat.lastMessageAt = createdAt || new Date().toISOString();
      
      if (!isOwn && !isOpen) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }

      // move to top
      state.allIds = [
        conversationId,
        ...state.allIds.filter((id) => id !== conversationId)
      ];
    },

    setTypingStatus: (state, action) => {
      const { conversationId, isTyping } = action.payload;
      if (state.byId[conversationId]) {
        state.byId[conversationId].isTyping = isTyping;
      }
    },

    resetUnread: (state, action) => {
      const id = action.payload;
      if (state.byId[id]) {
        state.byId[id].unreadCount = 0;
      }
    },

    setSelectedConversation: (state, action) => {
      state.selectedConversationId = action.payload;
    }
  }
});

export const {
  setLoading,
  setConversations,
  addOrUpdateConversation,
  updateLastMessage,
  resetUnread,
  setSelectedConversation,
  setTypingStatus,
  setOnlineUsers,
  setUserOnline,
  setUserOffline
} = conversationSlice.actions;


export default conversationSlice.reducer;