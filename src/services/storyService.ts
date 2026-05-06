import api from './api';
import { StoryGroup, Story } from '../types/story';

export const getStoryFeed = async (): Promise<StoryGroup[]> => {
    const response = await api.get('/stories/feed');
    return response.data;
};

export const createStory = async (imageUrl: string): Promise<Story> => {
    const response = await api.post('/stories', { imageUrl });
    return response.data;
};

export const likeStory = async (storyId: string): Promise<any> => {
    const response = await api.post(`/stories/${storyId}/like`);
    return response.data;
};

export const viewStory = async (storyId: string): Promise<any> => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
};

export const getStoryLikes = async (storyId: string): Promise<any[]> => {
    const response = await api.get(`/stories/${storyId}/likes`);
    return response.data;
};

export const getStoryViews = async (storyId: string): Promise<any[]> => {
    const response = await api.get(`/stories/${storyId}/views`);
    return response.data;
};
