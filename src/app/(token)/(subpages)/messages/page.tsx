'use client';

import { useState } from 'react';
import { ChatList } from '@/components/messages/ChatList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { MOCK_CONVERSATIONS } from '@/components/messages/data';
import { cn } from '@/utils/cn';

export default function MessagesPage() {
    const [activeId, setActiveId] = useState<string | null>('1');

    const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === activeId);

    return (
        <div className="flex w-full h-full overflow-hidden bg-white">
            {/* Chat List */}
            <div className={cn(
                "flex-shrink-0 w-full md:w-[320px] lg:w-[360px] h-full flex-col border-r border-gray-100 bg-white",
                activeId ? "hidden md:flex" : "flex"
            )}>
                <ChatList
                    conversations={MOCK_CONVERSATIONS}
                    activeId={activeId || ''}
                    onSelect={setActiveId}
                />
            </div>

            {/* Chat Window */}
            <div className={cn(
                "flex-1 h-full flex-col bg-white",
                activeId ? "flex" : "hidden md:flex"
            )}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        onBack={() => setActiveId(null)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
