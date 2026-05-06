'use client'

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Avatar } from './Avatar';
import { getPostLikes } from '@/services/feedService';
import { Loader2, Heart, UserPlus, BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LikesModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const LikesModal = ({ postId, isOpen, onClose }: LikesModalProps) => {
    const [likes, setLikes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen && postId) {
            setIsLoading(true);
            getPostLikes(postId)
                .then(setLikes)
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, postId]);

    const handleUserClick = (handle: string) => {
        onClose();
        router.push(`/u/${handle}`);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Post Likes"
        >
            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Fetching likes...</p>
                    </div>
                ) : likes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No likes yet</h3>
                        <p className="text-sm text-gray-500 mt-1">When someone likes your post, they'll appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {likes.map((u) => (
                            <div 
                                key={u._id} 
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div 
                                    className="flex items-center gap-3 cursor-pointer group"
                                    onClick={() => handleUserClick(u.handle)}
                                >
                                    <Avatar src={u.avatar} name={u.name} size="md" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <h4 className="font-bold text-[14px] text-gray-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
                                                {u.name}
                                            </h4>
                                            {u.verified && (
                                                <BadgeCheck className="h-3.5 w-3.5 text-green-700 fill-green-700/30" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium truncate">@{u.handle}</p>
                                    </div>
                                </div>
                                <button className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
