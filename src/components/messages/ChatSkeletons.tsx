'use client';

export const ConversationSkeleton = () => {
    return (
        <div className="flex items-start gap-3 p-2.5 rounded-lg animate-pulse">
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="w-24 h-3.5 bg-gray-200 rounded" />
                    <div className="w-8 h-2.5 bg-gray-100 rounded" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-3/4 h-3 bg-gray-100 rounded" />
                    <div className="w-4 h-4 rounded-full bg-gray-50" />
                </div>
            </div>
        </div>
    );
};

export const MessageBubbleSkeleton = ({ isOwn }: { isOwn?: boolean }) => {
    return (
        <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-pulse`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0" />}
                <div className={`px-3 py-2 rounded-lg ${isOwn ? 'bg-gray-200 rounded-tr-none' : 'bg-gray-100 rounded-tl-none'} flex flex-col gap-1.5`}>
                    <div className={`h-3.5 ${isOwn ? 'w-32' : 'w-48'} bg-gray-300 opacity-20 rounded`} />
                    <div className={`h-3.5 ${isOwn ? 'w-24' : 'w-36'} bg-gray-300 opacity-20 rounded`} />
                </div>
            </div>
        </div>
    );
};

export const ChatSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col h-full bg-white animate-pulse">
            {/* Header Skeleton */}
            <div className="h-[60px] px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="flex flex-col gap-1.5">
                        <div className="w-32 h-3.5 bg-gray-200 rounded" />
                        <div className="w-20 h-2.5 bg-gray-100 rounded" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-gray-100" />
                    <div className="w-5 h-5 rounded-full bg-gray-100" />
                </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 p-4 space-y-6">
                <MessageBubbleSkeleton isOwn={false} />
                <MessageBubbleSkeleton isOwn={true} />
                <MessageBubbleSkeleton isOwn={false} />
                <MessageBubbleSkeleton isOwn={true} />
                <MessageBubbleSkeleton isOwn={false} />
            </div>

            {/* Input Skeleton */}
            <div className="p-4 border-t border-gray-100">
                <div className="w-full h-11 bg-gray-50 rounded-xl" />
            </div>
        </div>
    );
};
