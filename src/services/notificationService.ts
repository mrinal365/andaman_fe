import api from './api';

export const getNotifications = async (page = 1, limit = 20): Promise<any> => {
    const response = await api.get<any>(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUnreadCount = async (): Promise<any> => {
    const response = await api.get<any>('/notifications/unread-count');
    return response.data;
};

export const markNotificationRead = async (id: string): Promise<any> => {
    const response = await api.patch<any>(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async (): Promise<any> => {
    const response = await api.patch<any>('/notifications/read-all');
    return response.data;
};

export const markMultipleNotificationsRead = async (notificationIds: string[]): Promise<any> => {
    const response = await api.patch<any>('/notifications/read-multiple', { notificationIds });
    return response.data;
};


export const deleteNotification = async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/notifications/${id}`);
    return response.data;
};
