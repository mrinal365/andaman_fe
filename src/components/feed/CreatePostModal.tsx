'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { 
    PenTool, 
    Map, 
    Newspaper, 
    Info, 
    ImagePlus, 
    Loader2, 
    X,
    UserPlus,
    Search
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { createPost } from '@/services/feedService';
import { addPostOptimistic } from '@/store/features/postSlice';
import { uploadImage } from '@/services/uploadService';
import { searchUsers } from '@/services/userService';
import { toast } from 'react-toastify';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.user.user);

    // Form state
    const [postText, setPostText] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [postType, setPostType] = useState<'update' | 'guide' | 'news'>('update');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingCount, setUploadingCount] = useState(0);
    
    // Tagging state
    const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
    const [isTagging, setIsTagging] = useState(false);
    const [tagQuery, setTagQuery] = useState('');
    const [tagResults, setTagResults] = useState<any[]>([]);
    const [isSearchingTags, setIsSearchingTags] = useState(false);

    const handleSearchTags = async (q: string) => {
        setTagQuery(q);
        if (!q.trim()) {
            setTagResults([]);
            return;
        }
        setIsSearchingTags(true);
        try {
            const res = await searchUsers(q);
            setTagResults(res.filter(u => u._id !== user?.id && !taggedUsers.find(tu => tu._id === u._id)));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearchingTags(false);
        }
    };

    const addTag = (u: any) => {
        if (taggedUsers.length < 10) {
            setTaggedUsers(prev => [...prev, u]);
            setTagQuery('');
            setTagResults([]);
            setIsTagging(false);
        }
    };

    const removeTag = (id: string) => {
        setTaggedUsers(prev => prev.filter(u => u._id !== id));
    };

    const handlePostSubmit = (closeModal: () => void) => {
        setIsSubmitting(true);
        const validImages = images.filter(url => url.trim() !== '');

        let content: any = {};
        if (postType === 'update') {
            content = { shortText: postText };
        } else if (postType === 'guide') {
            content = { title: postTitle, body: postText };
        } else if (postType === 'news') {
            content = { title: postTitle, text: postText };
        }

        const payload = {
            type: postType,
            content,
            images: validImages,
            taggedUsers: taggedUsers.map(u => u._id)
        };

        createPost(payload).then((res) => {
            // Ensure the new post has the current user's details
            const enrichedPost = {
                ...res,
                authorId: res.authorId?._id ? res.authorId : user
            };
            dispatch(addPostOptimistic(enrichedPost));
            // Reset state
            setPostText('');
            setPostTitle('');
            setPostType('update');
            setImages([]);
            setTaggedUsers([]);
            toast.success('Post created successfully!');
            closeModal();
        }).catch((error) => {
            console.error("Failed to submit post", error);
            const message = error.response?.data?.message || error.message || "Failed to submit post";
            toast.error(message);
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentImagesCount = images.length;
        const availableSlots = 5 - currentImagesCount;
        
        if (availableSlots <= 0) {
            toast.warning('Maximum 5 images allowed');
            e.target.value = '';
            return;
        }

        const filesToUpload = Array.from(files).slice(0, availableSlots);
        
        setIsUploading(true);
        setUploadingCount(filesToUpload.length);

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                try {
                    const uploaded = await uploadImage(file);
                    setImages((prev) => [...prev, uploaded.url]);
                } catch (err) {
                    console.error('Upload failed for a file', err);
                    toast.error(`Failed to upload ${file.name}`);
                } finally {
                    setUploadingCount(prev => Math.max(0, prev - 1));
                }
            });

            await Promise.all(uploadPromises);
        } catch (err) {
            console.error('Batch upload failed', err);
        } finally {
            setIsUploading(false);
            setUploadingCount(0);
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            title="Create New Post"
        >
            {({ onClose: closeModal }) => (
                <div className="flex flex-col gap-4">
                    {/* Post type selector */}
                    <div className="flex items-center gap-2">
                        {[
                            { value: 'update' as const, label: 'Update', icon: PenTool },
                            { value: 'guide' as const, label: 'Guide', icon: Map },
                            { value: 'news' as const, label: 'News', icon: Newspaper },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setPostType(opt.value); setPostTitle(''); setPostText(''); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider border transition-all
                                    ${postType === opt.value
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                disabled={isSubmitting}
                            >
                                <opt.icon className="h-3.5 w-3.5" />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Info banner */}
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50/80 border border-blue-100">
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-[12px] text-blue-700 leading-relaxed">
                            {postType === 'update' && <p>Quick update — max 700 chars + optional photos.</p>}
                            {postType === 'guide' && <p>Travel guide — requires title (min 3) and body (min 50).</p>}
                            {postType === 'news' && <p>Share news — requires headline (min 3) and body (min 20).</p>}
                        </div>
                    </div>

                    {/* Author row */}
                    <div className="flex items-center gap-3">
                        <Avatar src={user?.avatar || ''} name={user?.name} size="md" />
                        <div>
                            <p className="text-[13px] font-bold text-gray-900">{user?.name || 'You'}</p>
                            <p className="text-[11px] text-gray-400 font-medium capitalize">{postType}</p>
                        </div>
                    </div>

                    {/* Title input */}
                    {(postType === 'guide' || postType === 'news') && (
                        <div>
                            <input
                                type="text"
                                className={`w-full bg-gray-50 border rounded-lg px-3 py-2.5 text-[14px] text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent transition-all ${postTitle.length > 0 && postTitle.length < 3 ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder={postType === 'guide' ? 'Guide title' : 'News headline'}
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value.slice(0, 200))}
                                disabled={isSubmitting}
                                maxLength={200}
                            />
                        </div>
                    )}

                    {/* Body textarea */}
                    <div className="relative">
                        <textarea
                            className={`w-full bg-gray-50 border rounded-lg px-3 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-transparent transition-all leading-relaxed ${
                                (postType === 'guide' && postText.length > 0 && postText.length < 50) ||
                                (postType === 'news' && postText.length > 0 && postText.length < 20)
                                ? 'border-red-300' : 'border-gray-200'
                            }`}
                            style={{ minHeight: postType === 'guide' ? '160px' : '100px' }}
                            placeholder="What's happening?"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Image previews */}
                    {(images.length > 0 || uploadingCount > 0) && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img, i) => (
                                <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                                    <img className="w-full h-full object-cover" src={img} alt="" />
                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"><X size={12}/></button>
                                </div>
                            ))}
                            {/* Uploading skeletons */}
                            {Array.from({ length: uploadingCount }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 animate-pulse flex items-center justify-center border border-gray-100">
                                    <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tagged users display */}
                    {taggedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {taggedUsers.map(u => (
                                <div key={u._id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                    @{u.handle}
                                    <button onClick={() => removeTag(u._id)} className="hover:text-blue-900"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tag Search Modal/Dropdown logic inline */}
                    {isTagging && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-2">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search people to tag..."
                                    value={tagQuery}
                                    onChange={(e) => handleSearchTags(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                    autoFocus
                                />
                                <button onClick={() => setIsTagging(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto">
                                {isSearchingTags ? (
                                    <div className="p-4 text-center text-xs text-gray-500">Searching...</div>
                                ) : tagResults.length > 0 ? (
                                    tagResults.map(u => (
                                        <button 
                                            key={u._id} 
                                            onClick={() => addTag(u)}
                                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <Avatar src={u.avatar} name={u.name} size="sm" />
                                            <div>
                                                <div className="text-xs font-bold text-gray-900">{u.name}</div>
                                                <div className="text-[10px] text-gray-500">@{u.handle}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : tagQuery.trim() ? (
                                    <div className="p-4 text-center text-xs text-gray-500">No users found</div>
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-500">Type a name to search</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                {isUploading ? 'Uploading...' : 'Photo'}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    className="hidden" 
                                    onChange={handleImageUpload} 
                                    disabled={isSubmitting || images.length >= 5 || isUploading} 
                                />
                            </label>

                            <button 
                                type="button"
                                onClick={() => setIsTagging(!isTagging)}
                                disabled={taggedUsers.length >= 10 || isSubmitting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <UserPlus className="h-4 w-4" />
                                Tag
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="h-[36px] px-5 text-[13px]" onClick={closeModal} disabled={isSubmitting || isUploading}>Cancel</Button>
                            <Button
                                variant="primary"
                                className="h-[36px] px-6 text-[13px]"
                                onClick={() => handlePostSubmit(closeModal)}
                                loading={isSubmitting}
                                disabled={
                                    isUploading ||
                                    (postType === 'update' ? !postText.trim() && images.length === 0 :
                                    postType === 'guide' ? postTitle.length < 3 || postText.length < 50 :
                                    postTitle.length < 3 || postText.length < 20)
                                }
                            >
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
