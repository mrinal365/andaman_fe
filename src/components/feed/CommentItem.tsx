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
import { renderTextWithTags } from '@/utils/textParser';
import { searchUsers } from '@/services/userService';

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
    
    const [mentionQuery, setMentionQuery] = useState<{ query: string, index: number } | null>(null);
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [selectedMentions, setSelectedMentions] = useState<any[]>([]);

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

        let processedReplyText = replyText;
        const taggedUserIds: string[] = [];
        
        selectedMentions.forEach(u => {
            const mentionStr = `@${u.handle}`;
            if (processedReplyText.includes(mentionStr)) {
                processedReplyText = processedReplyText.replace(new RegExp(`@${u.handle}\\b`, 'g'), `@[${u.handle}](${u._id})`);
                if (!taggedUserIds.includes(u._id)) {
                    taggedUserIds.push(u._id);
                }
            }
        });

        const tempId = 'temp-' + Date.now();
        const optimisticReply = {
            id: tempId,
            _id: tempId,
            postId: comment.postId,
            parentCommentId: commentId,
            text: processedReplyText,
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
            const res = await replyToComment(commentId, processedReplyText, taggedUserIds);
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
                    <p className="text-[13px] text-gray-800 leading-relaxed mt-1 whitespace-pre-wrap">
                        {renderTextWithTags(comment.text)}
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
                        <div className="mt-3 relative animate-in fade-in slide-in-from-top-1 duration-200">
                            {mentionQuery && mentionResults.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-2 w-56 max-h-40 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-xl z-50">
                                    {mentionResults.map(u => (
                                        <button
                                            key={u._id}
                                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                            onClick={() => {
                                                const before = replyText.slice(0, mentionQuery.index);
                                                const after = replyText.slice(mentionQuery.index + mentionQuery.query.length + 1);
                                                setSelectedMentions(prev => [...prev, u]);
                                                setReplyText(`${before}@${u.handle} ${after}`);
                                                setMentionQuery(null);
                                            }}
                                        >
                                            <Avatar src={u.avatar} name={u.name} size="sm" className="w-[20px] h-[20px]" />
                                            <div className="text-xs font-bold text-gray-900 truncate">{u.name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setReplyText(val);
                                        const lastAt = val.lastIndexOf('@');
                                        if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === ' ')) {
                                            const query = val.slice(lastAt + 1);
                                            if (!query.includes(' ')) {
                                                setMentionQuery({ query, index: lastAt });
                                                if (query.length > 0) {
                                                    searchUsers(query).then(res => setMentionResults(res)).catch(() => {});
                                                } else {
                                                    setMentionResults([]);
                                                }
                                                return;
                                            }
                                        }
                                        setMentionQuery(null);
                                    }}
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
