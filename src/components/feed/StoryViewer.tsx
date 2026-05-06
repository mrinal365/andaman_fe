'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/common/Modal';
import { Avatar } from '@/components/common/Avatar';
import { X, Heart, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { StoryGroup, Story } from '@/types/story';
import { likeStory, viewStory } from '@/services/storyService';
import { useAppSelector } from '@/store/hooks';
import { StoryInteractionsModal } from '@/components/common/StoryInteractionsModal';
import { cn } from '@/utils/cn';

interface StoryViewerProps {
    groups: StoryGroup[];
    initialGroupIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onViewed: (storyId: string) => void;
    onLiked: (storyId: string) => void;
}

export const StoryViewer = ({ groups, initialGroupIndex, isOpen, onClose, onViewed, onLiked }: StoryViewerProps) => {
    const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [interactionsModal, setInteractionsModal] = useState<{ isOpen: boolean; type: 'likes' | 'views' }>({
        isOpen: false,
        type: 'likes'
    });

    const currentUser = useAppSelector(state => state.user.user);
    const currentGroup = groups[groupIndex];
    const currentStory = currentGroup?.stories[storyIndex];

    const isOwnStory = currentUser?.id === currentGroup?.author?._id || currentUser?._id === currentGroup?.author?._id;

    // Reset when opening or changing group index
    useEffect(() => {
        if (isOpen) {
            setGroupIndex(initialGroupIndex);
            setStoryIndex(0);
            setProgress(0);
        }
    }, [isOpen, initialGroupIndex]);

    const nextStory = useCallback(() => {
        if (storyIndex < currentGroup.stories.length - 1) {
            setStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex(prev => prev + 1);
            setStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentGroup, groupIndex, groups.length, onClose, storyIndex]);

    const prevStory = useCallback(() => {
        if (storyIndex > 0) {
            setStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (groupIndex > 0) {
            setGroupIndex(prev => prev - 1);
            const prevGroup = groups[groupIndex - 1];
            setStoryIndex(prevGroup.stories.length - 1);
            setProgress(0);
        }
    }, [groupIndex, groups, storyIndex]);

    useEffect(() => {
        if (!isOpen || !currentStory) return;

        // Auto-advance progress bar
        const duration = 5000;
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    nextStory();
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        // Record view ONLY if not already seen
        if (!currentStory.isSeen) {
            viewStory(currentStory._id).then(res => {
                if (res?.newlyViewed) {
                    onViewed(currentStory._id);
                }
            }).catch(err => console.error("Failed to record view", err));
        }

        return () => clearInterval(timer);
    }, [currentStory?._id, isOpen, nextStory, onViewed]);

    if (!isOpen || !currentStory) return null;

    const handleLike = async () => {
        if (!currentStory) return;
        
        // Optimistic update
        onLiked(currentStory._id);
        
        try {
            await likeStory(currentStory._id);
        } catch (err) {
            // Revert on error
            onLiked(currentStory._id);
            console.error("Failed to like story", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none">
            {/* Close button */}
            <button 
                onClick={onClose}
                className="absolute top-10 right-4 md:top-6 md:right-6 z-[110] text-white/70 hover:text-white transition-colors"
            >
                <X size={32} strokeWidth={2.5} />
            </button>

            {/* Navigation controls */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-[105]" onClick={prevStory} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-[105]" onClick={nextStory} />
            
            {/* Nav Arrows (Desktop) */}
            <button 
                onClick={prevStory}
                className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hidden md:block",
                    (groupIndex === 0 && storyIndex === 0) && "opacity-0 pointer-events-none"
                )}
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                onClick={nextStory}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hidden md:block"
            >
                <ChevronRight size={32} />
            </button>

            <div className="relative w-full h-full md:h-auto md:max-w-[450px] md:aspect-[9/16] bg-neutral-900 md:rounded-xl overflow-hidden shadow-2xl md:border md:border-white/5">
                {/* Progress bars */}
                <div className="absolute top-0 inset-x-0 p-3 pt-6 md:pt-3 z-20 flex gap-1.5">
                    {currentGroup.stories.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-[50ms] ease-linear" 
                                style={{ 
                                    width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%' 
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-10 md:top-8 inset-x-0 p-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar src={currentGroup.author.avatar} name={currentGroup.author.name} size="md" className="border-2 border-white/20" />
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">{currentGroup.author.name}</p>
                            <p className="text-white/60 text-[11px] font-medium tracking-tight">@{currentGroup.author.handle}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <img 
                    src={currentStory.imageUrl} 
                    alt="Story content" 
                    className="w-full h-full object-cover"
                />

                {/* Footer / Stats */}
                <div className="absolute bottom-0 inset-x-0 p-6 pb-10 md:pb-6 z-[110] bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className={cn(
                                    "p-2.5 rounded-full transition-all active:scale-90",
                                    currentStory.isLiked ? "bg-red-500 text-white" : "bg-white/10 text-white group-hover:bg-white/20"
                                )}>
                                    <Heart size={20} fill={currentStory.isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                                </div>
                                <span 
                                    onClick={(e) => {
                                        if (isOwnStory) {
                                            e.stopPropagation();
                                            setInteractionsModal({ isOpen: true, type: 'likes' });
                                        }
                                    }}
                                    className={cn(
                                        "text-[10px] font-bold text-white uppercase tracking-widest",
                                        isOwnStory && "hover:underline cursor-pointer"
                                    )}
                                >
                                    {currentStory.stats.likeCount || 0}
                                </span>
                            </button>

                            <div 
                                onClick={(e) => {
                                    if (isOwnStory) {
                                        e.stopPropagation();
                                        setInteractionsModal({ isOpen: true, type: 'views' });
                                    }
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-1",
                                    isOwnStory && "cursor-pointer group/view"
                                )}
                            >
                                <div className="p-2.5 rounded-full bg-white/10 text-white group-hover/view:bg-white/20 transition-all">
                                    <Eye size={20} strokeWidth={2.5} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold text-white uppercase tracking-widest",
                                    isOwnStory && "group-hover/view:underline"
                                )}>
                                    {currentStory.stats.viewCount || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StoryInteractionsModal 
                storyId={currentStory._id}
                type={interactionsModal.type}
                isOpen={interactionsModal.isOpen}
                onClose={() => setInteractionsModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
