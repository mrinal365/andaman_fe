import React from 'react';
import { cn } from '@/utils/cn';

interface TextProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    variant?: 'default' | 'error' | 'label' | 'muted';
    as?: any;
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
        <Component
            className={cn(variants[variant], className)}
            {...props}
        >
            {children}
        </Component>
    );
};

