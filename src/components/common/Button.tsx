import { cn } from '@/utils/cn';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                    {
                        'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] shadow-md':
                            variant === 'primary',
                        'bg-white text-gray-900 shadow-sm hover:bg-gray-50 border border-gray-200':
                            variant === 'secondary',
                        'hover:bg-gray-100 text-gray-700': variant === 'ghost',
                        'border border-gray-200 hover:bg-gray-50 text-gray-900': variant === 'outline',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-11 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                        'h-10 w-10': size === 'icon',
                        'w-full': fullWidth,
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
