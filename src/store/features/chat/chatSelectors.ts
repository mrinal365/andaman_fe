import { RootState } from "@/store/store";

export const selectMessagesForConversation = (state: RootState, conversationId: string) => {
    const ids = state.chats.byConversation[conversationId] || [];
    return ids.map((id: string) => state.chats.byId[id]);
};