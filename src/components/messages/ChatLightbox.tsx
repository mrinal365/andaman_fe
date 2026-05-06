import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: { url: string }[];
    initialIndex?: number;
}

export const ChatLightbox: React.FC<ChatLightboxProps> = ({ isOpen, onClose, images, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!isOpen || !images || images.length === 0) return null;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none" onClick={onClose}>
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
                <span className="text-sm font-medium opacity-80">
                    {currentIndex + 1} of {images.length}
                </span>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Prev Button */}
            {images.length > 1 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
            )}

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={onClose}>
                <img
                    src={images[currentIndex].url}
                    alt={`View ${currentIndex + 1}`}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl cursor-default"
                />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            )}
        </div>
    );
};
