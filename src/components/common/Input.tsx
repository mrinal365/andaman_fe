import React from 'react';
import { Text } from './Text';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', error, ...props }) => {
    return (
        <div className="w-full">
            <Text as="label" variant="label" htmlFor={id} className="block mb-2">
                {label}
            </Text>
            <input
                id={id}
                className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all ${error ? 'border-red-500/50 focus:ring-red-500/20' : 'border-neutral-800'
                    } ${className}`}
                {...props}
            />
            {error && (
                <Text variant="error" className="mt-1">
                    {error}
                </Text>
            )}
        </div>
    );
};
