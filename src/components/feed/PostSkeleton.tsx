'use client';

import { Card } from '@/components/common/Card';

export const PostSkeleton = () => {
    return (
        <Card className="flex flex-col gap-3 p-3 md:p-4 bg-white animate-pulse" padding="none">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex flex-col gap-1.5">
                        <div className="w-24 h-3.5 bg-gray-200 rounded" />
                        <div className="w-32 h-2.5 bg-gray-100 rounded" />
                    </div>
                </div>
                <div className="w-16 h-6 bg-gray-100 rounded-lg" />
            </div>

            {/* Text Skeleton */}
            <div className="flex flex-col gap-2 mt-1">
                <div className="w-full h-3.5 bg-gray-200 rounded" />
                <div className="w-5/6 h-3.5 bg-gray-200 rounded" />
                <div className="w-4/6 h-3.5 bg-gray-200 rounded" />
            </div>

            {/* Content/Image Skeleton */}
            <div className="w-full aspect-[16/10] bg-gray-100 rounded-xl mt-1" />

            {/* Actions Skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-4 bg-gray-100 rounded" />
                    <div className="w-14 h-4 bg-gray-100 rounded" />
                    <div className="w-14 h-4 bg-gray-100 rounded" />
                </div>
                <div className="w-6 h-6 bg-gray-100 rounded" />
            </div>
        </Card>
    );
};
