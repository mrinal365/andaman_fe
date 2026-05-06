import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Comment } from "../../../types/comment";

interface CommentsState {
    byId: Record<string, Comment>;
    byPost: Record<string, string[]>;   // root comments per post
    byParent: Record<string, string[]>; // replies per comment
}

const initialState: CommentsState = {
    byId: {},
    byPost: {},
    byParent: {},
};

const commentsSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {

        setComments(
            state,
            action: PayloadAction<{ postId: string; comments: any[] }>
        ) {
            const { postId, comments } = action.payload;

            // 🔥 Sort newest first
            const sorted = [...comments].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );

            state.byPost[postId] = [];

            sorted.forEach((c) => {
                const normalized: Comment = {
                    id: c._id,
                    _id: c._id,
                    postId: c.postId,
                    parentCommentId: c.parentCommentId,
                    text: c.text,
                    createdAt: c.createdAt,
                    author: c.user,
                    stats: c.stats || { likeCount: 0, replyCount: 0 },
                    viewerState: c.viewerState || { liked: false }
                };

                state.byId[normalized.id] = normalized;

                if (normalized.parentCommentId) {
                    if (!state.byParent[normalized.parentCommentId]) {
                        state.byParent[normalized.parentCommentId] = [];
                    }
                    state.byParent[normalized.parentCommentId].push(normalized.id);
                } else {
                    state.byPost[postId].push(normalized.id);
                }

                // If this comment has nested replies in the response, we should handle them
                if (c.replies && c.replies.length > 0) {
                    state.byParent[c._id] = [];
                    c.replies.forEach((r: any) => {
                        const replyNorm: Comment = {
                            id: r._id,
                            _id: r._id,
                            postId: r.postId,
                            parentCommentId: r.parentCommentId,
                            text: r.text,
                            createdAt: r.createdAt,
                            author: r.user,
                            stats: r.stats || { likeCount: 0, replyCount: 0 },
                            viewerState: r.viewerState || { liked: false }
                        };
                        state.byId[replyNorm.id] = replyNorm;
                        state.byParent[c._id].push(replyNorm.id);
                    });
                }
            });
        },

        addCommentOptimistic(
            state,
            action: PayloadAction<{ comment: Comment }>
        ) {
            const { comment } = action.payload;

            state.byId[comment.id] = comment;
            if (comment.parentCommentId) {
                if (!state.byParent[comment.parentCommentId]) {
                    state.byParent[comment.parentCommentId] = [];
                }
                state.byParent[comment.parentCommentId].unshift(comment.id);

                // Also update parent reply count
                const parent = state.byId[comment.parentCommentId];
                if (parent && parent.stats) {
                    parent.stats.replyCount++;
                }
            } else {
                if (!state.byPost[comment.postId]) {
                    state.byPost[comment.postId] = [];
                }
                state.byPost[comment.postId].unshift(comment.id);
            }
        },

        replaceComment(
            state,
            action: PayloadAction<{
                tempId: string;
                realComment: any;
            }>
        ) {
            const { tempId, realComment } = action.payload;
            const normalized: Comment = {
                id: realComment._id,
                _id: realComment._id,
                postId: realComment.postId,
                parentCommentId: realComment.parentCommentId,
                text: realComment.text,
                createdAt: realComment.createdAt,
                author: realComment.user,
                stats: realComment.stats || { likeCount: 0, replyCount: 0 },
                viewerState: realComment.viewerState || { liked: false }
            };

            const old = state.byId[tempId];
            if (!old) return;

            delete state.byId[tempId];
            state.byId[normalized.id] = normalized;
            if (normalized.parentCommentId) {
                state.byParent[normalized.parentCommentId] =
                    state.byParent[normalized.parentCommentId]?.map((id) =>
                        id === tempId ? normalized.id : id
                    ) || [];
            } else {
                state.byPost[normalized.postId] =
                    state.byPost[normalized.postId]?.map((id) =>
                        id === tempId ? normalized.id : id
                    ) || [];
            }
        },

        deleteComment(
            state,
            action: PayloadAction<{ commentId: string }>
        ) {
            const comment = state.byId[action.payload.commentId];
            if (!comment) return;

            const { parentCommentId, postId, id } = comment;

            delete state.byId[id];

            if (parentCommentId) {
                state.byParent[parentCommentId] =
                    state.byParent[parentCommentId]?.filter((cid) => cid !== id) || [];

                // Update parent reply count
                const parent = state.byId[parentCommentId];
                if (parent && parent.stats) {
                    parent.stats.replyCount--;
                }
            } else {
                state.byPost[postId] =
                    state.byPost[postId]?.filter((cid) => cid !== id) || [];
            }

            delete state.byParent[id];
        },

        toggleCommentLikeOptimistic(
            state,
            action: PayloadAction<{ commentId: string }>
        ) {
            const comment = state.byId[action.payload.commentId];
            if (!comment) return;

            if (!comment.viewerState) comment.viewerState = { liked: false };
            if (!comment.stats) comment.stats = { likeCount: 0, replyCount: 0 };

            if (comment.viewerState.liked) {
                comment.viewerState.liked = false;
                comment.stats.likeCount--;
            } else {
                comment.viewerState.liked = true;
                comment.stats.likeCount++;
            }
        },
    },
});

export const {
    setComments,
    addCommentOptimistic,
    replaceComment,
    deleteComment,
    toggleCommentLikeOptimistic,
} = commentsSlice.actions;

export default commentsSlice.reducer;