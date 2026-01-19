import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Image as ImageIcon, Smile, Send } from 'lucide-react';

export const CreatePost = () => {
    return (
        <Card className="flex items-center gap-4 py-3" padding="md">
            <Avatar src="https://i.pravatar.cc/150?u=me" size="md" />
            <div className="flex-1 relative">
                <input
                    type="text"
                    placeholder="Share your moments..."
                    className="w-full bg-gray-50/80 rounded-2xl h-[52px] px-6 pr-32 text-[15px] font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all border border-gray-100"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-400">
                    <button className="hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <ImageIcon className="h-[22px] w-[22px] stroke-[1.5]" />
                    </button>
                    <button className="hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Smile className="h-[22px] w-[22px] stroke-[1.5]" />
                    </button>
                    <button className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 p-1.5 rounded-lg transition-colors">
                        <Send className="h-[20px] w-[20px] stroke-[2] -rotate-12 translate-x-0.5" />
                    </button>
                </div>
            </div>
        </Card>
    );
};
