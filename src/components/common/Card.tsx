import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ className, padding = 'md', children, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                'bg-white rounded-xl border border-[1.5px] border-gray-100 shadow-md md:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]',
                {
                    'p-0': padding === 'none',
                    'p-4': padding === 'sm',
                    'p-6': padding === 'md',
                    'p-8': padding === 'lg',
                },
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
