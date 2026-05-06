import { User } from '../../types/user';
import { Post } from '../../types/post';
import api from './api';

export const getUserProfile = async (handle: string): Promise<User> => {
    const response = await api.get(`/users/${handle}`);
    const data = response.data;
    if (data && data._id && !data.id) {
        data.id = data._id;
    }
    return data;
};

export const getUserPosts = async (handle: string, cursor?: string): Promise<{ posts: Post[], hasMore: boolean, nextCursor: string }> => {
    const params: any = {};
    if (cursor) params.cursor = cursor;

    const response = await api.get(`/users/${handle}/posts`, { params });
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

export const updateProfile = async (data: { avatar?: string, coverImage?: string }): Promise<any> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
};

export const startConversation = async (userId: string): Promise<any> => {
    const response = await api.post('/chat/conversation', { userId });
    return response.data;
};

export const followUser = async (userId: string): Promise<any> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
};

export const unfollowUser = async (userId: string): Promise<any> => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data;
};

export const checkIsFollowing = async (userId: string): Promise<any> => {
    const response = await api.get(`/users/${userId}/is-following`);
    return response.data;
};

export const getFollowers = async (userId: string): Promise<any[]> => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
};

export const getFollowing = async (userId: string): Promise<any[]> => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
};



