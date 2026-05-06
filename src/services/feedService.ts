import { Post } from '../../types/post';
import { Comment } from '../../types/comment';
import api from './api';


export const getFeed = async (cursor?: string): Promise<{ posts: Post[], hasMore: boolean, nextCursor: string }> => {
    const params: any = {};

    if (cursor && cursor !== 'undefined' && cursor !== 'null') {
        params.cursor = cursor;
    }

    const response = await api.get('/feed', { params });
    const data = response.data;
    if (data && data.posts) {
        data.posts = data.posts.map((post: any) => {
            const normalizedPost = { ...post, id: post.id || post._id };
            if (normalizedPost.author && normalizedPost.author._id && !normalizedPost.author.id) {
                normalizedPost.author.id = normalizedPost.author._id;
            }
            return normalizedPost;
        });
    }
    return data;
};

export const likeUnlikePost = async (postId: string): Promise<any> => {
    const response = await api.post<any>(`/posts/${postId}/like`);
    return response.data;
};

export const likeUnlikeComment = async (commentId: string): Promise<any> => {
    const response = await api.post<any>(`/comments/${commentId}/like`);
    return response.data;
};

export const savePost = async (postId: string): Promise<any> => {
    const response = await api.post<any>(`/posts/${postId}/save`);
    return response.data;
};

export const commentOnPost = async (postId: string, comment: string, taggedUsers?: string[]): Promise<any> => {
    const response = await api.post<any>(`/posts/${postId}/comments`, { text: comment, taggedUsers });
    return response.data;
};

export const replyToComment = async (commentId: string, replyText: string, taggedUsers?: string[]): Promise<any> => {
    const response = await api.post<any>(`/comments/${commentId}/reply`, { text: replyText, taggedUsers });
    return response.data;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    const response = await api.get<any>(`/posts/${postId}/comments`);
    return response.data;
};

export const getPostLikes = async (postId: string): Promise<any> => {
    const response = await api.get<any>(`/posts/${postId}/likes`);
    return response.data;
};
export const createPost = async (post: any): Promise<any> => {
    const response = await api.post<any>('/posts', post);
    return response.data;
};

export const getSavedPosts = async (cursor?: string): Promise<any> => {
    const params: any = {};
    if (cursor && cursor !== 'undefined' && cursor !== 'null') {
        params.cursor = cursor;
    }
    const response = await api.get('/feed/saved', { params });
    const data = response.data;
    if (data && data.posts) {
        data.posts = data.posts.map((post: any) => {
            const normalizedPost = { ...post, id: post.id || post._id };
            if (normalizedPost.author && normalizedPost.author._id && !normalizedPost.author.id) {
                normalizedPost.author.id = normalizedPost.author._id;
            }
            return normalizedPost;
        });
    }
    return data;
};

export const recordView = async (postId: string): Promise<any> => {
    const response = await api.post<any>(`/posts/${postId}/view`);
    return response.data;
};
// export const signup = async (userData: SignupData): Promise<AuthResponse> => {
//     const response = await api.post<AuthResponse>('/auth/register', userData);
//     return response.data;
// };

// export const googleLogin = async (token: string): Promise<AuthResponse> => {
//     const response = await api.post<AuthResponse>('/auth/google', { token });
//     return response.data;
// };

// export const logout = async (): Promise<void> => {
//     // Invalidate token or call logout endpoint
//     // localStorage.removeItem('token');
// };

// export const getCurrentUser = async (): Promise<User> => {
//     const response = await api.get<User>('/auth/me');
//     return response.data;
// };
export const deletePost = async (postId: string): Promise<any> => {
    const response = await api.delete<any>(`/posts/${postId}`);
    return response.data;
};

export const deleteComment = async (commentId: string): Promise<any> => {
    const response = await api.delete<any>(`/comments/${commentId}`);
    return response.data;
};
