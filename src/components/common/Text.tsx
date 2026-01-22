import React from 'react';
import { cn } from '@/utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: 'default' | 'error' | 'label' | 'muted';
    as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
    children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
    variant = 'default',
    as: Component = 'p',
    className,
    children,
    ...props
}) => {
    const variants = {
        default: 'text-white',
        error: 'text-xs text-red-500/90 font-medium animate-pulse',
        label: 'text-sm font-medium text-neutral-300',
        muted: 'text-neutral-400 text-sm',
    };

    return (
        <div
            className={cn(variants[variant], className)}
            {...props}
        >
            {children}
        </div>
    );
};
