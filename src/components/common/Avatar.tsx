import { cn } from '@/utils/cn';
import Image from 'next/image';

interface AvatarProps {
    src: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    indicator?: boolean;
}

export const Avatar = ({ src, alt = 'Avatar', size = 'md', className, indicator }: AvatarProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-16 h-16',
    };

    return (
        <div className={cn('relative inline-block', sizeClasses[size], className)}>
            <Image
                src={src}
                alt={alt}
                fill
                className="rounded-full object-cover border border-gray-100"
            />
            {indicator && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            )}
        </div>
    );
};
