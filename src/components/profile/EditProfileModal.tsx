'use client';

import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { User } from '../../../types/user';
import { updateProfile } from '@/services/userService';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { updateUserInfo } from '@/store/features/userSlice';
import { Loader2, X } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export const EditProfileModal = ({ isOpen, onClose, user }: EditProfileModalProps) => {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        password: '',
        confirmPassword: ''
    });

    const [tags, setTags] = useState<string[]>(user.tags || []);
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/,/g, '');
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setTagInput('');
            }
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload: any = {
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                website: formData.website,
                tags: tags
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const updatedUser = await updateProfile(payload);
            dispatch(updateUserInfo(updatedUser));
            toast.success("Profile updated successfully");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Username (Disabled)</label>
                            <input
                                value={`@${user.handle}`}
                                disabled
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email (Disabled)</label>
                            <input
                                value={user.email}
                                disabled
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                placeholder="e.g. Port Blair, Andaman"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                            <input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none text-[14px]"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tags */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tags</label>
                            <div className="min-h-[100px] p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[var(--color-primary)] transition-all bg-white">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold border border-[var(--color-primary)]/20">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400"
                                    placeholder={tags.length === 0 ? "Add tags (press space)..." : "Add more..."}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Change Password</h4>
                        <div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all bg-white"
                                placeholder="New password"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all bg-white"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant='outline'
                        className="flex-1 rounded-xl h-[48px]"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 rounded-xl h-[48px] shadow-lg shadow-[var(--color-primary)]/20"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
