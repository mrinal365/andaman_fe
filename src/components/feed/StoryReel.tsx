'use client';

import { useRef, useState, useEffect } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { getStoryFeed, createStory } from '@/services/storyService';
import { uploadImage } from '@/services/uploadService';
import { StoryGroup } from '@/types/story';
import { StoryViewer } from './StoryViewer';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';

export const StoryReel = () => {
    const user = useAppSelector((state) => state.user.user);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [groups, setGroups] = useState<StoryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const [viewerState, setViewerState] = useState<{ isOpen: boolean; groupIndex: number }>({
        isOpen: false,
        groupIndex: 0
    });
    const [viewerSession, setViewerSession] = useState(0);

    const fetchStories = async () => {
        try {
            const data = await getStoryFeed();
            setGroups(data);
        } catch (err) {
            console.error('Failed to fetch stories', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [groups]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filesToUpload = Array.from(files).slice(0, 5);
        setIsUploading(true);
        
        try {
            let successCount = 0;
            for (const file of filesToUpload) {
                try {
                    const uploadRes = await uploadImage(file);
                    await createStory(uploadRes.url);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to upload story for ${file.name}`, err);
                    toast.error(`Failed to upload ${file.name}`);
                }
            }
            
            if (successCount > 0) {
                toast.success(`${successCount} ${successCount === 1 ? 'story' : 'stories'} posted!`);
                fetchStories(); // Refresh reel
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to post stories';
            toast.error(msg);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openViewer = (index: number) => {
        setViewerSession(s => s + 1);
        setViewerState({ isOpen: true, groupIndex: index });
    };

    const handleStoryViewed = (storyId: string) => {
        // Optimistically update local state to reflect seen story
        setGroups(prev => prev.map(group => {
            const updatedStories = group.stories.map(s =>
                s._id === storyId ? { ...s, isSeen: true } : s
            );
            const stillHasUnseen = updatedStories.some(s => !s.isSeen);
            return {
                ...group,
                stories: updatedStories,
                hasUnseen: stillHasUnseen
            };
        }));
    };

    const handleStoryLiked = (storyId: string) => {
        setGroups(prev => prev.map(group => {
            const updatedStories = group.stories.map(s => {
                if (s._id === storyId) {
                    const willBeLiked = !s.isLiked;
                    return {
                        ...s,
                        isLiked: willBeLiked,
                        stats: {
                            ...s.stats,
                            likeCount: s.stats.likeCount + (willBeLiked ? 1 : -1)
                        }
                    };
                }
                return s;
            });
            return { ...group, stories: updatedStories };
        }));
    };

    const userGroupIndex = groups.findIndex(g => g.author._id === user?.id || g.author._id === user?._id);
    const userGroup = userGroupIndex !== -1 ? groups[userGroupIndex] : null;
    const otherGroups = groups.filter((_, i) => i !== userGroupIndex);

    return (
        <div className="relative group/reel">
            {/* Scroll Buttons */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-[36px] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-black transition-all"
                >
                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto no-scrollbar py-2 items-start px-4 scroll-smooth"
            >
                {/* Dedicated Add Story Button */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                            "relative h-[66px] w-[66px] md:h-[72px] md:w-[72px] rounded-full flex items-center justify-center border-[2.5px] border-dashed border-gray-300 transition-all hover:border-black group/add",
                            isUploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 text-black animate-spin" />
                        ) : (
                            <Plus className="h-6 w-6 text-gray-400 group-hover/add:text-black transition-colors" />
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                    </button>
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                        Add
                    </span>
                </div>

                {/* Own Story Group (If exists) */}
                {userGroup && (
                    <div 
                        onClick={() => openViewer(userGroupIndex)}
                        className="flex flex-col items-center gap-2 cursor-pointer group/story shrink-0"
                    >
                        <div className={cn(
                            "h-[66px] w-[66px] md:h-[72px] md:w-[72px] rounded-full flex items-center justify-center p-1.5 transition-all group-active/story:scale-95",
                            userGroup.hasUnseen
                                ? "ring-[2.5px] ring-black ring-offset-2"
                                : "border border-gray-100"
                        )}>
                            <Avatar
                                src={user?.avatar || ''}
                                className="h-full w-full rounded-full"
                            />
                        </div>
                        <span className={cn(
                            "text-[12px] font-bold tracking-tight truncate max-w-[70px]",
                            userGroup.hasUnseen ? "text-black" : "text-gray-400"
                        )}>
                            You
                        </span>
                    </div>
                )}

                {/* Other Story Groups */}
                {otherGroups.map((group) => {
                    const originalIndex = groups.findIndex(g => g.author._id === group.author._id);
                    return (
                        <div
                            key={group.author._id}
                            onClick={() => openViewer(originalIndex)}
                            className="flex flex-col items-center gap-2 cursor-pointer group/story shrink-0"
                        >
                            <div className={cn(
                                "h-[66px] w-[66px] md:h-[72px] md:w-[72px] rounded-full flex items-center justify-center p-1.5 transition-all group-active/story:scale-95",
                                group.hasUnseen
                                    ? "ring-[2.5px] ring-black ring-offset-2"
                                    : "border border-gray-100"
                            )}>
                                <Avatar
                                    src={group.author.avatar}
                                    name={group.author.name}
                                    className="h-full w-full rounded-full"
                                />
                            </div>
                            <span className={cn(
                                "text-[12px] font-bold tracking-tight truncate max-w-[70px]",
                                group.hasUnseen ? "text-black" : "text-gray-400"
                            )}>
                                {group.author.name.split(' ')[0]}
                            </span>
                        </div>
                    );
                })}

                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                        <div className="h-[66px] w-[66px] md:h-[72px] md:w-[72px] rounded-full bg-gray-100" />
                        <div className="h-3 w-12 bg-gray-100 rounded" />
                    </div>
                ))}
            </div>

            {canScrollRight && !isLoading && groups.length > 3 && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-[36px] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-600 hover:text-black transition-all"
                >
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>
            )}

            {viewerState.isOpen && (
                <StoryViewer
                    key={viewerSession}
                    isOpen={viewerState.isOpen}
                    groups={groups}
                    initialGroupIndex={viewerState.groupIndex}
                    onClose={() => setViewerState(prev => ({ ...prev, isOpen: false }))}
                    onViewed={handleStoryViewed}
                    onLiked={handleStoryLiked}
                />
            )}
        </div>
    );
};
