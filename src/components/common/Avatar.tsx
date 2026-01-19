'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    indicator?: boolean;
}

export const Avatar = ({ src, alt = 'Avatar', name, size = 'md', className, indicator }: AvatarProps) => {
    const [hasError, setHasError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setHasError(false);
    }, [src]);

    const sizeClasses = {
        xs: 'w-6 h-6 text-[9px]',
        sm: 'w-8 h-8 text-[11px]',
        md: 'w-10 h-10 text-[13px]',
        lg: 'w-14 h-14 text-[16px]',
        xl: 'w-16 h-16 text-[20px]',
    };

    const getInitials = (text: string) => {
        if (!text) return '??';
        return text
            .split(' ')
            .map(part => part[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const displayName = name || alt;
    const initials = getInitials(displayName === 'Avatar' ? 'U' : displayName);

    // Generate consistent background color based on name
    const getBgColor = (str: string) => {
        const colors = [
            'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
            'bg-blue-100 text-blue-700',
            'bg-green-100 text-green-700',
            'bg-yellow-100 text-yellow-700',
            'bg-purple-100 text-purple-700',
            'bg-pink-100 text-pink-700',
            'bg-indigo-100 text-indigo-700',
            'bg-orange-100 text-orange-700',
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const fallbackColor = getBgColor(displayName);

    return (
        <div className={cn('relative inline-block overflow-hidden rounded-2xl', sizeClasses[size], className)}>
            {!src || hasError ? (
                <div className={cn(
                    "w-full h-full flex items-center justify-center font-bold border border-gray-100",
                    fallbackColor
                )}>
                    {initials}
                </div>
            ) : (
                <Image
                    src={src}
                    alt={displayName}
                    fill
                    className="object-cover"
                    onError={() => setHasError(true)}
                />
            )}
            {indicator && (
                <span className="absolute -bottom-1 -right-1 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
            )}
        </div>
    );
};
