'use client';

import { useState } from 'react';
import { Search, Users, UserMinus, MessageCircle } from 'lucide-react';
import { ConversationSkeleton } from './ChatSkeletons';
import { Avatar } from '@/components/common/Avatar';
import { Conversation } from '../../../types/chat';
import { cn } from '@/utils/cn';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedConversation, resetUnread } from '@/store/features/chat/conversationSlice';
import { useAppDispatch } from '@/store/hooks';

interface ChatListProps {
    isLoading?: boolean;
}

const formatLastMessageTime = (dateStr: string | undefined) => {
    if (!dateStr) return '';

    // If it's already a time string like "10:30 AM", return it as is
    if (typeof dateStr === 'string' && dateStr.includes(':') && (dateStr.toLowerCase().includes('am') || dateStr.toLowerCase().includes('pm'))) {
        return dateStr;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // fallback to raw string

    const now = new Date();
    const isToday = d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    if (isToday) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
};

export const ChatList = ({ isLoading }: ChatListProps) => {
    const dispatch = useAppDispatch();
    const conversations: Conversation[] = useSelector((state: RootState) => {
        const list = state.conversations.allIds.map((id) => state.conversations.byId[id]);
        return list.sort((a, b) => {
            const dateA = new Date(a?.lastMessageAt || a?.createdAt || 0).getTime();
            const dateB = new Date(b?.lastMessageAt || b?.createdAt || 0).getTime();
            return dateB - dateA;
        });
    });

    const selectedId = useSelector((state: RootState) => state.conversations.selectedConversationId);
    const onlineUsers = useSelector((state: RootState) => state.conversations.onlineUsers);

    // const activeConversation = conversations.byId[selectedConversationId];
    // const [filter, setFilter] = useState<'All' | 'Personal' | 'Groups'>('All');

    // const filteredConversations = conversations.filter(c => {
    //     if (filter === 'Personal') return !c.isGroup;
    //     if (filter === 'Groups') return c.isGroup;
    //     return true;
    // });

    return (
        <div className="flex flex-col h-full w-full border-r border-gray-100 bg-white">
            {/* Search & Header */}
            <div className="p-4 pb-2 flex flex-col gap-3 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-9 pl-9 pr-4 bg-gray-50 rounded-lg text-[13px] outline-none border-none focus:ring-1 focus:ring-gray-200 transition-shadow placeholder:text-gray-400 font-medium"
                    />
                </div>

                {/* Filters */}
                {/* <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['All', 'Personal', 'Groups'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as 'All' | 'Personal' | 'Groups')}
                            className={cn(
                                "px-3 py-1 rounded-lg text-[12px] font-bold transition-all border border-transparent whitespace-nowrap",
                                filter === f
                                    ? "bg-gray-100 border-gray-200 text-gray-900"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-transparent"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div> */}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2 px-2 pb-2 flex flex-col gap-0.5">
                {isLoading ? (
                    <>
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                    </>
                ) : conversations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                            <MessageCircle className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-[13px] font-bold text-gray-900">No messages yet</p>
                        <p className="text-[11px] text-gray-500 mt-1">When you start chatting with people, they will appear here.</p>
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const isActive = selectedId === conversation?.conversationId;
                        const isOtherOnline = conversation?.type === 'direct' && onlineUsers.includes(conversation?.otherUserId);

                        return (
                            <div
                                key={conversation.conversationId}
                                onClick={() => {
                                    dispatch(setSelectedConversation(conversation?.conversationId as string));
                                    dispatch(resetUnread(conversation?.conversationId as string));
                                }}
                                className={cn(
                                    "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors group",
                                    isActive ? "bg-[#F8F9FA]" : "hover:bg-gray-50"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar
                                        src={conversation?.avatar}
                                        name={conversation?.name}
                                        handle={conversation?.handle}
                                        size="md"
                                    />
                                    {isOtherOnline && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-[2px] border-white shadow-sm"></span>
                                    )}

                                    {conversation?.type === "group" && (
                                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-lg bg-gray-100 border border-white flex items-center justify-center">
                                            <Users className="h-2.5 w-2.5 text-gray-500" />
                                        </span>
                                    )}

                                </div>

                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                                            <h3 className={cn("text-[14px] font-bold leading-tight truncate", isActive ? "text-gray-900" : "text-gray-700")}>
                                                {conversation.name}
                                            </h3>
                                            {conversation.type === "group" ? (
                                                conversation?.participants?.length && (
                                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {conversation?.participants?.length}
                                                    </span>
                                                )
                                            ) : (
                                                !conversation.isFollower && (
                                                    <span className="bg-amber-50 text-amber-600 text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 flex items-center gap-1 border border-amber-100/50">
                                                        <UserMinus className="h-2.5 w-2.5" />
                                                        NOT FOLLOWER
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        {conversation?.lastMessageTime === 'Now' ? (
                                            <span className="text-[10px] font-bold text-[var(--color-primary)] shrink-0">Now</span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-gray-400 shrink-0">
                                                {formatLastMessageTime(conversation?.lastMessageAt || conversation?.lastMessageTime || conversation?.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn(
                                            "text-[12px] truncate leading-snug",
                                            conversation?.isTyping ? "text-green-500 font-bold" : (conversation?.unreadCount > 0 ? "text-gray-900 font-bold" : "text-gray-500 font-medium")
                                        )}>
                                            {conversation?.isTyping ? "typing..." : (conversation?.lastMessage || "click to start chat")}
                                        </p>
                                        {conversation?.unreadCount > 0 && (
                                            <span className="h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold shrink-0">
                                                {conversation?.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }))}

                {/* End of Chats Marker */}
                {/* {filteredConversations.length >= 5 && (
                    <div className={cn(
                        "py-8 flex items-center justify-center gap-2 opacity-50",
                        filteredConversations.length < 67 && "md:hidden"
                    )}>
                        <div className="h-px w-8 bg-gray-300"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of chats</span>
                        <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                )} */}
            </div>
        </div>
    );
};
