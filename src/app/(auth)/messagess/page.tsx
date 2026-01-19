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
        <div className="flex w-full h-screen overflow-hidden bg-white border-l border-gray-100 shadow-sm pt-14 pb-16 lg:pt-0 lg:pb-0">
            {/* Chat List */}
            <div className={cn(
                "flex-shrink-0 w-full md:w-[380px] h-full flex-col border-r border-gray-100 bg-white",
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
                    <>
                        {/* Mobile Back Button could be added in ChatWindow header, but for now assuming users can use bottom nav or we add a back button */}
                        {/* Actually, on mobile, if I select a chat, I see ChatWindow. I need a way to go back to list.
                            I should pass a `onBack` prop to ChatWindow helper or handle it here.
                            Let's add a back button in ChatWindow logic if mobile.
                            Or I can just add a small back arrow in ChatWindow header if on mobile.
                        */}
                        <div className="md:hidden p-2 absolute top-4 left-4 z-50">
                            <button onClick={() => setActiveId(null)} className="h-8 w-8 bg-white/80 rounded-full shadow-md flex items-center justify-center">
                                ←
                            </button>
                        </div>
                        <ChatWindow conversation={activeConversation} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
