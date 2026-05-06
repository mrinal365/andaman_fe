import { User } from "../user";

export interface Message {
    id: string;
    _id: string;
    conversationId: string;
    senderId: string;
    sender?: User;
    text: string;
    media?: any[];
    type: "text" | "image" | "video" | "file";
    sequence: number;
    readBy?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    conversationId: string;
    type: "direct" | "group";
    name: string;
    avatar: string;
    handle: string;
    otherUserId: string;
    lastSeen: string | null;
    isFollowing: boolean;
    isFollower: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    createdAt: string;
    unreadCount: number;
    isTyping?: boolean;
    isTemp?: boolean;
    participants?: User[];
    otherUser?: User;
    lastMessageTime?: string;
}
