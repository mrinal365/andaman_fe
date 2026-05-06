export const chatConfig = {
    enableGlobalNotifications: true,
    notificationDuration: 5000,
    maxNotifications: 10,
    textPrivacyEnabled: false,
    namePrivacyEnabled: false,
    messagesPerPage: 10,
    comingSoon: {
        communities: true,
        upcomingEvents: true,
        news: true,
    }
};

export type ChatConfig = typeof chatConfig;
