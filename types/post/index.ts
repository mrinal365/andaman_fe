import { User } from "../user";

export interface PostStats {
    likeCount: number;
    commentCount: number;
    viewCount: number;
    shareCount: number;
}

export interface PostViewerState {
    liked: boolean;
    saved: boolean;
    vote: number;
    followingAuthor: boolean;
}

export interface PostAuthor {
    id: string;
    _id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
}
export interface FeedDetails {
    title: string;
    previewText: string;
    image: string;
    video: string;
    tags: string[];
}
export interface Post {
    id: string;
    _id: string;
    // authorId: string;
    authorId: PostAuthor;
    content: string;
    images: string[];
    type: "text" | "image" | "video";
    stats: PostStats;
    viewerState: PostViewerState;
    createdAt: string;
    updatedAt: string;
    feed: FeedDetails
}
