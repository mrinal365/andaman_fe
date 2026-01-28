# Andaman Project Documentation

## 1. Project Overview
**Name**: Andaman
**Description**: A premium social networking platform focused on coastal travel, communities, and professional connections.
**Frontend Stack**: Next.js (App Router), TypeScript, Tailwind CSS.

## 2. Core Entities & Data Models

The following schemas represent the current frontend implementation and should be mirrored in the backend.

### 2.1 User
Standard user profile object used across feeds, messages, and communities.
```typescript
### 2.1 User
Standard user profile object used across feeds, messages, and communities.
```typescript
interface User {
    id: string;            // UUID
    email: string;         // Private (Auth)
    name: string;          // Display Name (e.g., "Mark Wilson")
    handle: string;        // Unique Handle (e.g., "@mwilson")
    avatar: string;        // URL
    coverImage?: string;   // Profile Header URL
    bio?: string;          // Short description
    location?: string;     // e.g., "Kyoto, Japan"
    website?: string;      // External link
    
    isOnline: boolean;     // Status
    verified?: boolean;    // For verified badge
    role: 'user' | 'admin' | 'service_owner';
    
    stats: UserStats;
    settings?: UserSettings; // Private (Current User Only)
    joinedAt: string;        // ISO Date
}

interface UserStats {
    posts: number;
    followers: number;
    following: number;
}

interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
    isPrivateProfile: boolean;
}
```

### 2.2 Post (Feed)
Rich content posts displayed in the main feed.
```typescript
type PostTag = 'update' | 'guide' | 'news' | 'post' | 'ad';

interface Post {
    id: string;
    author: User;
    content: {
        text: string;
        images?: string[];     // Array of image URLs (1-5 supported in UI)
        tag: PostTag;          // Content category
    };
    stats: {
        likes: string | number; // e.g., "1.2k" or 1200
        comments: string | number;
        views: string | number;
    };
    commentsList?: Comment[];   // Top comments for preview
    timestamp: string;          // ISO Date or relative string
}

interface Comment {
    id: string;
    user: User; // or just username for simple view
    text: string;
    timestamp?: string;
}
```

### 2.3 Notification
Comprehensive notification system with 9 distinct types.
```typescript
type NotificationType = 
    | 'like' | 'comment' | 'trending' | 'follow' 
    | 'publish' | 'system' | 'mention' | 'reminder' | 'reply';

interface Notification {
    id: string;
    type: NotificationType;
    actor: {
        name: string;
        avatar?: string;
        isSystem?: boolean; // True for system alerts
    };
    content: string;        // Main text
    context?: string;       // Secondary text (e.g., post title)
    previewImage?: string;  // Thumbnail
    timestamp: string;
    isUnread: boolean;
    actionLabel?: string;   // e.g., "FOLLOW BACK"
}
```

### 2.4 Conversation (Messages)
Chat system supporting 1-on-1 and Group chats.
```typescript
interface Conversation {
    id: string;
    user?: User;           // For 1-on-1
    isGroup?: boolean;
    groupName?: string;    // If collection, display name
    memberCount?: number;
    unreadCount: number;
    lastMessage: string;
    lastMessageTime: string;
    messages: Message[];
}

interface Message {
    id: string;
    senderId: string;      // 'me' or valid User ID
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    isOwn: boolean;        // Helper flag for UI
}
```

### 2.5 Community
Groups or pages users can join.
```typescript
interface Community {
    id: string;
    name: string;
    description: string;
    category: 'public' | 'private';
    isPrivate: boolean;
    members: string;       // e.g., "12.5k Members"
    tagStr: string;        // e.g., "San Diego, CA"
    coverImage: string;    // Hero image URL
    avatar: string;        // Logo URL
    actionLabel: string;   // "Join Community" | "Request to Join"
}

interface CommunityInvite {
    id: string;
    communityName: string;
    invitedBy: string;     // User Name
    avatar: string;
}
```

## 3. Required API Endpoints
Based on the frontend requirements, the following APIs are needed:

### User & Auth
- `GET /api/v1/me` - Current user profile.
- `GET /api/v1/users/:id` - Public profile.

### Feed
- `GET /api/v1/feed?page=1` - Paginated feed posts.
- `POST /api/v1/posts` - Create new post (Multipart for images).
- `POST /api/v1/posts/:id/like` - Toggle like.

### Notifications
- `GET /api/v1/notifications` - List recent notifications.
- `POST /api/v1/notifications/mark-read` - clear badge.

### Messaging
- `GET /api/v1/conversations` - List all chats (inbox).
- `GET /api/v1/conversations/:id/messages` - Message history.
- `POST /api/v1/conversations/:id/messages` - Send message (WebSocket preferred for real-time).

### Communities
- `GET /api/v1/communities` - Discovery list (filtered).
- `GET /api/v1/communities/my` - User's joined communities.
- `GET /api/v1/communities/invites` - Pending invites.
- `POST /api/v1/communities/:id/join` - Join action.

## 4. UI/UX Considerations
- **Infinite Scroll**: Feed and Notifications require pagination/infinite scroll cursor.
- **Real-time**: Messages should use WebSockets for "Typing..." and "New Message" updates.
- **Media**: Backend must handle image resizing/optimization (e.g., Unsplash/Cloudinary integration) as the UI relies on specific aspect ratios.
