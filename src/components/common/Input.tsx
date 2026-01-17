import { cn } from '@/utils/cn';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    ref={ref}
                    className={cn(
                        'flex h-12 w-full rounded-2xl border-none bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all',
                        icon && 'pr-10',
                        className
                    )}
                    {...props}
                />
                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
