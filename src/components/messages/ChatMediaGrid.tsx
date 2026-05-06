import React from 'react';
import { cn } from '@/utils/cn';

interface MediaItem {
    url: string;
    type?: string;
    thumbnail?: string;
}

interface ChatMediaGridProps {
    media: MediaItem[];
    onImageClick: (index: number) => void;
}

export const ChatMediaGrid: React.FC<ChatMediaGridProps> = ({ media, onImageClick }) => {
    if (!media || media.length === 0) return null;

    // Layout variations based on number of images
    const count = media.length;
    const maxDisplay = 4;
    const displayMedia = media.slice(0, maxDisplay);
    const extraCount = count - maxDisplay;

    const getGridClass = () => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count === 3) return "grid-cols-2";
        return "grid-cols-2"; // 4 or more
    };

    return (
        <div className={cn("grid gap-1 mt-1 mb-1 max-w-[280px] sm:max-w-[320px] rounded-md overflow-hidden", getGridClass())}>
            {displayMedia.map((item, index) => {
                // Determine spanning for 3 items (first item spans full width)
                const isFullWidth = count === 3 && index === 0;
                const isLastDisplay = index === maxDisplay - 1 && extraCount > 0;

                return (
                    <div
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(index);
                        }}
                        className={cn(
                            "relative cursor-pointer hover:opacity-90 transition-opacity bg-gray-200 overflow-hidden",
                            isFullWidth ? "col-span-2 aspect-[2/1]" : "aspect-square"
                        )}
                    >
                        <img
                            src={item.thumbnail || item.url}
                            alt={`Media ${index}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {isLastDisplay && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-medium">
                                +{extraCount}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
