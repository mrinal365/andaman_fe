'use client'

import { Post } from '../../../types/post';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Bookmark, BadgeCheck, Eye, Share2, MoreVertical, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

import { likeUnlikePost, savePost, recordView, deletePost } from '@/services/feedService';
import { followUser, unfollowUser } from '@/services/userService';
import { INTERACTION_TYPE } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTagStyles } from '@/utils';
import { cn } from '@/utils/cn';
import { toggleLikeOptimistic, toggleSavedOptimistic, deletePostOptimistic } from '@/store/features/postSlice';
import { VideoPlayer } from './VideoPlayer';
import { PostDetailModal } from './PostDetailModal';
import { renderTextWithTags } from '@/utils/textParser';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { SafeImage } from '@/components/common/SafeImage';
import { LikesModal } from '@/components/common/LikesModal';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

export const FeedPost = ({ post }: { post: Post }) => {
    const postImages = post?.images?.length ? post.images : [];

    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.user.user);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [focusComments, setFocusComments] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(post?.viewerState?.followingAuthor);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTagHovered, setIsTagHovered] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const authorData = post.author || post.authorId;
    const authorId = authorData?._id || authorData;
    const isOwnPost = currentUser?.id === authorId;
    const authorHandle = authorData?.handle || (isOwnPost ? currentUser?.handle : '');


    const postId = post.id;

    // View tracking refs
    const hasViewedRef = useRef(false);
    const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const postRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;

            // Clear existing timer if any
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
                viewTimerRef.current = null;
            }

            // If significantly visible and hasn't been viewed this session
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !hasViewedRef.current) {
                viewTimerRef.current = setTimeout(() => {
                    // Final check: Is tab still focused?
                    if (document.visibilityState === 'visible') {
                        hasViewedRef.current = true;
                        recordView(postId).catch(() => {
                            // Silently fail if view recording fails, 
                            // maybe reset flag so it tries again later?
                            hasViewedRef.current = false;
                        });
                    }
                }, 1000); // 1s dwell time
            }
        };

        const currentRef = postRef.current;
        if (currentRef) {
            observerRef.current = new IntersectionObserver(handleIntersect, {
                threshold: [0, 0.6, 1.0]
            });
            observerRef.current.observe(currentRef);
        }

        return () => {
            if (observerRef.current && currentRef) {
                observerRef.current.unobserve(currentRef);
            }
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
            }
        };
    }, [postId]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleDeletePost = async () => {
        try {
            setIsDeleting(true);
            await deletePost(postId);
            dispatch(deletePostOptimistic(postId));
            toast.success("Post deleted successfully");
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    // =====================
    // IMAGE GRID LAYOUTS
    // =====================
    const renderImageGrid = () => {
        // If it's a video post, don't render images
        // if (content.video) return null;

        if (postImages.length === 0) return null;

        if (postImages.length === 1) {
            return (
                <div className="relative w-full rounded-xl overflow-hidden mt-1 shadow-sm border border-gray-100/50 bg-black/5">
                    <SafeImage
                        src={postImages[0]}
                        alt="Post content"
                        width={1200}
                        height={1200}
                        className="w-full h-auto max-h-[750px] object-contain block"
                    />
                </div>
            );
        }

        if (postImages.length === 2) {
            return (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mt-1 shadow-sm border border-gray-100/50">
                    {postImages.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square bg-black/5">
                            <SafeImage
                                src={img}
                                alt={`Image ${i + 1}`}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover block"
                            />
                        </div>
                    ))}
                </div>
            );
        }

        if (postImages.length === 3) {
            return (
                <div className="grid grid-cols-3 grid-rows-2 gap-1 rounded-xl overflow-hidden mt-1 shadow-sm border border-gray-100/50 h-[300px] md:h-[360px]">
                    <div className="row-span-2 col-span-2 bg-black/5">
                        <SafeImage
                            src={postImages[0]}
                            alt="Image 1"
                            width={800}
                            height={800}
                            className="w-full h-full object-cover block"
                        />
                    </div>
                    <div className="bg-black/5">
                        <SafeImage
                            src={postImages[1]}
                            alt="Image 2"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover block"
                        />
                    </div>
                    <div className="bg-black/5">
                        <SafeImage
                            src={postImages[2]}
                            alt="Image 3"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover block"
                        />
                    </div>
                </div>
            );
        }

        // 4 or more — 2×2 grid, last cell shows "+N" if more than 4
        const gridImages = postImages.slice(0, 4);
        const extraCount = postImages.length - 4;

        return (
            <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mt-1 shadow-sm border border-gray-100/50">
                {gridImages.map((img: string, i: number) => (
                    <div key={i} className="relative aspect-square bg-black/5">
                        <SafeImage
                            src={img}
                            alt={`Image ${i + 1}`}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover block"
                        />
                        {/* "+N more" overlay on last cell */}
                        {i === 3 && extraCount > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">+{extraCount}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };



    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            toast.error('Please login to follow users');
            return;
        }
        if (!authorData?._id) return;
        try {
            setIsFollowLoading(true);
            if (isFollowing) {
                await unfollowUser(authorData._id);
                setIsFollowing(false);
                toast.success(`Unfollowed ${authorData.name}`);
            } else {
                await followUser(authorData._id);
                setIsFollowing(true);
                toast.success(`You followed ${authorData.name}`);
            }
        } catch (err) {
            toast.error('Action failed');
        } finally {
            setIsFollowLoading(false);
        }
    };

    const addInteraction = (type: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        switch (type) {
            case INTERACTION_TYPE.LIKE:
                dispatch(toggleLikeOptimistic(postId));
                likeUnlikePost(post._id).then((res) => {
                    toast.success(res.message);
                }).catch((err) => {
                    // rollback on failure
                    dispatch(toggleLikeOptimistic(postId));
                    toast.error(err.message);
                });
                break;
            case INTERACTION_TYPE.SAVE:
                dispatch(toggleSavedOptimistic(postId));
                savePost(post._id).then((res: any) => {
                    toast.success(res.saved ? 'Post saved' : 'Post unsaved');
                }).catch((err: any) => {
                    // rollback on failure
                    dispatch(toggleSavedOptimistic(postId));
                    toast.error(err.message || 'Failed to save');
                });
                break;
        }
    };

    return (
        <div ref={postRef}>
            <Card
                className="flex flex-col gap-2 p-3 md:p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                padding="none"
                onClick={() => setIsDetailOpen(true)}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={authorData?.name || (isOwnPost ? currentUser?.name : '')}
                            src={authorData?.avatar || (isOwnPost ? currentUser?.avatar : 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250')}
                            handle={authorHandle}
                            size="md"
                        />
                        <div>
                            <div className="flex items-center gap-1 flex-wrap">
                                <Link
                                    href={`/u/${authorHandle}`}
                                    className="font-bold text-sm text-gray-900 leading-none hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {authorData?.name || (isOwnPost ? currentUser?.name : 'demo author')}
                                </Link>
                                {authorData?.verified && (
                                    <BadgeCheck className="h-[14px] w-[14px] text-green-700 fill-green-700/30" />
                                )}
                                {post?.taggedUsers && post.taggedUsers.length > 0 && (
                                    <span className="text-[13px] text-gray-500 flex items-center gap-1 flex-wrap">
                                        with{' '}
                                        <Link 
                                            href={`/u/${post.taggedUsers[0].handle}`} 
                                            className="font-bold text-gray-700 hover:text-[var(--color-primary)] transition-colors hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {post.taggedUsers[0].name}
                                        </Link>
                                        {post.taggedUsers.length > 1 && (
                                            <div 
                                                className="relative inline-block"
                                                onMouseEnter={() => setIsTagHovered(true)}
                                                onMouseLeave={() => setIsTagHovered(false)}
                                            >
                                                <span className="font-bold text-gray-500 cursor-help">
                                                    {` +${post.taggedUsers.length - 1}`}
                                                </span>
                                                
                                                {isTagHovered && (
                                                    <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tagged Users</p>
                                                        <div className="flex flex-col gap-2">
                                                            {post.taggedUsers.map((tu: any) => (
                                                                <div key={tu._id} className="flex items-center gap-2">
                                                                    <Avatar src={tu.avatar} name={tu.name} size="xs" />
                                                                    <span className="text-xs font-bold text-gray-700 truncate">{tu.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {new Date(post?.createdAt).toLocaleString()}
                                {/* {post?.location && ` • ${post?.location}`} */}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isOwnPost && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={cn(
                                    "text-[12px] font-bold px-3 py-1 rounded-lg transition-all",
                                    isFollowing
                                        ? "text-gray-400 hover:text-gray-600"
                                        : "text-[var(--color-primary)] hover:bg-blue-50"
                                )}
                            >
                                {isFollowLoading ? "..." : isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                        {post?.type && (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getTagStyles(post?.type)}`}>
                                {post.type}
                            </span>
                        )}

                        {isOwnPost && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(!isMenuOpen);
                                    }}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete Post</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Text */}
                {post?.feed?.title && (
                    <p className="text-[14px] text-gray-800 leading-relaxed font-bold">{post.feed.title}</p>
                )}
                <p className="text-[14px] text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {renderTextWithTags(post?.feed?.previewText || '')}
                </p>

                {/* Content: Video OR Image Grid */}
                {/* {post?.video ? (
                    <VideoPlayer url={post?.video} />
                ) : ( */}
                {renderImageGrid()}
                {/* )} */}

                {/* Actions */}
                <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1">
                        {/* Like */}
                        <div className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-md hover:bg-gray-100/60 transition-all">
                            <button
                                onClick={(e) => addInteraction(INTERACTION_TYPE.LIKE, e)}
                                className="active:scale-95"
                            >
                                <Heart
                                    className={`h-[20px] w-[20px] stroke-[1.5] transition-colors 
                                    ${post?.viewerState?.liked ? 'text-[var(--color-primary)] fill-[var(--color-primary)]' : 'text-gray-500 stroke-[1.5]'}`}
                                />
                            </button>
                            {isOwnPost ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsLikesModalOpen(true);
                                    }}
                                    className="text-[13px] font-semibold text-gray-500 hover:text-[var(--color-primary)] hover:underline tabular-nums"
                                >
                                    {post?.stats?.likeCount}
                                </button>
                            ) : (
                                <span className="text-[13px] font-semibold text-gray-500 tabular-nums">
                                    {post?.stats?.likeCount}
                                </span>
                            )}
                        </div>

                        {/* Comment count */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setFocusComments(true); setIsDetailOpen(true); }}
                            className="flex items-center gap-1.5 group p-1.5 rounded-md hover:bg-gray-100/60 transition-all active:scale-95"
                        >
                            <MessageCircle className="h-[20px] w-[20px] stroke-[1.5] text-gray-500 transition-colors" />
                            <span className="text-[13px] font-semibold text-gray-500 tabular-nums">
                                {post?.stats?.commentCount || 0}
                            </span>
                        </button>

                        {/* Views */}
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 group p-1.5 rounded-md hover:bg-gray-100/60 transition-all active:scale-95"
                        >
                            <Eye className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] transition-colors" />
                            <span className="text-[13px] font-semibold text-gray-500 tabular-nums">{post?.stats?.viewCount || 0}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Share */}
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 group p-1.5 rounded-full hover:bg-green-50/60 transition-all active:scale-95"
                        >
                            <Share2 className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-green-600 translate-y-0.5 transition-colors" />
                        </button>

                        {/* Bookmark */}
                        <button
                            onClick={(e) => addInteraction(INTERACTION_TYPE.SAVE, e)}
                            className="group p-1.5 -mr-1.5 rounded-full hover:bg-gray-100/60 transition-all active:scale-95"
                        >
                            <Bookmark className={post?.viewerState?.saved ? 'h-[20px] w-[20px] text-gray-500 stroke-[1.5] fill-black' : 'h-[20px] w-[20px] text-gray-500 stroke-[1.5]'} />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Post Detail Modal / Drawer */}
            <PostDetailModal
                post={post}
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setFocusComments(false); }}
                scrollToComments={focusComments}
            />

            {/* Likes List Modal (Author only) */}
            {isOwnPost && (
                <LikesModal
                    postId={postId}
                    isOpen={isLikesModalOpen}
                    onClose={() => setIsLikesModalOpen(false)}
                />
            )}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Post"
                size="sm"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-600">
                        <AlertCircle className="shrink-0" size={24} />
                        <p className="text-sm font-medium">Are you sure you want to delete this post? This action cannot be undone.</p>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 border-red-600 shadow-lg shadow-red-200"
                            onClick={handleDeletePost}
                            loading={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
