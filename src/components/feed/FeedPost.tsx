import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { SafeImage } from '@/components/common/SafeImage';
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark, BadgeCheck, Eye } from 'lucide-react';

interface FeedPostProps {
    author: {
        name: string;
        avatar: string;
        location: string;
        time: string;
        verified?: boolean;
    };
    content: {
        text: string;
        image?: string;
        images?: string[];
        tag?: 'post' | 'guide' | 'news' | 'ad' | 'update';
        likes: string;
        comments: string;
        views: string;
        commentsList?: { user: string; text: string }[];
    };
}

const getTagStyles = (tag?: string) => {
    switch (tag) {
        case 'ad': return 'bg-amber-50 text-amber-600 border-amber-100';
        default: return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20';
    }
};

export const FeedPost = ({ author, content }: FeedPostProps) => {
    const postImages = content.images || (content.image ? [content.image] : []);

    const renderImageGrid = () => {
        if (postImages.length === 0) return null;

        if (postImages.length === 1) {
            return (
                <div className="relative w-full rounded-xl overflow-hidden mt-1 shadow-sm group border border-gray-100/50">
                    <SafeImage
                        src={postImages[0]}
                        alt="Post content"
                        width={600}
                        height={800}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
            );
        }

        // Logic for 2 or 3 images: Show 2, with +1 on the second if length is 3
        if (postImages.length === 2 || postImages.length === 3) {
            return (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mt-1 border border-gray-100/50">
                    {postImages.slice(0, 2).map((img, i) => (
                        <div key={i} className="relative aspect-square">
                            <SafeImage src={img} alt={`Image ${i + 1}`} fill className="object-cover" />
                            {i === 1 && postImages.length > 2 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="text-white text-3xl font-bold">+{postImages.length - 2}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // Logic for 4+ images: Show 4, with +N on the fourth
        if (postImages.length >= 4) {
            return (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mt-1 border border-gray-100/50 aspect-square">
                    {postImages.slice(0, 4).map((img, i) => (
                        <div key={i} className="relative h-full w-full">
                            <SafeImage src={img} alt={`Image ${i + 1}`} fill className="object-cover" />
                            {i === 3 && postImages.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="text-white text-3xl font-bold">+{postImages.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <Card className="flex flex-col gap-2 p-3 md:p-4" padding="none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar src={author.avatar} size="md" />
                    <div>
                        <div className="flex items-center gap-1">
                            <h4 className="font-bold text-sm text-gray-900 leading-none">{author.name}</h4>
                            {author.verified && (
                                <BadgeCheck className="h-[14px] w-[14px] text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {author.time}
                            {author.location && ` • ${author.location}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {content.tag && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getTagStyles(content.tag)}`}>
                            {content.tag}
                        </span>
                    )}

                </div>
            </div>

            <p className="text-[14px] text-gray-800 leading-relaxed font-normal">
                {content.text.split(' ').map((word, i) =>
                    word.startsWith('#') ? <span key={i} className="text-[var(--color-primary)] font-semibold">{word} </span> : word + ' '
                )}
            </p>

            {/* Images */}
            {renderImageGrid()}

            {/* Actions */}
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1">
                    {/* Like */}
                    <button className="flex items-center gap-1.5 group p-1.5 -ml-1.5 rounded-full hover:bg-[var(--color-primary)]/10 transition-all active:scale-95">
                        <Heart className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-[var(--color-primary)] group-hover:fill-[var(--color-primary)] transition-colors" />
                        <span className="text-[13px] font-semibold text-gray-500 group-hover:text-[var(--color-primary)] tabular-nums">{content.likes}</span>
                    </button>

                    {/* Comment */}
                    <button className="flex items-center gap-1.5 group p-1.5 rounded-full hover:bg-blue-50/60 transition-all active:scale-95">
                        <MessageCircle className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-blue-500 transition-colors" />
                        <span className="text-[13px] font-semibold text-gray-500 group-hover:text-blue-600 tabular-nums">{content.comments}</span>
                    </button>

                    {/* Views */}
                    <button className="flex items-center gap-1.5 group p-1.5 rounded-full hover:bg-gray-100/60 transition-all active:scale-95">
                        <Eye className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-gray-900 transition-colors" />
                        <span className="text-[13px] font-semibold text-gray-500 group-hover:text-gray-900 tabular-nums">{content.views}</span>
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    {/* Share */}
                    <button className="flex items-center gap-1.5 group p-1.5 rounded-full hover:bg-green-50/60 transition-all active:scale-95">
                        <Send className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-green-600 -rotate-12 translate-y-0.5 transition-colors" />
                    </button>

                    {/* Bookmark */}
                    <button className="group p-1.5 -mr-1.5 rounded-full hover:bg-gray-100/60 transition-all active:scale-95">
                        <Bookmark className="h-[20px] w-[20px] text-gray-500 stroke-[1.5] group-hover:text-gray-900 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-3 pt-3 mt-1 border-t border-gray-100">
                <Avatar src="https://i.pravatar.cc/150?u=me" size="sm" />
                <div className="flex-1 bg-gray-50 rounded-xl pl-3 pr-2 py-2 flex items-center justify-between group focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-800"
                    />
                    <button className="text-gray-400 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <Send className="h-4 w-4 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* Footer Comments */}
            {content.commentsList && content.commentsList.length > 0 && (
                <div className="mt-2 space-y-1.5">
                    <button className="text-[13px] text-gray-500 font-medium mb-1 hover:text-gray-800 transition-colors block">
                        View more comments
                    </button>
                    {content.commentsList.map((comment, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px]">
                            <span className="font-bold text-gray-900 shrink-0">{comment.user}</span>
                            <span className="text-gray-600 font-medium">{comment.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};
