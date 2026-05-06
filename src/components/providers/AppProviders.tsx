'use client';

import { NotificationProvider } from './NotificationProvider';
import { ChatNotificationProvider } from './ChatNotificationProvider';
import { NotificationToastContainer } from '@/components/notifications/NotificationToast';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <NotificationProvider>
            <ChatNotificationProvider>
                <>
                    {children}
                    <NotificationToastContainer />
                </>
            </ChatNotificationProvider>
        </NotificationProvider>
    );
};
