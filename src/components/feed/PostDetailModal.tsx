'use client'

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Send, Bookmark, BadgeCheck, Eye, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './swiper-custom.css';

import { commentOnPost, getComments, likeUnlikePost, savePost, recordView } from '@/services/feedService';
import { INTERACTION_TYPE } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { getTagStyles } from '@/utils';
import { increaseCommentCount, toggleLikeOptimistic, toggleSavedOptimistic } from '@/store/features/postSlice';
import { addCommentOptimistic, deleteComment, replaceComment, setComments } from '@/store/features/commentSlice';

import { Avatar } from '@/components/common/Avatar';
import { SafeImage } from '@/components/common/SafeImage';
import { CommentItem } from './CommentItem';
import { LikesModal } from '@/components/common/LikesModal';
import { searchUsers } from '@/services/userService';

interface PostDetailModalProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
    scrollToComments?: boolean;
}

export const PostDetailModal = ({ post: postProp, isOpen, onClose, scrollToComments }: PostDetailModalProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);

    // Read post from Redux so interactions reflect in both modal and feed card
    const postId = postProp?.id || postProp?._id;
    const post = useAppSelector((state: RootState) => state.posts.byId[postId]) || postProp;

    const comments = useAppSelector((state: RootState) => state.comments.byPost[post?._id] || []);
    const commentById = useAppSelector((state: RootState) => state.comments.byId);

    const [commentMessage, setCommentMessage] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const [mentionQuery, setMentionQuery] = useState<{ query: string, index: number } | null>(null);
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [selectedMentions, setSelectedMentions] = useState<any[]>([]);

    const isOwnPost = user?.id === (typeof post?.authorId === 'object' ? post?.authorId?._id : post?.authorId);

    const commentsEndRef = useRef<HTMLDivElement>(null);
    const commentsSectionRef = useRef<HTMLDivElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const postImages = post?.images?.length ? post.images : [];

    useEffect(() => {
        setMounted(true);
    }, []);

    // fetch comments + record view when opened
    useEffect(() => {
        if (isOpen && post?._id) {
            setIsLoadingComments(true);
            getComments(post._id)
                .then((res) => {
                    dispatch(setComments({ postId: post._id, comments: res }));
                })
                .catch((err) => console.error(err))
                .finally(() => setIsLoadingComments(false));

            // fire-and-forget view tracking
            recordView(post._id).catch(() => { });
        }
    }, [isOpen, post?._id, dispatch]);

    // scroll to comments section when opened via comment icon
    useEffect(() => {
        if (isOpen && scrollToComments) {
            setTimeout(() => {
                commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                commentInputRef.current?.focus();
            }, 150);
        }
    }, [isOpen, scrollToComments]);

    // lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const addInteraction = (type: string, msg?: string) => {
        switch (type) {
            case INTERACTION_TYPE.LIKE:
                dispatch(toggleLikeOptimistic(postId));
                likeUnlikePost(post._id).then((res) => {
                    toast.success(res.message);
                }).catch((err) => {
                    dispatch(toggleLikeOptimistic(postId));
                    toast.error(err.message);
                });
                break;
            case INTERACTION_TYPE.SAVE:
                dispatch(toggleSavedOptimistic(postId));
                savePost(post._id).then((res: any) => {
                    toast.success(res.message);
                }).catch((err: any) => {
                    dispatch(toggleSavedOptimistic(postId));
                    toast.error(err.message);
                });
                break;
            case INTERACTION_TYPE.COMMENT:
                if (!msg?.trim()) return;
                let processedMsg = msg;
                const taggedUserIds: string[] = [];
                
                selectedMentions.forEach(u => {
                    const mentionStr = `@${u.handle}`;
                    if (processedMsg.includes(mentionStr)) {
                        processedMsg = processedMsg.replace(new RegExp(`@${u.handle}\\b`, 'g'), `@[${u.handle}](${u._id})`);
                        if (!taggedUserIds.includes(u._id)) {
                            taggedUserIds.push(u._id);
                        }
                    }
                });

                const tempId = 'temp-' + Date.now();
                const optimisticComment = {
                    id: tempId,
                    _id: tempId,
                    postId: post._id,
                    parentCommentId: null,
                    text: processedMsg,
                    createdAt: new Date().toISOString(),
                    author: {
                        id: user?._id || '',
                        _id: user?._id || '',
                        name: user?.name || '',
                        handle: user?.handle || '',
                        avatar: user?.avatar || '',
                        verified: user?.verified || false,
                    },
                    stats: { likeCount: 0, replyCount: 0 },
                    viewerState: { liked: false },
                };
                dispatch(addCommentOptimistic({ comment: optimisticComment }));
                dispatch(increaseCommentCount(postId));
                setCommentMessage('');

                // scroll to the new comment
                setTimeout(() => {
                    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);

                commentOnPost(post._id, processedMsg, taggedUserIds).then((res) => {
                    dispatch(replaceComment({ tempId, realComment: res }));
                }).catch((err) => {
                    dispatch(deleteComment({ commentId: tempId }));
                    toast.error(err.message);
                });
                break;
        }
    };

    if (!isOpen || !mounted || !post) return null;

    const content = (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Container — drawer on mobile, modal on desktop */}
            <div className={`
                relative bg-white flex flex-col overflow-hidden
                w-full max-h-[85vh]
                rounded-t-2xl
                md:rounded-2xl md:max-w-2xl md:w-full md:max-h-[90vh]
                shadow-2xl
                animate-in slide-in-from-bottom duration-300 md:fade-in md:zoom-in-95 md:slide-in-from-bottom-0
            `}>
                {/* Drag handle — mobile only */}
                <div className="md:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar name={post?.authorId?.name} src={post?.authorId?.avatar} size="md" />
                        <div>
                            <div className="flex items-center gap-1">
                                <h4 className="font-bold text-sm text-gray-900">{post?.authorId?.name || 'Author'}</h4>
                                {post?.authorId?.verified && (
                                    <BadgeCheck className="h-[14px] w-[14px] text-green-700 fill-green-700/30" />
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                {new Date(post?.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post?.type && (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getTagStyles(post?.type)}`}>
                                {post.type}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Post text */}
                    <div className="px-4 md:px-6 pt-4">
                        {post?.feed?.title && (
                            <p className="text-[14px] text-gray-800 leading-relaxed font-bold mb-1">{post.feed.title}</p>
                        )}
                        <p className="text-[14px] text-gray-800 leading-relaxed">
                            {post?.feed?.previewText?.split(' ')?.map((word: string, i: number) =>
                                word.startsWith('#')
                                    ? <span key={i} className="text-[var(--color-primary)] font-semibold">{word} </span>
                                    : word + ' '
                            )}
                        </p>
                    </div>

                    {/* Image carousel */}
                    {postImages.length > 0 && (
                        <div className="relative mt-3 w-full overflow-hidden bg-black/5">
                            {postImages.length === 1 ? (
                                <SafeImage
                                    src={postImages[0]}
                                    alt="Post content"
                                    width={1200}
                                    height={1200}
                                    className="w-full h-auto max-h-[500px] object-contain block"
                                />
                            ) : (
                                <Swiper
                                    modules={[Pagination, Navigation]}
                                    pagination={{ clickable: true }}
                                    navigation={{
                                        prevEl: '.detail-swiper-prev',
                                        nextEl: '.detail-swiper-next',
                                    }}
                                    autoHeight={true}
                                    className="w-full relative"
                                >
                                    {postImages.map((img: string, i: number) => (
                                        <SwiperSlide key={i} className="w-full flex items-center justify-center">
                                            <SafeImage
                                                src={img}
                                                alt={`Image ${i + 1}`}
                                                width={1200}
                                                height={1200}
                                                className="w-full h-auto max-h-[500px] object-contain block"
                                            />
                                        </SwiperSlide>
                                    ))}
                                    <button className="detail-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-gray-200/90 hover:bg-white rounded-full shadow-sm transition-all [&.swiper-button-disabled]:hidden">
                                        <ChevronLeft className="w-[18px] h-[18px] text-gray-700 -ml-0.5" strokeWidth={2.5} />
                                    </button>
                                    <button className="detail-swiper-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-gray-200/90 hover:bg-white rounded-full shadow-sm transition-all [&.swiper-button-disabled]:hidden">
                                        <ChevronRight className="w-[18px] h-[18px] text-gray-700 -mr-0.5" strokeWidth={2.5} />
                                    </button>
                                </Swiper>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-md hover:bg-gray-100/60 transition-all">
                                <button
                                    onClick={() => addInteraction(INTERACTION_TYPE.LIKE)}
                                    className="active:scale-95"
                                >
                                    <Heart className={`h-[20px] w-[20px] stroke-[1.5] transition-colors ${post?.viewerState?.liked ? 'text-[var(--color-primary)] fill-[var(--color-primary)]' : 'text-gray-500'}`} />
                                </button>
                                {isOwnPost ? (
                                    <button
                                        onClick={() => setIsLikesModalOpen(true)}
                                        className="text-[13px] font-semibold text-gray-500 hover:text-[var(--color-primary)] hover:underline tabular-nums"
                                    >
                                        {post?.stats?.likeCount}
                                    </button>
                                ) : (
                                    <span className="text-[13px] font-semibold text-gray-500 tabular-nums">{post?.stats?.likeCount}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 rounded-md">
                                <MessageCircle className="h-[20px] w-[20px] stroke-[1.5] text-gray-500" />
                                <span className="text-[13px] font-semibold text-gray-500 tabular-nums">{post?.stats?.commentCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 rounded-md">
                                <Eye className="h-[20px] w-[20px] stroke-[1.5] text-gray-500" />
                                <span className="text-[13px] font-semibold text-gray-500 tabular-nums">{post?.stats?.viewCount || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-full hover:bg-green-50/60 transition-all active:scale-95">
                                <Share2 className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] translate-y-0.5" />
                            </button>
                            <button
                                onClick={() => addInteraction(INTERACTION_TYPE.SAVE)}
                                className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100/60 transition-all active:scale-95"
                            >
                                <Bookmark className={post?.viewerState?.saved ? 'h-[20px] w-[20px] text-gray-500 stroke-[1.5] fill-black' : 'h-[20px] w-[20px] text-gray-500 stroke-[1.5]'} />
                            </button>
                        </div>
                    </div>

                    {/* Comments */}
                    <div ref={commentsSectionRef} className="px-4 md:px-6 py-4">
                        <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-4">Comments</h3>
                        {isLoadingComments ? (
                            <div className="flex justify-center py-6">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {comments.map((cid: string) => (
                                    <CommentItem key={cid} commentId={cid} />
                                ))}
                                <div ref={commentsEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment input — sticky bottom */}
                <div className="shrink-0 border-t border-gray-100 px-4 md:px-6 py-3 bg-white relative">
                    
                    {/* Mention Dropdown */}
                    {mentionQuery && mentionResults.length > 0 && (
                        <div className="absolute bottom-full left-4 md:left-6 mb-2 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-xl z-50">
                            {mentionResults.map(u => (
                                <button
                                    key={u._id}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                    onClick={() => {
                                        const before = commentMessage.slice(0, mentionQuery.index);
                                        const after = commentMessage.slice(mentionQuery.index + mentionQuery.query.length + 1);
                                        setSelectedMentions(prev => [...prev, u]);
                                        setCommentMessage(`${before}@${u.handle} ${after}`);
                                        setMentionQuery(null);
                                        commentInputRef.current?.focus();
                                    }}
                                >
                                    <Avatar src={u.avatar} name={u.name} size="sm" />
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">{u.name}</div>
                                        <div className="text-[10px] text-gray-500">@{u.handle}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Avatar name={user?.name} src={user?.avatar} size="sm" />
                        <div className="flex-1 bg-gray-50 rounded-xl pl-3 pr-2 py-2 flex items-center justify-between focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                            <input
                                type="text"
                                value={commentMessage}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCommentMessage(val);
                                    
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
                                    if (e.key === 'Enter') addInteraction(INTERACTION_TYPE.COMMENT, commentMessage);
                                }}
                                placeholder="Add a comment..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-800"
                                ref={commentInputRef}
                            />
                            <button
                                onClick={() => addInteraction(INTERACTION_TYPE.COMMENT, commentMessage)}
                                className="text-gray-400 hover:text-[var(--color-primary)] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <Send className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Likes List Modal (Author only) */}
                {isOwnPost && (
                    <LikesModal
                        postId={postId}
                        isOpen={isLikesModalOpen}
                        onClose={() => setIsLikesModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
};
