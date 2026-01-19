'use client';

import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Conversation } from './data';
import { cn } from '@/utils/cn';

interface ChatListProps {
    conversations: Conversation[];
    activeId: string;
    onSelect: (id: string) => void;
}

export const ChatList = ({ conversations, activeId, onSelect }: ChatListProps) => {
    const [filter, setFilter] = useState<'All' | 'Personal' | 'Groups'>('All');

    const filteredConversations = conversations.filter(c => {
        if (filter === 'Personal') return !c.isGroup;
        if (filter === 'Groups') return c.isGroup;
        return true;
    });

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
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2 px-2 pb-2 flex flex-col gap-0.5">
                {filteredConversations.map((convo) => {
                    const isActive = activeId === convo.id;
                    return (
                        <div
                            key={convo.id}
                            onClick={() => onSelect(convo.id)}
                            className={cn(
                                "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors group",
                                isActive ? "bg-[#F8F9FA]" : "hover:bg-gray-50"
                            )}
                        >
                            <div className="relative shrink-0">
                                <Avatar src={convo.user.avatar} name={convo.user.name} size="md" />
                                {convo.user.isOnline && !convo.isGroup && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-[2px] border-white"></span>
                                )}
                                {convo.isGroup && (
                                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-lg bg-gray-100 border border-white flex items-center justify-center">
                                        <Users className="h-2.5 w-2.5 text-gray-500" />
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                                        <h3 className={cn("text-[14px] font-bold leading-tight truncate", isActive ? "text-gray-900" : "text-gray-700")}>
                                            {convo.user.name}
                                        </h3>
                                        {convo.isGroup && convo.memberCount && (
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {convo.memberCount}
                                            </span>
                                        )}
                                    </div>
                                    {convo.lastMessageTime === 'Now' ? (
                                        <span className="text-[10px] font-bold text-[var(--color-primary)] shrink-0">Now</span>
                                    ) : (
                                        <span className="text-[10px] font-medium text-gray-400 shrink-0">{convo.lastMessageTime}</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className={cn(
                                        "text-[12px] truncate leading-snug",
                                        convo.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-500 font-medium"
                                    )}>
                                        {convo.lastMessage}
                                    </p>
                                    {convo.unreadCount > 0 && (
                                        <span className="h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold shrink-0">
                                            {convo.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* End of Chats Marker */}
                {filteredConversations.length >= 5 && (
                    <div className={cn(
                        "py-8 flex items-center justify-center gap-2 opacity-50",
                        filteredConversations.length < 67 && "md:hidden"
                    )}>
                        <div className="h-px w-8 bg-gray-300"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of chats</span>
                        <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                )}
            </div>
        </div>
    );
};
