import { User } from "../user";

export interface CommentStats {
    likeCount: number;
    replyCount: number;
}

export interface CommentViewerState {
    liked: boolean;
}

export interface CommentAuthor {
    id: string;
    _id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
}

export interface Comment {
    id: string;
    _id: string;
    postId: string;
    parentCommentId: string | null;
    author: CommentAuthor;
    text: string;
    stats: CommentStats;
    viewerState: CommentViewerState;
    createdAt: string;
    updatedAt?: string;
}
