export interface UserStats {
    posts: number;
    followers: number;
    following: number;
}

export interface UserSettings {
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    pushNotifications: boolean;
    isPrivateProfile: boolean;
}

export interface User {
    id: string;
    _id: string;
    name: string;
    email: string;
    handle: string;
    avatar: string;
    coverImage: string;
    coverPosition: number;

    isOnline: boolean;
    verified: boolean;
    blockedByAdmin?: boolean;
    role: "user" | "admin"; // extend if needed

    lastSeen: string;   // could be Date if you parse it
    joinedAt: string;

    bio?: string;
    location?: string;
    website?: string;
    tags?: string[];

    isFollowing?: boolean;
    isFollower?: boolean;

    stats: UserStats;
    settings: UserSettings;

    __v: number;
}