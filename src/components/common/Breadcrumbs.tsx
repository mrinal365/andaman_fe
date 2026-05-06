'use client'

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <nav className="flex items-center gap-2 mb-4 text-sm text-gray-500 overflow-x-auto no-scrollbar py-1">
            <Link 
                href="/feed" 
                className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors shrink-0"
            >
                <Home size={14} />
                <span className="font-medium">Home</span>
            </Link>
            
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 shrink-0">
                    <ChevronRight size={14} className="text-gray-300" />
                    {item.href ? (
                        <Link 
                            href={item.href} 
                            className="hover:text-[var(--color-primary)] transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-bold text-gray-900">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
};
