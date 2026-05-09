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
    ChevronLeft,
    ChevronDown,
    Loader2,
    MessageCircle
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Conversation } from '../../../types/chat';
import { cn } from '@/utils/cn';
import { useEffect, useState, useRef, Fragment, useLayoutEffect } from 'react';
import { getChatsForConversation, sendMessage } from '@/services/chatServices';
import { RootState } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedConversation, updateLastMessage } from '@/store/features/chat/conversationSlice';
import { addMessage, setMessages, setLastReadAt, prependMessages } from '@/store/features/chat/chatSlice';
import { selectMessagesForConversation } from '@/store/features/chat/chatSelectors';
import { markConversationMessagesRead } from '@/store/features/notificationSlice';
import { chatConfig } from '@/config/chatConfig';

import { uploadImage } from '@/services/uploadService';
import EmojiPicker from 'emoji-picker-react';
import { ChatMediaModal } from './ChatMediaModal';
import { ChatMediaGrid } from './ChatMediaGrid';
import { ChatLightbox } from './ChatLightbox';

// testing import
import { socket } from "@/utils/socket";

interface ChatWindowProps {
    // conversation: Conversation;
    // onBack?: () => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const formatMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return 'Today';
    } else if (isSameDay(date, yesterday)) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
};

const formatLastSeen = (dateStr: string | null) => {
    if (!dateStr) return 'Offline';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return 'Last seen just now';
    if (mins < 60) return `Last seen ${mins}m ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Last seen ${hours}h ago`;

    return `Last seen ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
};

export const ChatWindow = () => {

    const dispatch = useAppDispatch();
    const conversations: Conversation[] = useAppSelector((state: RootState) =>
        state.conversations.allIds.map(
            (id) => state.conversations.byId[id]
        ));
    const currentUser = useAppSelector((state: RootState) => state.user.user);

    const selectedConversationId = useAppSelector((state: RootState) => state.conversations.selectedConversationId);
    const messages = useAppSelector((state) =>
        selectMessagesForConversation(state, selectedConversationId as string)
    );
    const conversation: Conversation | undefined = conversations?.find((conversation) => conversation.conversationId === selectedConversationId);

    const otherUserLastReadAt = useAppSelector((state: RootState) =>
        selectedConversationId ? state.chats.lastReadAt[selectedConversationId] : null
    );
    const onlineUsers = useAppSelector((state: RootState) => state.conversations.onlineUsers);
    const isOtherOnline = conversation?.type === 'direct' && onlineUsers.includes(conversation?.otherUserId as string);
    const hasMore = useAppSelector((state: RootState) =>
        selectedConversationId ? state.chats.hasMore[selectedConversationId] : false
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [messageText, setMessageText] = useState("");

    // UI State
    const [showEmoji, setShowEmoji] = useState(false);
    const isTyping = conversation?.isTyping;
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    // Lightbox State
    const [lightboxImages, setLightboxImages] = useState<{ url: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showGoToBottom, setShowGoToBottom] = useState(false);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior
            });
        }
    };

    const handleScroll = () => {
        if (!chatContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        // Detect scroll to top with buffer
        if (scrollTop < 50 && hasMore && !isLoadingMore && !isLoading && messages.length > 0) {
            handleLoadMore();
        }

        // Show button if we are scrolled up more than 150px from the bottom
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
        setShowGoToBottom(isScrolledUp);
    };

    const handleLoadMore = async () => {
        if (!selectedConversationId || !hasMore || isLoadingMore) return;

        setIsLoadingMore(true);

        const container = chatContainerRef.current;
        const currentScrollHeight = container?.scrollHeight || 0;

        const oldestMessage = messages[0];
        const cursor = oldestMessage?.sequence;

        if (!cursor) {
            setIsLoadingMore(false);
            return;
        }

        try {
            const res = await getChatsForConversation(selectedConversationId, cursor, chatConfig.messagesPerPage);

            dispatch(prependMessages({
                conversationId: selectedConversationId,
                messages: res.messages,
                hasMore: res.hasMore
            }));

            // Basic scroll maintenance
            setTimeout(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight - currentScrollHeight;
                }
            }, 0);
        } catch (error) {
            console.error("Failed to load more messages", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const lastMessageId = messages?.[messages?.length - 1]?.id;
    const prevLastMessageIdRef = useRef<string | undefined>(undefined);
    const prevSelectedConversationIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (isLoading || isLoadingMore) return;

        const isNewConversation = selectedConversationId !== prevSelectedConversationIdRef.current;
        const isNewMessage = lastMessageId !== prevLastMessageIdRef.current;

        if (isNewConversation || isNewMessage) {
            // Slight delay ensures DOM has painted
            const timeoutId = setTimeout(() => {
                scrollToBottom(isNewConversation ? "auto" : "smooth");
            }, 10);

            prevSelectedConversationIdRef.current = selectedConversationId;
            prevLastMessageIdRef.current = lastMessageId;

            return () => clearTimeout(timeoutId);
        }
    }, [lastMessageId, selectedConversationId, isLoading, isLoadingMore]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5); // Max 5 images
            setSelectedFiles(files);
            setShowMediaModal(true);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAddFiles = (newFiles: File[]) => {
        setSelectedFiles(prev => {
            const combined = [...prev, ...newFiles];
            return combined.slice(0, 5); // Max 5
        });
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (updated.length === 0) setShowMediaModal(false);
            return updated;
        });
    };

    const handleSendMedia = async (files: File[], caption: string) => {
        setIsUploadingMedia(true);
        try {
            const uploadPromises = files.map(file => uploadImage(file));
            const uploadResults = await Promise.all(uploadPromises);

            const mediaArray = uploadResults.map(res => ({
                url: res.url,
                type: 'image',
                size: res.size,
                thumbnail: res.thumbnailUrl
            }));

            const res = await sendMessage({
                conversationId: selectedConversationId,
                text: caption,
                media: mediaArray
            });

            const completeMessage = res?.data ? { ...res.data } : { ...res };
            completeMessage.conversationId = selectedConversationId;
            if (!completeMessage.sequence) {
                completeMessage.sequence = completeMessage.messageSequence || Date.now();
            }
            if (!completeMessage.sender || typeof completeMessage.sender === 'string') {
                completeMessage.sender = currentUser;
            }
            dispatch(addMessage(completeMessage));

            dispatch(updateLastMessage({
                conversationId: selectedConversationId,
                message: caption,
                media: mediaArray,
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                createdAt: completeMessage.createdAt,
                isOwn: true,
                isOpen: true
            }));

            setShowMediaModal(false); // Only close after successful upload
            setSelectedFiles([]);
        } catch (error) {
            console.error("Failed to upload images", error);
        } finally {
            setIsUploadingMedia(false);
        }
    };

    console.log("selectedConversationId-----", selectedConversationId, messages, "------", currentUser);
    const state = useAppSelector((state: RootState) => state);
    console.log("++++++messages-----", state);

    // socket connection 
    useEffect(() => {
        // ✅ when connected
        const onConnect = () => {
            console.log("✅ Connected:", socket.id);
            if (selectedConversationId) {
                socket.emit("join_conversation", selectedConversationId);
                dispatch(markConversationMessagesRead(selectedConversationId));
                // Mark messages as seen when we connect and are in a conversation
                if (currentUser?.id) {
                    socket.emit("mark_seen", { conversationId: selectedConversationId, userId: currentUser.id });
                }
            }
        };

        socket.on("connect", onConnect);

        if (socket.connected && selectedConversationId) {
            socket.emit("join_conversation", selectedConversationId);
            dispatch(markConversationMessagesRead(selectedConversationId));
            if (currentUser?.id) {
                socket.emit("mark_seen", { conversationId: selectedConversationId, userId: currentUser.id });
            }
        }

        // cleanup
        return () => {
            socket.off("connect", onConnect);
        };
    }, [selectedConversationId, dispatch, currentUser?._id]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);

        if (selectedConversationId && currentUser?.id) {
            socket.emit("typing_start", { conversationId: selectedConversationId, userId: currentUser.id });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing_end", { conversationId: selectedConversationId, userId: currentUser.id });
            }, 2000);
        }
    };

    // ✅ send message to backend
    const onClickSendMessage = () => {
        if (!messageText.trim()) return;

        // socket.emit("send_message", {
        //     text: "Hello",
        // });

        sendMessage({
            conversationId: selectedConversationId,
            text: messageText
        })
            .then((res) => {
                console.log("message sent", res);
                // Handle case where backend wraps response in `data`
                const completeMessage = res?.data ? { ...res.data } : { ...res };

                // Force the correct conversation ID so it shows up in the current chat
                completeMessage.conversationId = selectedConversationId;

                // Ensure it has a sequence so it sorts to the bottom
                if (!completeMessage.sequence) {
                    completeMessage.sequence = completeMessage.messageSequence || Date.now();
                }

                if (!completeMessage.sender || typeof completeMessage.sender === 'string') {
                    completeMessage.sender = currentUser;
                }
                dispatch(addMessage(completeMessage));

                dispatch(updateLastMessage({
                    conversationId: selectedConversationId,
                    message: messageText,
                    media: [],
                    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                    createdAt: completeMessage.createdAt,
                    isOwn: true,
                    isOpen: true
                }));

                // Clear typing indicator manually when sent
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                socket.emit("typing_end", { conversationId: selectedConversationId, userId: currentUser?.id });
            })
            .catch((err) => {
                console.log("message not sent", err);
            })
            .finally(() => {
                setMessageText("");
            })
        // console.log("socket running", {
        //     conversationId: selectedConversationId,
        //     senderId: currentUser?._id,
        //     text: "messageText"
        // })
        // socket.emit("send_message", {
        //     conversationId: selectedConversationId,
        //     senderId: currentUser?._id,
        //     text: "messageText"
        // });
        console.log("socket doen")

        // setMessage("");
    };


    useEffect(() => {
        setIsLoading(true);
        if (!selectedConversationId) return;
        getChatsForConversation(selectedConversationId, undefined, chatConfig.messagesPerPage)
            .then((res) => {
                // The backend returns { messages: [...] }
                const messagesArray = res?.messages ? res.messages : (Array.isArray(res) ? res : []);
                dispatch(setMessages({
                    conversationId: selectedConversationId,
                    messages: messagesArray,
                    otherUserLastReadAt: res?.otherUserLastReadAt,
                    hasMore: res?.hasMore
                }));
                dispatch(markConversationMessagesRead(selectedConversationId));
                console.log("Fetched messages:", res);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, [selectedConversationId])

    const goback = () => {
        dispatch(setSelectedConversation(null));
    }

    // We removed the early return so the header and input always stay mounted
    // if (isLoading) return <div className='text-black'>Loading...</div>


    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* <div className='text-black'>
                conversation {selectedConversationId}
            </div> */}
            {/* Header */}
            <div className="h-[60px] px-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    {selectedConversationId && (
                        <button
                            onClick={goback}
                            className="md:hidden -ml-2 p-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}
                    <div className="relative">
                        <Avatar
                            src={conversation?.avatar}
                            name={conversation?.name || "User"}
                            handle={conversation?.handle}
                            size="md"
                        />
                        {isOtherOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-[2px] border-white shadow-sm"></span>
                        )}
                    </div>

                    <div>
                        <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{conversation?.name}</h2>
                        {conversation?.type === 'direct' && (
                            isOtherOnline ? (
                                <p className="text-[11px] font-bold text-green-600">Online</p>
                            ) : (
                                <p className="text-[11px] font-medium text-gray-400">
                                    {formatLastSeen(conversation?.lastSeen)}
                                </p>
                            )
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
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative bg-gray-50 min-h-0 custom-scrollbar"
            >
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center h-full">
                        <div className="bg-white p-3 rounded-full shadow-sm flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "flex justify-center overflow-hidden",
                            isLoadingMore ? "h-10 opacity-100 py-2" : "h-0 opacity-0"
                        )}>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading history...</span>
                            </div>
                        </div>
                        {messages?.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 h-full min-h-[300px]">
                                <p className="text-sm font-medium text-gray-400">No messages yet. Start a conversation!</p>
                            </div>
                        ) : (
                            <>
                                {!hasMore && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-70 animate-in fade-in zoom-in duration-700">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                                            <MessageCircle className="w-8 h-8 text-[var(--color-primary)]" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Conversation Started</h3>
                                        <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] text-center leading-relaxed">
                                            This is the very beginning of your chat history with {conversation?.name || "this user"}.
                                        </p>
                                        <div className="flex items-center gap-2 mt-6 w-full max-w-[240px]">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                                        </div>
                                    </div>
                                )}
                                {messages?.map((msg: any, index: any) => {
                                    const senderId = typeof msg?.sender === 'object' ? (msg?.sender?.id || msg?.sender?._id) : (msg?.senderId || msg?.sender);
                                    const isOwn = currentUser?.id === senderId || currentUser?._id === senderId;

                                    const msgDate = new Date(msg.createdAt || Date.now());
                                    const prevMsg = index > 0 ? messages[index - 1] : null;
                                    const prevDate = prevMsg ? new Date(prevMsg.createdAt || Date.now()) : null;

                                    const showDateDivider = !prevDate || !isSameDay(msgDate, prevDate);
                                    const dateString = formatMessageDate(msgDate);
                                    const timeString = msgDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                                    return (
                                        <Fragment key={msg.id || index}>
                                            {showDateDivider && (
                                                <div className="flex justify-center my-2">
                                                    <div className="px-3 py-1 rounded-md bg-[#F0F2F5] shadow-sm text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                                                        {dateString}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
                                                <div className={cn("flex max-w-[85%] md:max-w-[70%] items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                                                    {!isOwn && (
                                                        <Avatar
                                                            src={msg?.sender?.avatar}
                                                            name={msg?.sender?.name}
                                                            handle={msg?.sender?.handle}
                                                            size="xs"
                                                            className="mb-0.5"
                                                        />
                                                    )}

                                                    <div className={cn(
                                                        "px-3 py-2 text-[14px] leading-snug shadow-sm break-words flex flex-col min-w-[80px]",
                                                        isOwn
                                                            ? "bg-[var(--color-primary)] text-white rounded-lg rounded-tr-none"
                                                            : "bg-[#F3F4F6] text-gray-800 rounded-lg rounded-tl-none"
                                                    )}>
                                                        {msg.media && msg.media.length > 0 && (
                                                            <ChatMediaGrid
                                                                media={msg?.media}
                                                                onImageClick={(index) => {
                                                                    setLightboxImages(msg?.media as { url: string }[]);
                                                                    setLightboxIndex(index);
                                                                    setShowLightbox(true);
                                                                }}
                                                            />
                                                        )}
                                                        {msg.text && (
                                                            <div className="mt-0.5">
                                                                <span>{msg.text}</span>
                                                            </div>
                                                        )}
                                                        <div className={cn("flex items-center justify-end gap-1 mt-1 opacity-80", isOwn ? "text-white" : "text-gray-500")}>
                                                            <span className="text-[10px] leading-none">{timeString}</span>
                                                            {isOwn && (
                                                                <CheckCheck className={cn(
                                                                    "h-[14px] w-[14px]",
                                                                    (otherUserLastReadAt && new Date(msg.createdAt) <= new Date(otherUserLastReadAt))
                                                                        ? "text-[#53bdeb]"
                                                                        : "text-white opacity-70"
                                                                )} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fragment>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
                {isTyping && (
                    <div className="flex w-full justify-start mt-1">
                        <div className="flex items-end gap-2">
                            <Avatar
                                src={conversation?.avatar}
                                name={conversation?.name}
                                handle={conversation?.handle}
                                size="xs"
                                className="mb-0.5"
                            />
                            <div className="bg-[#F3F4F6] text-gray-500 rounded-lg rounded-tl-none px-3 py-2 text-[13px] italic shadow-sm flex items-center gap-1">
                                <span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span><span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Go To Bottom Button */}
            {showGoToBottom && (
                <button
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute bottom-20 right-4 w-10 h-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all z-40"
                >
                    <ChevronDown className="h-6 w-6" />
                </button>
            )}

            {/* Input */}
            <div className="relative p-4 pt-0 shrink-0 bg-white sticky bottom-0 z-30">
            {/* Added bg-white and sticky bottom to ensure it stays fixed if the parent height is weird */}
                {/* Emoji Picker Popover */}
                {showEmoji && (
                    <div className="absolute bottom-full mb-2 left-4 z-50 shadow-xl rounded-xl">
                        <EmojiPicker
                            onEmojiClick={(emojiData) => {
                                setMessageText((prev) => prev + emojiData.emoji);
                            }}
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <Plus className="h-5 w-5 stroke-[2.5]" />
                    </button>

                    <div className="flex-1 h-[44px] bg-gray-50 rounded-lg flex items-center px-4 gap-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                        <input
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onClickSendMessage();
                            }}
                            value={messageText}
                            onChange={handleMessageChange}
                            onClick={() => setShowEmoji(false)}
                            type="text"
                            placeholder="Type a message..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent outline-none text-[14px] font-medium placeholder:text-gray-400 text-gray-900 h-full disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2 text-gray-400 relative">
                            <button onClick={() => setShowEmoji(!showEmoji)} className="hover:text-gray-600">
                                <Smile className="h-4.5 w-4.5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="hover:text-gray-600">
                                <ImageIcon className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    </div>


                    <button onClick={onClickSendMessage} className="h-[44px] w-[44px] flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95">
                        <Send className="h-4.5 w-4.5 fill-current ml-0.5" />
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ChatMediaModal
                isOpen={showMediaModal}
                onClose={() => {
                    if (!isUploadingMedia) setShowMediaModal(false);
                }}
                files={selectedFiles}
                onSend={handleSendMedia}
                isUploading={isUploadingMedia}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
            />

            <ChatLightbox
                isOpen={showLightbox}
                onClose={() => setShowLightbox(false)}
                images={lightboxImages}
                initialIndex={lightboxIndex}
            />
        </div>
    );
};
