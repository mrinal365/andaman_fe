export interface Story {
    _id: string;
    authorId: {
        _id: string;
        name: string;
        handle: string;
        avatar: string;
        verified: boolean;
    };
    imageUrl: string;
    createdAt: string;
    stats: {
        likeCount: number;
        viewCount: number;
    };
    isSeen?: boolean;
    isLiked?: boolean;
}

export interface StoryGroup {
    author: {
        _id: string;
        name: string;
        handle: string;
        avatar: string;
        verified: boolean;
    };
    stories: Story[];
    hasUnseen: boolean;
}
