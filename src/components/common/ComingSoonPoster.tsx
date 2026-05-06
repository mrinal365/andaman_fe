'use client';

import React from 'react';
import { Rocket } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ComingSoonPosterProps {
    title?: string;
    description?: string;
    className?: string;
    compact?: boolean;
}

export const ComingSoonPoster = ({ 
    title = "Coming Soon", 
    description = "We're working on something amazing.", 
    className,
    compact = false
}: ComingSoonPosterProps) => {
    if (compact) {
        return (
            <div className={cn(
                "w-full rounded-xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center min-h-[140px]",
                className
            )}>
                <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 mb-3">
                    <Rocket className="h-5 w-5" />
                </div>
                <h4 className="text-[13px] font-bold text-gray-900 leading-none">{title}</h4>
                <p className="text-[11px] text-gray-400 mt-2 font-medium max-w-[160px]">{description}</p>
                <div className="mt-3 px-2 py-0.5 rounded bg-gray-100 text-[8px] font-black text-gray-500 uppercase tracking-tighter border border-gray-200">
                    Soon
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full rounded-2xl border border-gray-100 bg-white p-12 text-center flex flex-col items-center justify-center min-h-[400px]",
            className
        )}>
            <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-6">
                <Rocket className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
                {title}
            </h3>
            <p className="text-[15px] text-gray-500 font-medium max-w-[320px] leading-relaxed">
                {description}
            </p>

            <div className="mt-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-black/5">
                    Coming Soon
                </div>
            </div>
        </div>
    );
};
