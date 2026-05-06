'use client'

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { toggleCommentLikeOptimistic, addCommentOptimistic, replaceComment, deleteComment } from '@/store/features/commentSlice';
import { likeUnlikeComment, replyToComment } from '@/services/feedService';
import { cn } from '@/utils/cn';
import { toast } from 'react-toastify';

interface CommentItemProps {
    commentId: string;
    level?: number;
}

export const CommentItem = ({ commentId, level = 0 }: CommentItemProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.user.user);
    const comment = useAppSelector((state: RootState) => state.comments.byId[commentId]);
    const replyIds = useAppSelector((state: RootState) => state.comments.byParent[commentId] || []);

    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    if (!comment) return null;

    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like');
            return;
        }
        dispatch(toggleCommentLikeOptimistic({ commentId }));
        try {
            await likeUnlikeComment(commentId);
        } catch (err: any) {
            dispatch(toggleCommentLikeOptimistic({ commentId }));
            toast.error(err.message || 'Failed to like comment');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        if (!user) {
            toast.error('Please login to reply');
            return;
        }

        const tempId = 'temp-' + Date.now();
        const optimisticReply = {
            id: tempId,
            _id: tempId,
            postId: comment.postId,
            parentCommentId: commentId,
            text: replyText,
            createdAt: new Date().toISOString(),
            author: {
                id: user?.id || "",
                _id: user?._id || "",
                name: user?.name || "",
                handle: user?.handle || "",
                avatar: user?.avatar || "",
                verified: user?.verified || false,
            },
            stats: { likeCount: 0, replyCount: 0 },
            viewerState: { liked: false }
        };

        dispatch(addCommentOptimistic({ comment: optimisticReply }));
        setReplyText('');
        setIsReplying(false);
        setIsSubmittingReply(true);

        try {
            const res = await replyToComment(commentId, optimisticReply.text);
            dispatch(replaceComment({ tempId, realComment: res }));
        } catch (err: any) {
            dispatch(deleteComment({ commentId: tempId }));
            toast.error(err.message || 'Failed to send reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", level > 0 && "ml-10 mt-2")}>
            <div className="flex items-start gap-2">
                <Avatar src={comment.author?.avatar} size="sm" className="w-[30px] h-[30px] shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-[13px] text-gray-900 leading-none">{comment.author?.name}</span>
                        {comment.author?.id === user?.id && (
                            <span className="text-[10px] text-[var(--color-primary)] font-semibold">you</span>
                        )}
                        <span className="text-[11px] text-gray-400 leading-none">
                            {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-[13px] text-gray-800 leading-relaxed mt-1">
                        {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1 group transition-all"
                        >
                            <Heart className={cn(
                                "w-3.5 h-3.5 transition-colors",
                                comment.viewerState?.liked ? "text-red-500 fill-red-500" : "text-gray-400 group-hover:text-red-500"
                            )} />
                            {comment.stats?.likeCount ? (
                                <span className={cn("text-[11px] font-bold tabular-nums", comment.viewerState?.liked ? "text-red-500" : "text-gray-500")}>
                                    {comment.stats.likeCount}
                                </span>
                            ) : null}
                        </button>

                        {/* Only allow 1 level of replies for now as requested */}
                        {level === 0 && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="text-[11px] font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <input
                                autoFocus
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleReply();
                                }}
                                placeholder={`Reply to ${comment.author?.name}...`}
                                className="flex-1 bg-gray-50 border-none outline-none text-[13px] py-1.5 px-3 rounded-lg focus:ring-1 focus:ring-gray-200 transition-all"
                            />
                            <button
                                onClick={handleReply}
                                disabled={!replyText.trim() || isSubmittingReply}
                                className="text-[var(--color-primary)] font-bold text-[13px] px-2 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Replies */}
            {replyIds.length > 0 && (
                <div className="flex flex-col gap-1 border-l-2 border-gray-50 mt-1">
                    {replyIds.map(id => (
                        <CommentItem key={id} commentId={id} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};
