'use client';

import { useRef, useState, useEffect } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const STORIES = [
    { id: 'user', name: 'My Story', img: 'https://i.pravatar.cc/150?u=user1', isUser: true },
    { id: '1', name: 'Mark', img: 'https://i.pravatar.cc/150?u=mark', seen: false },
    { id: '2', name: 'Sarah', img: 'https://i.pravatar.cc/150?u=sarah', seen: false },
    { id: '3', name: 'Alex', img: 'https://i.pravatar.cc/150?u=alex', seen: true },
    { id: '4', name: 'Minimal', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=150&q=80', seen: false },
    { id: '5', name: 'Julia', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', seen: false },
    { id: '6', name: 'David', img: 'https://i.pravatar.cc/150?u=david', seen: true },
    { id: '7', name: 'Elena', img: 'https://i.pravatar.cc/150?u=elena', seen: false },
];

export const StoryReel = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-[40%] -translate-y-1/2 z-10 bg-gradient-to-b from-white to-gray-100 rounded-full p-1.5 shadow border border-gray-200 text-gray-600 hover:text-gray-900 transition-all active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                </button>
            )}

            {/* Reel Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-5 overflow-x-auto no-scrollbar py-2 items-start mt-2 pl-1 scroll-smooth"
            >
                {STORIES.map((story) => {
                    const ringSize = "h-[60px] w-[60px] md:h-[72px] md:w-[72px]"; // Responsive size
                    const imageSize = "h-[52px] w-[52px] md:h-[62px] md:w-[62px]"; // Responsive size

                    if (story.isUser) {
                        return (
                            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group/story shrink-0">
                                <div className={`relative ${ringSize} rounded-full border-[2px] border-dashed border-gray-300 flex items-center justify-center p-1`}>
                                    <Avatar
                                        src={story.img}
                                        className={`${imageSize} rounded-full`}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-[var(--color-primary)] rounded-full p-1 border-[2.5px] border-white translate-x-1 translate-y-0.5 shadow-sm">
                                        <Plus className="h-3.5 w-3.5 text-white stroke-[3.5px]" />
                                    </div>
                                </div>
                                <span className="text-[13px] font-bold text-gray-900 tracking-tight">{story.name}</span>
                            </div>
                        )
                    }

                    return (
                        <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group/story shrink-0">
                            <div className={`${ringSize} rounded-full border-[2.5px] ${story.seen ? 'border-gray-200' : 'border-[#9d0208]'} flex items-center justify-center p-1`}>
                                <Avatar
                                    src={story.img}
                                    className={`${imageSize} rounded-full`}
                                />
                            </div>
                            <span className="text-[13px] font-medium text-gray-700 group-hover/story:text-gray-900 transition-colors">{story.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-[40%] -translate-y-1/2 z-10 bg-gradient-to-b from-white to-gray-100 rounded-full p-1.5 shadow border border-gray-200 text-gray-600 hover:text-gray-900 transition-all opacity-80 hover:opacity-100 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </button>
            )}
        </div>
    );
};
