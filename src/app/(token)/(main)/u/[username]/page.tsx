'use client';

import { User } from '../../../../../../types/user';
import { Post } from '../../../../../../types/post';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Link as LinkIcon,
    Calendar,
    Grid,
    List,
    MoreHorizontal,
    Camera,
    Settings,
    UserPlus,
    MessageSquare,
    Loader2,
    Image as ImageIcon,
    ArrowLeft
} from 'lucide-react';
import {
    getUserProfile,
    getUserPosts,
    updateProfile,
    startConversation,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from '@/services/userService';
import { uploadImage } from '@/services/uploadService';
import { FeedPost } from '@/components/feed/FeedPost';
import { Avatar } from '@/components/common/Avatar';
import { Modal } from '@/components/common/Modal';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedConversation, addOrUpdateConversation } from '@/store/features/chat/conversationSlice';
import { updateUserInfo } from '@/store/features/userSlice';
import { toast } from 'react-toastify';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

export default function ProfilePage() {
    const { username } = useParams();
    const handle = typeof username === 'string' ? username : '';

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Profile Edit State
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.user.user);
    const isOwnProfile = !!currentUser && !!user && (currentUser.id === user.id || currentUser._id === user._id);

    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const [tempImageFile, setTempImageFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [updateType, setUpdateType] = useState<'avatar' | 'cover' | null>(null);
    const [coverPosition, setCoverPosition] = useState(50); // Default middle
    const [isJoiningChat, setIsJoiningChat] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Posts');
    const [followList, setFollowList] = useState<User[]>([]);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast.error('Please login to follow users');
            return;
        }

        const targetId = user?._id || user?.id;
        console.log('Toggling follow for:', targetId);
        if (!targetId) {
            toast.error('User ID not found');
            return;
        }

        try {
            setIsFollowLoading(true);
            if (user.isFollowing) {
                await unfollowUser(targetId);
                setUser((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        isFollowing: false,
                        stats: {
                            ...prev.stats,
                            followers: Math.max(0, (prev.stats?.followers || 0) - 1)
                        }
                    };
                });
                toast.success(`Unfollowed ${user.name}`);
            } else {
                await followUser(targetId);
                // Also join conversation on follow
                try {
                    await startConversation(targetId);
                } catch (convErr) {
                    console.error('Failed to join conversation on follow:', convErr);
                }

                setUser((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        isFollowing: true,
                        stats: {
                            ...prev.stats,
                            followers: (prev.stats?.followers || 0) + 1
                        }
                    };
                });
                toast.success(`You followed ${user.name}`);
            }
        } catch (err: any) {
            console.error('Follow toggle error:', err);
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setIsFollowLoading(false);
        }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setTempImageFile(file);
        setTempImageUrl(URL.createObjectURL(file));
        setUpdateType(type);
        if (type === 'cover') {
            setCoverPosition(user?.coverPosition || 50);
        }
    };

    const confirmUpdateImage = async () => {
        if (!tempImageFile || !updateType) return;

        try {
            setIsUpdatingImage(true);
            const uploadRes = await uploadImage(tempImageFile);
            const imageUrl = uploadRes.url;

            const updateData: any = {};
            if (updateType === 'avatar') {
                updateData.avatar = imageUrl;
            } else {
                updateData.coverImage = imageUrl;
                updateData.coverPosition = coverPosition;
            }

            await updateProfile(updateData);

            // Update local state
            setUser((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    ...updateData
                };
            });

            // Update Redux state
            dispatch(updateUserInfo(updateData));

            toast.success(`${updateType.charAt(0).toUpperCase() + updateType.slice(1)} updated successfully!`);
            cancelUpdate();
        } catch (err) {
            toast.error('Failed to update image');
            console.error(err);
        } finally {
            setIsUpdatingImage(false);
        }
    };

    const cancelUpdate = () => {
        setTempImageFile(null);
        setTempImageUrl(null);
        setUpdateType(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    const handleMessageClick = async () => {
        if (!user?.id) return;
        if (!currentUser) {
            toast.error('Please login to message');
            return;
        }

        try {
            setIsJoiningChat(true);
            const res = await startConversation(user.id);

            // Add as temporary conversation to redux so it shows in ChatList
            const conversation = {
                conversationId: res._id || res.id,
                type: 'direct',
                name: user.name,
                avatar: user.avatar,
                handle: user.handle,
                lastMessage: '',
                unreadCount: 0,
                isTemp: true // Flag to keep it visible in ChatList until next fetch
            };

            dispatch(addOrUpdateConversation(conversation));
            dispatch(setSelectedConversation(conversation.conversationId));
            router.push('/messages');
        } catch (err) {
            toast.error('Failed to start conversation');
            console.error(err);
        } finally {
            setIsJoiningChat(false);
        }
    };



    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const userData = await getUserProfile(handle);
            setUser(userData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }, [handle]);

    const fetchPosts = useCallback(async (cursor?: string) => {
        try {
            if (!cursor) setIsLoadingPosts(true);
            const data = await getUserPosts(handle, cursor);
            if (cursor) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error('Failed to load posts', err);
        } finally {
            setIsLoadingPosts(false);
        }
    }, [handle]);

    const fetchFollowList = useCallback(async (type: 'followers' | 'following') => {
        if (!user?._id && !user?.id) return;
        try {
            setIsLoadingFollow(true);
            const data = type === 'followers'
                ? await getFollowers(user.id)
                : await getFollowing(user.id);
            setFollowList(data);
        } catch (err) {
            console.error(`Failed to load ${type}`, err);
            toast.error(`Failed to load ${type}`);
        } finally {
            setIsLoadingFollow(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'Followers') fetchFollowList('followers');
        if (activeTab === 'Following') fetchFollowList('following');
    }, [activeTab, fetchFollowList]);

    useEffect(() => {
        if (handle) {
            fetchProfile();
            fetchPosts();
        }
    }, [handle, fetchProfile, fetchPosts]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-white p-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{error || 'User not found'}</h2>
                <p className="text-gray-500 mt-2 text-center max-w-xs">
                    The link you followed may be broken, or the page may have been removed.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto bg-white no-scrollbar">
            {/* Twitter-style Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-900" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-[17px] font-black text-gray-900 leading-tight">{user.name}</h2>
                    <p className="text-[12px] text-gray-500 font-bold">{user.stats?.posts || 0} posts</p>
                </div>
            </div>

            <div className="w-full">
                {/* Cover Photo */}
                <div className="relative aspect-[3/1] w-full bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden group">
                    {user.coverImage ? (
                        <img
                            src={user.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `50% ${user.coverPosition || 50}%` }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 opacity-20" />
                        </div>
                    )}
                    {isOwnProfile && (
                        <>
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={(e) => handleFileChange(e, 'cover')}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-2 px-3 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-white transition-all z-20 border border-white/50"
                            >
                                <Camera size={18} />
                                <span>Edit Cover Photo</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Profile Picture & Name Overlap Section */}
                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 -mt-10 md:-mt-14 mb-4 relative z-10 px-4 md:px-0">
                    <div className="relative group">
                        <div className="p-1 bg-white rounded-full shadow-md">
                            <Avatar
                                src={user.avatar}
                                name={user.name}
                                size="xl"
                                className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-white"
                            />
                        </div>
                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-200 transition-all border border-white"
                                >
                                    <Camera size={20} className="text-gray-700" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2 md:mb-0 pt-2 md:pt-10 relative">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{user.name}</h1>
                        <p className="text-gray-500 font-bold text-lg">@{user.handle}</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                            <button className="text-[14px] font-bold text-gray-600 hover:underline">
                                <span className="text-gray-900">{user.stats?.followers || 0}</span> followers
                            </button>
                            <button className="text-[14px] font-bold text-gray-600 hover:underline">
                                <span className="text-gray-900">{user.stats?.following || 0}</span> following
                            </button>
                        </div>

                        {/* Bio & Tags Section */}
                        <div className="mt-4 flex flex-col gap-3">
                            {user.bio && (
                                <p className="text-gray-600 text-[15px] font-medium leading-relaxed max-w-xl">
                                    {user.bio}
                                </p>
                            )}
                            
                            {user.tags && user.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {user.tags.map((tag) => (
                                        <span key={tag} className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-50 text-[var(--color-primary)] border border-gray-100 uppercase tracking-tight">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-10">
                        {!isOwnProfile ? (
                            <>
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isFollowLoading}
                                    className={cn(
                                        "px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50",
                                        user.isFollowing
                                            ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                            : "bg-[var(--color-primary)] text-white hover:opacity-90"
                                    )}
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : user.isFollowing ? (
                                        <span>Unfollow</span>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            <span>Follow</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleMessageClick}
                                    disabled={isJoiningChat}
                                    className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {isJoiningChat ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MessageSquare size={18} />
                                    )}
                                    <span>Message</span>
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-all shadow-sm"
                            >
                                <Settings size={18} />
                                <span>Edit Profile</span>
                            </button>
                        )}
                        <button className="bg-gray-100 text-gray-900 p-2 rounded-lg font-bold hover:bg-gray-200 transition-all shadow-sm">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-100 flex items-center gap-1 py-1 overflow-x-auto no-scrollbar px-4">
                    {['Posts', 'Followers', 'Following', 'About'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-3 font-bold text-[15px] rounded-lg transition-all whitespace-nowrap",
                                activeTab === tab ? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)] rounded-none" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div
                ref={scrollContainerRef}
                className="w-full px-4 py-8"
            >
                {activeTab === 'Posts' ? (
                    <div className="max-w-[740px] mx-auto space-y-6">
                        <AnimatePresence>
                            {isLoadingPosts ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-2" />
                                    <p className="text-gray-500 font-bold">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">No posts yet</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Check back later for new updates.</p>
                                </div>
                            ) : (
                                posts.map((post, idx) => (
                                    <motion.div
                                        key={post._id || post.id || `post-${idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ margin: "0px 0px -10% 0px", amount: 0.1 }}
                                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                                    >
                                        <FeedPost post={post} />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>

                        {hasMore ? (
                            <div className="pt-4 pb-10">
                                <button
                                    onClick={() => fetchPosts(nextCursor!)}
                                    className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    Show More
                                </button>
                            </div>
                        ) : posts.length > 0 && (
                            <div className="py-12 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">No more posts</p>
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (activeTab === 'Followers' || activeTab === 'Following') ? (
                    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900">{activeTab}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {isLoadingFollow ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                                </div>
                            ) : followList.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 font-bold">
                                    No {activeTab.toLowerCase()} found
                                </div>
                            ) : (
                                followList.map((u) => (
                                    <div key={u._id || u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer"
                                            onClick={() => {
                                                router.push(`/u/${u.handle}`);
                                                setActiveTab('Posts');
                                            }}
                                        >
                                            <Avatar src={u.avatar} name={u.name} size="md" />
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none">{u.name}</p>
                                                <p className="text-sm text-gray-500 font-bold">@{u.handle}</p>
                                            </div>
                                        </div>
                                        {currentUser?.id !== u.id && (
                                            <button
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg font-bold text-sm transition-all",
                                                    u.isFollowing
                                                        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                                        : "bg-[var(--color-primary)] text-white hover:opacity-90"
                                                )}
                                            >
                                                {u.isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <h3 className="text-xl font-bold text-gray-900">{activeTab} section coming soon</h3>
                    </div>
                )}
            </div>
            {/* Image Update Modal */}
            <Modal
                isOpen={!!tempImageUrl}
                onClose={cancelUpdate}
                title={`Update ${updateType === 'avatar' ? 'Profile Picture' : 'Cover Photo'}`}
                size="md"
            >
                <div className="flex flex-col items-center gap-6">
                    <div className={cn(
                        "relative overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50",
                        updateType === 'avatar' ? "w-48 h-48 rounded-full" : "w-full aspect-[2.5/1] rounded-xl"
                    )}>
                        {tempImageUrl && (
                            <img
                                src={tempImageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover transition-all duration-200"
                                style={updateType === 'cover' ? { objectPosition: `50% ${coverPosition}%` } : {}}
                            />
                        )}
                        {updateType === 'cover' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-px bg-white/50 border-t border-dashed border-black/20" />
                            </div>
                        )}
                    </div>

                    {updateType === 'cover' && (
                        <div className="w-full space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-sm font-bold text-gray-700">Reposition Vertical</span>
                                <span className="text-xs font-bold text-gray-400">{coverPosition}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={coverPosition}
                                onChange={(e) => setCoverPosition(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                            />
                        </div>
                    )}

                    <p className="text-gray-600 text-center text-sm font-medium">
                        {updateType === 'avatar'
                            ? "Adjust your new profile picture."
                            : "Reposition your new cover photo to highlight what's important."}
                    </p>

                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={cancelUpdate}
                            disabled={isUpdatingImage}
                            className="flex-1 bg-gray-100 text-gray-900 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmUpdateImage}
                            disabled={isUpdatingImage}
                            className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isUpdatingImage ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Profile Modal */}
            {user && (
                <EditProfileModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => {
                        setIsEditModalOpen(false);
                        fetchProfile(); // Refresh profile data after edit
                    }} 
                    user={user} 
                />
            )}
        </div>
    );
}

