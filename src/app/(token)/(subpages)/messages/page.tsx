'use client';

import { useEffect, useState } from 'react';
import { ChatList } from '@/components/messages/ChatList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { cn } from '@/utils/cn';
import { getConversations } from '@/services/chatServices';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setConversations } from '@/store/features/chat/conversationSlice';
import { clearUnreadMessages } from '@/store/features/notificationSlice';
import { RootState } from '@/store/store';
import { socket } from '@/utils/socket';

export default function MessagesPage() {
    const dispatch = useAppDispatch();
    const conversations = useAppSelector((state: RootState) => state.conversations);
    const [isLoading, setIsLoading] = useState(true);
    const selectedConversationId = conversations.selectedConversationId;

    const activeConversation = selectedConversationId ? conversations.byId[selectedConversationId] : null;

    useEffect(() => {
        // Initial fetch of conversations for the list
        setIsLoading(true);
        getConversations().then((res: any) => {
            dispatch(setConversations(res));
            // Join all conversation rooms via socket
            const chats: any = res?.conversations || res;
            if (Array.isArray(chats)) {
                chats.forEach((convo: any) => {
                    socket.emit('join_conversation', convo.conversationId);
                });
            }
        }).catch((err) => {
            console.error('Failed to fetch conversations:', err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [dispatch]);

    return (
        <div className="flex w-full h-full overflow-hidden bg-white">
            {/* Chat List */}
            <div className={cn(
                "flex-shrink-0 w-full md:w-[320px] lg:w-[360px] h-full flex-col border-r border-gray-100 bg-white",
                selectedConversationId ? "hidden md:flex" : "flex"
            )}>
                <ChatList isLoading={isLoading} />
            </div>

            {/* Chat Window */}
            <div className={cn(
                "flex-1 h-full flex-col bg-white",
                selectedConversationId ? "flex" : "hidden md:flex"
            )}>
                {activeConversation ? (
                    <ChatWindow />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
