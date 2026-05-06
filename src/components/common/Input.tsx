import React, { useState } from 'react';
import { Text } from './Text';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', error, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="w-full">
            {label && (
                <Text as="label" variant="label" htmlFor={id} className="block mb-2">
                    {label}
                </Text>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all ${error ? 'border-red-500/50 focus:ring-red-500/20' : 'border-neutral-800'
                        } ${isPassword ? 'pr-12' : ''} ${className}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <Text variant="error" className="mt-1">
                    {error}
                </Text>
            )}
        </div>
    );
};
