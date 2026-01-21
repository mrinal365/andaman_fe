import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    icon?: ReactNode;
    children: ReactNode;
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    icon,
    children,
    className = '',
    fullWidth = true,
    loading = false,
    disabled,
    ...props
}) => {
    const baseStyles = "font-bold py-3 px-4 rounded-lg transition-all transform duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed";

    // Only apply hover/active effects when not loading/disabled
    const interactiveStyles = !loading && !disabled
        ? "hover:scale-[1.02] active:scale-[0.98]"
        : "";

    const variants = {
        primary: "bg-white text-black hover:bg-neutral-200 shadow-sm",
        outline: "bg-transparent border border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
    };

    return (
        <button
            className={`${baseStyles} ${interactiveStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={loading || disabled}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                icon && <span className="flex items-center">{icon}</span>
            )}
            {loading ? 'Loading...' : children}
        </button>
    );
};
