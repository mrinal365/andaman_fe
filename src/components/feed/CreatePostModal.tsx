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
    X 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { createPost } from '@/services/feedService';
import { addPostOptimistic } from '@/store/features/postSlice';
import { uploadImage } from '@/services/uploadService';

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
            images: validImages
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
            closeModal();
        }).catch((error) => {
            console.error("Failed to submit post", error);
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || images.length >= 5) return;
        setIsUploading(true);
        try {
            const uploaded = await uploadImage(file);
            setImages((prev) => [...prev, uploaded.url]);
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setIsUploading(false);
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
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img, i) => (
                                <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                                    <img className="w-full h-full object-cover" src={img} alt="" />
                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                            {isUploading ? 'Uploading...' : 'Photo'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSubmitting || images.length >= 5 || isUploading} />
                        </label>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="h-[36px] px-5 text-[13px]" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
                            <Button
                                variant="primary"
                                className="h-[36px] px-6 text-[13px]"
                                onClick={() => handlePostSubmit(closeModal)}
                                loading={isSubmitting}
                                disabled={
                                    postType === 'update' ? !postText.trim() && images.length === 0 :
                                    postType === 'guide' ? postTitle.length < 3 || postText.length < 50 :
                                    postTitle.length < 3 || postText.length < 20
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
