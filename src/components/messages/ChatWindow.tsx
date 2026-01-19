'use client';

import {
    Phone,
    Video,
    Info,
    Plus,
    Smile,
    Image as ImageIcon,
    Send,
    CheckCheck,
    ChevronLeft
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Conversation, CURRENT_USER_ID } from './data';
import { cn } from '@/utils/cn';

interface ChatWindowProps {
    conversation: Conversation;
    onBack?: () => void;
}

export const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-[60px] px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden -ml-2 p-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}
                    <div className="relative">
                        <Avatar src={conversation.user.avatar} name={conversation.user.name} size="md" />
                        {conversation.user.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-[2px] border-white"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{conversation.user.name}</h2>
                        {conversation.user.isOnline ? (
                            <p className="text-[11px] font-bold text-green-600">Online</p>
                        ) : (
                            <p className="text-[11px] font-medium text-gray-400">Offline</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-5 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors"><Phone className="h-4.5 w-4.5" /></button>
                    <button className="hover:text-gray-600 transition-colors"><Video className="h-5 w-5" /></button>
                    <button className="hover:text-gray-600 transition-colors"><Info className="h-5 w-5" /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                {/* Date Separator (Mock) */}
                <div className="flex justify-center my-1">
                    <span className="px-3 py-0.5 rounded-full bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today</span>
                </div>

                {conversation.messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-sm font-medium text-gray-400">No messages yet. Start a conversation!</p>
                    </div>
                ) : (
                    conversation.messages.map((msg) => {
                        const isOwn = msg.senderId === CURRENT_USER_ID;

                        return (
                            <div key={msg.id} className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[85%] md:max-w-[70%] items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                                    {!isOwn && (
                                        <Avatar src={conversation.user.avatar} name={conversation.user.name} size="xs" className="mb-0.5" />
                                    )}

                                    <div className={cn(
                                        "flex flex-col gap-1",
                                        isOwn ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-xl text-[13px] leading-snug",
                                            isOwn
                                                ? "bg-[var(--color-primary)] text-white rounded-br-none"
                                                : "bg-[#F3F4F6] text-gray-800 rounded-bl-none"
                                        )}>
                                            {msg.text}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-60 px-1">
                                            <span className="text-[9px] font-bold tracking-wide">{msg.timestamp}</span>
                                            {isOwn && (
                                                <CheckCheck className="h-3 w-3" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 pt-0 shrink-0">
                <div className="flex items-center gap-2">
                    <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <Plus className="h-5 w-5 stroke-[2.5]" />
                    </button>

                    <div className="flex-1 h-[44px] bg-gray-50 rounded-lg flex items-center px-4 gap-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent outline-none text-[14px] font-medium placeholder:text-gray-400 text-gray-900 h-full"
                        />
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="hover:text-gray-600"><Smile className="h-4.5 w-4.5" /></button>
                            <button className="hover:text-gray-600"><ImageIcon className="h-4.5 w-4.5" /></button>
                        </div>
                    </div>

                    <button className="h-[44px] w-[44px] flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95">
                        <Send className="h-4.5 w-4.5 fill-current ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
