'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostById, getComments } from '@/services/feedService';
import { FeedPost } from '@/components/feed/FeedPost';
import { CommentItem } from '@/components/feed/CommentItem';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setComments } from '@/store/features/commentSlice';
import { Post } from '../../../../../../types/post';

export default function PostPage() {
    const { postId } = useParams() as { postId: string };
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const comments = useAppSelector(state => state.comments.byPost[postId] || []);

    useEffect(() => {
        if (!postId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const postData = await getPostById(postId);
                setPost(postData);

                const commentsData = await getComments(postId);
                dispatch(setComments({ postId, comments: commentsData }));
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load post');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId, dispatch]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mb-4" />
                <p className="text-gray-500 font-medium">Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <ArrowLeft className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Post not found</h2>
                <p className="text-gray-500 mb-6">{error || "The post you're looking for doesn't exist or has been removed."}</p>
                <button 
                    onClick={() => router.push('/feed')}
                    className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
            {/* Sticky Header with Back Button */}
            <div className="sticky top-0 shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-md z-30">
                <div className="px-4 py-2 flex items-center justify-between min-h-[53px]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-900" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[19px] font-black text-gray-900 tracking-tight leading-tight">Post Detail</h1>
                            </div>
                            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Activity</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-0 md:px-0">
                <div className="mb-0">
                    <FeedPost post={post} />
                </div>

                <div className="px-4 md:px-6 py-6 pb-10">
                    {comments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500">No comments yet. Be the first to join the conversation!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-4">Comments ({post.stats?.commentCount || 0})</h3>
                            {comments.map((commentId) => (
                                <CommentItem key={commentId} commentId={commentId} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
