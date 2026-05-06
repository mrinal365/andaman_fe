import { Message, Conversation } from '../../types/chat';
import api from './api';


export const getFeed = async (): Promise<any> => { // demo 2
    const response = await api.get<any>('/feed');
    return response.data;
};

export const likeUnlikePost = async (postId: string): Promise<any> => { // dmo1
    const response = await api.post<any>(`/posts/${postId}/like`);
    return response.data;
};


export const getConversations = async (): Promise<Conversation[]> => {
    const response = await api.get<any>('/chat/conversations');
    const data = response.data;
    const chats = Array.isArray(data) ? data : (data?.conversations || []);
    return chats.map((chat: any) => {
        if (chat.participants) {
            chat.participants = chat.participants.map((u: any) => ({ ...u, id: u.id || u._id }));
        }
        if (chat.otherUser) {
            chat.otherUser = { ...chat.otherUser, id: chat.otherUser.id || chat.otherUser._id };
        }
        return chat;
    });
};

export const getChatsForConversation = async (conversationId: string, cursor?: number, limit?: number): Promise<{ messages: Message[], hasMore: boolean, otherUserLastReadAt?: string }> => {
    let url = `/chat/messages?conversationId=${conversationId}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (limit) url += `&limit=${limit}`;
    const response = await api.get<any>(url);
    const data = response.data;
    if (data && data.messages) {
        data.messages = data.messages.map((msg: any) => {
            const normalizedMsg = { ...msg, id: msg.id || msg._id };
            if (normalizedMsg.sender && typeof normalizedMsg.sender === 'object') {
                normalizedMsg.sender = { ...normalizedMsg.sender, id: normalizedMsg.sender.id || normalizedMsg.sender._id };
            }
            return normalizedMsg;
        });
    }
    return data;
};

export const sendMessage = async (data: any): Promise<any> => { // demo 2
    const response = await api.post<any>(`/chat/messages`, data);
    return response.data;
};

// http://localhost:5000/api/chat/messages?conversationId=69be463541826b48e7b7ef1f