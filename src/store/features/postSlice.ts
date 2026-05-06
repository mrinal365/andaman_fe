import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Post } from "../../../types/post";

interface FeedPayload {
    posts: Post[];
    nextCursor?: string | null;
    hasMore?: boolean;
}

interface PostsState {
    byId: Record<string, Post>;
    feedIds: string[];
    loading: boolean;
    hasMore: boolean;
    nextCursor: string | null;
}

const initialState: PostsState = {
    byId: {},
    feedIds: [],
    loading: false,
    hasMore: true,
    nextCursor: null,
};

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setFeed(state, action: PayloadAction<FeedPayload>) {
            const { posts = [], nextCursor, hasMore } = action.payload;

            state.feedIds = [];

            posts.forEach((post) => {
                if (!post?.id) return;
                state.byId[post.id] = post;
                state.feedIds.push(post.id);
            });

            if (nextCursor !== undefined) state.nextCursor = nextCursor;
            if (hasMore !== undefined) state.hasMore = hasMore;
        },
        addPostOptimistic(state, action: PayloadAction<Post>) {
            const post = { ...action.payload };
            // normalize: ensure both id and _id exist
            const postId = post._id || post.id;
            if (!postId) return;
            post.id = postId;
            post._id = postId;
            // ensure defaults so interactions work on new posts
            if (!post.viewerState) {
                post.viewerState = { liked: false, saved: false, vote: 0, followingAuthor: false };
            }
            if (!post.stats) {
                post.stats = { likeCount: 0, commentCount: 0, viewCount: 0, shareCount: 0 };
            }
            state.byId[postId] = post;
            state.feedIds.unshift(postId);
        },

        toggleLikeOptimistic(state, action: PayloadAction<string>) {
            const post = state.byId[action.payload];
            if (!post) return;

            if (!post.stats) post.stats = { likeCount: 0, commentCount: 0, viewCount: 0, shareCount: 0 };
            if (!post.viewerState) post.viewerState = { liked: false, saved: false, vote: 0, followingAuthor: false };

            const wasLiked = post.viewerState.liked;
            post.viewerState.liked = !wasLiked;
            post.stats.likeCount = (post.stats.likeCount || 0) + (wasLiked ? -1 : 1);
        },
        toggleSavedOptimistic(state, action: PayloadAction<string>) {
            const post = state.byId[action.payload];
            if (!post) return;

            if (!post.viewerState) post.viewerState = { liked: false, saved: false, vote: 0, followingAuthor: false };
            post.viewerState.saved = !post.viewerState.saved;
        },
        // increase comment value to the post 
        increaseCommentCount(state, action: PayloadAction<string>) {
            const post = state.byId[action.payload];
            if (!post) return;
            if (!post.stats) post.stats = { likeCount: 0, commentCount: 0, viewCount: 0, shareCount: 0 };

            post.stats.commentCount += 1;
        },
        appendFeed: (state, action: PayloadAction<{ posts: Post[] }>) => {
            action.payload.posts.forEach((post: Post) => {
                if (!state.byId[post.id]) {
                    state.byId[post.id] = post;
                    state.feedIds.push(post.id);
                }
            });
        },
        // addOneCommentOptimistic(state, action: PayloadAction<string>) {
        //     // get the post and add the comments
        //     const post = state.byId[action.payload];
        //     if (!post) return;

        //     post.comments.push({
        //         _id: "",
        //         postId: post._id,
        //         author: {
        //             name: "",
        //             avatar: "",
        //             handle: ""
        //         },
        //         text: "",
        //         createdAt: new Date().toISOString(),
        //         stats: { likeCount: 0, replyCount: 0 }
        //     });
        // },
        // addCommentListInPost(state, action: PayloadAction<string>) {
        //     // get the post and add the comments
        //     const post = state.byId[action.payload];
        //     if (!post) return;

        //     post.comments.push({
        //         _id: "",
        //         postId: post._id,
        //         author: {
        //             name: "",
        //             avatar: "",
        //             handle: ""
        //         },
        //         text: "",
        //         createdAt: new Date().toISOString(),
        //         stats: { likeCount: 0, replyCount: 0 }
        //     });
        // },

        deletePostOptimistic(state, action: PayloadAction<string>) {
            const postId = action.payload;
            delete state.byId[postId];
            state.feedIds = state.feedIds.filter(id => id !== postId);
        },
        resetFeed(state) {
            state.byId = {};
            state.feedIds = [];
            state.nextCursor = null;
            state.hasMore = true;
            state.loading = false;
        },
    },
});

export const {
    setFeed,
    toggleLikeOptimistic,
    resetFeed,
    toggleSavedOptimistic,
    // addOneCommentOptimistic,
    // addCommentListInPost
    appendFeed,
    addPostOptimistic,
    increaseCommentCount,
    deletePostOptimistic
} = postsSlice.actions;

export default postsSlice.reducer;




