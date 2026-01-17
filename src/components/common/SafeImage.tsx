'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff, RotateCw } from 'lucide-react';

export const SafeImage = (props: ImageProps) => {
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        setError(false);
        setAttempt(prev => prev + 1);
    };

    if (error) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2 ${props.className} ${props.fill ? 'absolute inset-0 w-full h-full' : 'w-full h-full'}`}
            >
                <ImageOff className="h-8 w-8 opacity-40 stroke-[1.5]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Image Broken</span>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-[10px] font-bold text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all active:scale-95"
                >
                    <RotateCw className="h-3 w-3" />
                    Refresh
                </button>
            </div>
        )
    }

    return (
        <Image
            {...props}
            key={attempt}
            onError={() => setError(true)}
        />
    );
};
