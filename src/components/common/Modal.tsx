import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    size?: ModalSize;
    title?: React.ReactNode;
    children: React.ReactNode | ((props: { onClose: () => void }) => React.ReactNode);
    className?: string;
    hideCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    size = 'md',
    title,
    children,
    className = '',
    hideCloseButton = false,
    closeOnOutsideClick = true,
}) => {
    // Escape key listener to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const sizeClasses = {
        sm: 'max-w-sm w-full h-auto max-h-[90vh]',
        md: 'max-w-2xl w-full h-auto max-h-[90vh]',
        lg: 'max-w-4xl w-full h-auto max-h-[90vh]',
        full: 'w-[calc(100vw-80px)] h-[calc(100vh-80px)] max-w-none', // 40px padding on each side
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeOnOutsideClick ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className={`
                    relative bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden
                    transform transition-all duration-200 scale-100 opacity-100
                    ${sizeClasses[size]}
                    ${className}
                `}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || !hideCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="text-lg font-semibold text-gray-900">
                            {title}
                        </div>
                        {!hideCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {typeof children === 'function' ? children({ onClose }) : children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
