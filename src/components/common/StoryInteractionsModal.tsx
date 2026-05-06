'use client'

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Avatar } from './Avatar';
import { getStoryLikes, getStoryViews } from '@/services/storyService';
import { Loader2, Heart, Eye, UserPlus, BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';

interface StoryInteractionsModalProps {
    storyId: string;
    type: 'likes' | 'views';
    isOpen: boolean;
    onClose: () => void;
}

export const StoryInteractionsModal = ({ storyId, type, isOpen, onClose }: StoryInteractionsModalProps) => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const currentUser = useAppSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (isOpen && storyId) {
            setIsLoading(true);
            const fetchFn = type === 'likes' ? getStoryLikes : getStoryViews;
            fetchFn(storyId)
                .then(setUsers)
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, storyId, type]);

    const handleUserClick = (handle: string) => {
        onClose();
        router.push(`/u/${handle}`);
    };

    const title = type === 'likes' ? 'Story Likes' : 'Story Views';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
        >
            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Fetching {type}...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            {type === 'likes' ? (
                                <Heart className="w-8 h-8 text-red-400" />
                            ) : (
                                <Eye className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {type} yet</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {type === 'likes' ? "When someone likes your story, they'll appear here." : "When someone views your story, they'll appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {users.map((u) => {
                            const isMe = currentUser && (currentUser.id === u._id || currentUser._id === u._id);
                            
                            return (
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
                                    
                                    {!isMe && (
                                        <button className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Follow
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
};
