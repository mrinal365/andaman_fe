export type NotificationType =
    | 'like'
    | 'comment'
    | 'trending'
    | 'follow'
    | 'publish'
    | 'system'
    | 'mention'
    | 'reminder'
    | 'reply';

export interface Notification {
    id: string;
    type: NotificationType;
    actor: {
        name: string;
        avatar?: string; // URL or blank for initials
        isSystem?: boolean; // For system icons
    };
    content: string; // The main text
    context?: string; // "about Kyoto temples", "in Minimalist Living", etc.
    previewImage?: string; // Thumbnail for likes/mentions
    timestamp: string;
    isUnread: boolean;
    actionLabel?: string; // "FOLLOW BACK"
}

// Base set of realistic notifications
const BASE_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'like',
        actor: { name: 'Mark Wilson', avatar: 'https://i.pravatar.cc/150?u=mark' },
        content: 'liked your post about Kyoto temples.',
        timestamp: '2 min ago',
        isUnread: true,
        previewImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=150&h=150&fit=crop'
    },
    {
        id: '2',
        type: 'comment',
        actor: { name: 'Julia', avatar: 'https://i.pravatar.cc/150?u=julia' },
        content: 'commented on your photo: "The colors in this are absolutely stunning! 😍"',
        timestamp: '15 min ago',
        isUnread: true
    },
    {
        id: '3',
        type: 'trending',
        actor: { name: 'Minimalist Living', isSystem: true },
        content: 'New trending discussion in Minimalist Living: "Decluttering digital workspaces"',
        timestamp: '45 min ago',
        isUnread: true
    },
    {
        id: '4',
        type: 'follow',
        actor: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        content: 'started following you.',
        timestamp: '2 hours ago',
        isUnread: false,
        actionLabel: 'FOLLOW BACK'
    },
    {
        id: '5',
        type: 'publish',
        actor: { name: 'Minimal Design', avatar: 'https://placehold.co/150/E5E7EB/A3A3A3?text=MD' },
        content: 'published a new article: "Sustainable Architecture 2024"',
        timestamp: '5 hours ago',
        isUnread: false
    },
    {
        id: '6',
        type: 'system',
        actor: { name: 'System Alert', isSystem: true },
        content: 'Your password was changed.',
        timestamp: '1 day ago',
        isUnread: false
    },
    {
        id: '7',
        type: 'mention',
        actor: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
        content: 'mentioned you in "Office Setup Tour"',
        timestamp: '2 days ago',
        isUnread: false,
        previewImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=150&h=150&fit=crop'
    },
    {
        id: '8',
        type: 'reminder',
        actor: { name: 'Reminder', isSystem: true },
        content: 'Design Team Sync starts in 15 minutes.',
        timestamp: '3 days ago',
        isUnread: false
    },
    {
        id: '9',
        type: 'reply',
        actor: { name: 'Emma Watson', avatar: 'https://i.pravatar.cc/150?u=emma' },
        content: 'replied to your comment on "Minimalist Workflows"',
        timestamp: '4 days ago',
        isUnread: false
    }
];

// Generator to create ~60 items
const generateNotifications = (count: number): Notification[] => {
    const notifications: Notification[] = [];
    const actors = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Jamie'];
    const actions = [
        { type: 'like', text: 'liked your post.', hasPreview: true },
        { type: 'comment', text: 'commented: "Great work!"' },
        { type: 'follow', text: 'followed you.', hasAction: true },
        { type: 'mention', text: 'mentioned you in a comment.' },
    ];

    // Add base ones first
    notifications.push(...BASE_NOTIFICATIONS);

    for (let i = 0; i < count - BASE_NOTIFICATIONS.length; i++) {
        const actorName = actors[Math.floor(Math.random() * actors.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const timeAgo = `${Math.floor(Math.random() * 24) + 1}h ago`;

        notifications.push({
            id: `gen-${i}`,
            type: action.type as NotificationType,
            actor: {
                name: actorName,
                avatar: `https://i.pravatar.cc/150?u=${actorName}-${i}`
            },
            content: action.text,
            timestamp: timeAgo,
            isUnread: Math.random() > 0.8,
            actionLabel: action.hasAction ? 'FOLLOW BACK' : undefined,
            previewImage: action.hasPreview ? `https://picsum.photos/seed/${i}/150/150` : undefined,
        });
    }

    // Sort roughly by time? (Not implementing complex sort, just list)
    return notifications;
};

export const MOCK_NOTIFICATIONS = generateNotifications(60);
