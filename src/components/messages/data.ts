export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    status: MessageStatus;
    isOwn: boolean;
}

export interface Conversation {
    id: string;
    user: User;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isGroup?: boolean;
    memberCount?: number;
    messages: Message[];
}

export const CURRENT_USER_ID = 'me';

const createMessages = (context: string, isGroup: boolean = false): Message[] => {
    const commonMsgs: Message[] = [
        { id: 'm1', senderId: 'other', text: `Hey, about ${context}...`, timestamp: '09:00 AM', status: 'read' as MessageStatus, isOwn: false },
        { id: 'm2', senderId: 'me', text: 'Yeah, I saw the update. Looks good!', timestamp: '09:05 AM', status: 'read' as MessageStatus, isOwn: true },
        { id: 'm3', senderId: 'other', text: 'Great, lets sync later.', timestamp: '10:00 AM', status: 'read' as MessageStatus, isOwn: false },
    ];

    if (isGroup) {
        return [
            { id: 'g1', senderId: 'user1', text: `Anyone seen the ${context} file?`, timestamp: '10:00 AM', status: 'read' as MessageStatus, isOwn: false },
            { id: 'g2', senderId: 'user2', text: 'I think Sarah has it.', timestamp: '10:02 AM', status: 'read' as MessageStatus, isOwn: false },
            { id: 'g3', senderId: 'me', text: 'Checking now...', timestamp: '10:05 AM', status: 'read' as MessageStatus, isOwn: true },
        ];
    }

    return commonMsgs;
};

export const MOCK_CONVERSATIONS: Conversation[] = [
    // Personal Chats (14 users)
    {
        id: '1',
        user: { id: 'mark', name: 'Mark Wilson', handle: '@mwilson', avatar: 'https://i.pravatar.cc/150?u=mark', isOnline: true },
        lastMessage: 'That sounds like a great plan! 🏯',
        lastMessageTime: 'Now',
        unreadCount: 0,
        messages: [
            { id: '1a', senderId: 'mark', text: 'Hey, are we still on for lunch?', timestamp: '11:30 AM', status: 'read' as MessageStatus, isOwn: false },
            { id: '1b', senderId: 'me', text: 'Yes! suggested place?', timestamp: '11:32 AM', status: 'read' as MessageStatus, isOwn: true },
            { id: '1c', senderId: 'mark', text: 'That sushi spot downtown.', timestamp: '11:33 AM', status: 'read' as MessageStatus, isOwn: false },
            { id: '1d', senderId: 'me', text: 'Perfect. See you there.', timestamp: '11:35 AM', status: 'read' as MessageStatus, isOwn: true },
            { id: '1e', senderId: 'mark', text: 'That sounds like a great plan! 🏯', timestamp: '12:00 PM', status: 'read' as MessageStatus, isOwn: false },
        ],
    },
    {
        id: '2',
        user: { id: 'sarah', name: 'Sarah Jenkins', handle: '@sarahj', avatar: 'https://i.pravatar.cc/150?u=sarah', isOnline: false },
        lastMessage: 'Can you send me the files?',
        lastMessageTime: '2m',
        unreadCount: 2,
        messages: createMessages('the project files'),
    },
    {
        id: 'p1',
        user: { id: 'john', name: 'John Doe', handle: '@jdoe', avatar: 'https://i.pravatar.cc/150?u=john', isOnline: true },
        lastMessage: 'Meeting at 5?',
        lastMessageTime: '15m',
        unreadCount: 0,
        messages: createMessages('the evening meeting'),
    },
    {
        id: 'p2',
        user: { id: 'emily', name: 'Emily Blunt', handle: '@emilyb', avatar: 'https://i.pravatar.cc/150?u=emily', isOnline: false },
        lastMessage: 'Thanks for the help!',
        lastMessageTime: '1h',
        unreadCount: 0,
        messages: createMessages('your assistance'),
    },
    {
        id: 'p3',
        user: { id: 'michael', name: 'Michael Scott', handle: '@mscott', avatar: 'https://i.pravatar.cc/150?u=michael', isOnline: true },
        lastMessage: 'That\'s what she said!',
        lastMessageTime: '3h',
        unreadCount: 1,
        messages: [
            { id: 'm1', senderId: 'michael', text: 'Guess what?', timestamp: '2:00 PM', status: 'read' as MessageStatus, isOwn: false },
            { id: 'm2', senderId: 'me', text: 'What?', timestamp: '2:01 PM', status: 'read' as MessageStatus, isOwn: true },
            { id: 'm3', senderId: 'michael', text: 'That\'s what she said!', timestamp: '2:05 PM', status: 'read' as MessageStatus, isOwn: false },
        ],
    },
    {
        id: 'p4',
        user: { id: 'dwight', name: 'Dwight Schrute', handle: '@dwights', avatar: 'https://i.pravatar.cc/150?u=dwight', isOnline: false },
        lastMessage: 'Bears. Beets. Battlestar Galactica.',
        lastMessageTime: '5h',
        unreadCount: 0,
        messages: createMessages('security protocols'),
    },
    {
        id: 'p5',
        user: { id: 'pam', name: 'Pam Beesly', handle: '@pamb', avatar: 'https://i.pravatar.cc/150?u=pam', isOnline: true },
        lastMessage: 'Did you see the new painting?',
        lastMessageTime: '1d',
        unreadCount: 0,
        messages: createMessages('art class'),
    },
    {
        id: 'p6',
        user: { id: 'jim', name: 'Jim Halpert', handle: '@jimh', avatar: 'https://i.pravatar.cc/150?u=jim', isOnline: false },
        lastMessage: 'Prank idea #245...',
        lastMessageTime: '1d',
        unreadCount: 0,
        messages: createMessages('Dwight\'s desk'),
    },
    {
        id: 'p7',
        user: { id: 'ryan', name: 'Ryan Howard', handle: '@ryanh', avatar: 'https://i.pravatar.cc/150?u=ryan', isOnline: true },
        lastMessage: 'WUPHF.com is live!',
        lastMessageTime: '2d',
        unreadCount: 0,
        messages: createMessages('the startup'),
    },
    {
        id: 'p8',
        user: { id: 'andy', name: 'Andy Bernard', handle: '@andyb', avatar: 'https://i.pravatar.cc/150?u=andy', isOnline: false },
        lastMessage: 'Rit dit dit do doo!',
        lastMessageTime: '3d',
        unreadCount: 0,
        messages: createMessages('acapella practice'),
    },
    {
        id: 'p9',
        user: { id: 'stanley', name: 'Stanley H.', handle: '@stanley', avatar: 'https://i.pravatar.cc/150?u=stanley', isOnline: false },
        lastMessage: 'Did I stutter?',
        lastMessageTime: '4d',
        unreadCount: 0,
        messages: createMessages('Pretzel Day'),
    },
    {
        id: 'p10',
        user: { id: 'angela', name: 'Angela Martin', handle: '@angela', avatar: 'https://i.pravatar.cc/150?u=angela', isOnline: true },
        lastMessage: 'Save Bandit!',
        lastMessageTime: '5d',
        unreadCount: 0,
        messages: createMessages('the cats'),
    },
    {
        id: 'p11',
        user: { id: 'kevin', name: 'Kevin Malone', handle: '@kevin', avatar: 'https://i.pravatar.cc/150?u=kevin', isOnline: false },
        lastMessage: 'Chili day creates success.',
        lastMessageTime: '1w',
        unreadCount: 0,
        messages: createMessages('the pot of chili'),
    },
    {
        id: 'p12',
        user: { id: 'oscar', name: 'Oscar Martinez', handle: '@oscar', avatar: 'https://i.pravatar.cc/150?u=oscar', isOnline: true },
        lastMessage: 'Actually...',
        lastMessageTime: '1w',
        unreadCount: 0,
        messages: createMessages('the surplus'),
    },

    // Groups (15 groups)
    {
        id: 'g1',
        isGroup: true,
        memberCount: 8,
        user: { id: 'dev-team', name: 'Frontend Devs 🚀', handle: '@fe_devs', avatar: '', isOnline: true },
        lastMessage: 'Sarah: PR is merged, please review.',
        lastMessageTime: '10m',
        unreadCount: 5,
        messages: createMessages('the React migration', true),
    },
    {
        id: 'g2',
        isGroup: true,
        memberCount: 12,
        user: { id: 'marketing', name: 'Marketing Squad', handle: '@marketing', avatar: '', isOnline: true },
        lastMessage: 'Alex: New campaign is live!',
        lastMessageTime: '30m',
        unreadCount: 0,
        messages: createMessages('Q4 goals', true),
    },
    {
        id: 'g3',
        isGroup: true,
        memberCount: 5,
        user: { id: 'product', name: 'Product Design', handle: '@design', avatar: 'https://placehold.co/150/7C3AED/ffffff?text=PD', isOnline: true },
        lastMessage: 'David: Updated the Figma links.',
        lastMessageTime: '1h',
        unreadCount: 2,
        messages: createMessages('the mockups', true),
    },
    {
        id: 'g4',
        isGroup: true,
        memberCount: 24,
        user: { id: 'sales', name: 'Sales Team', handle: '@sales', avatar: 'https://placehold.co/150/059669/ffffff?text=$$', isOnline: false },
        lastMessage: 'Jim: Closed the deal!',
        lastMessageTime: '2h',
        unreadCount: 0,
        messages: createMessages('monthly targets', true),
    },
    {
        id: 'g5',
        isGroup: true,
        memberCount: 156,
        user: { id: 'hr', name: 'HR Updates', handle: '@hr', avatar: '', isOnline: false },
        lastMessage: 'Toby: Please fill out form 29B.',
        lastMessageTime: '4h',
        unreadCount: 0,
        messages: createMessages('policy changes', true),
    },
    {
        id: 'g6',
        isGroup: true,
        memberCount: 42,
        user: { id: 'memes', name: 'Office Memes', handle: '@memes', avatar: 'https://placehold.co/150/F59E0B/ffffff?text=XD', isOnline: true },
        lastMessage: 'Kevin: [Image]',
        lastMessageTime: '5h',
        unreadCount: 12,
        messages: createMessages('that cat video', true),
    },
    {
        id: 'g7',
        isGroup: true,
        memberCount: 6,
        user: { id: 'lunch', name: 'Lunch Buddies', handle: '@lunch', avatar: '', isOnline: false },
        lastMessage: 'Pam: Thai today?',
        lastMessageTime: '6h',
        unreadCount: 0,
        messages: createMessages('lunch plans', true),
    },
    {
        id: 'g8',
        isGroup: true,
        memberCount: 10,
        user: { id: 'leadership', name: 'Leadership', handle: '@leads', avatar: '', isOnline: true },
        lastMessage: 'Michael: Emergency meeting!',
        lastMessageTime: '1d',
        unreadCount: 1,
        messages: createMessages('budget cuts', true),
    },
    {
        id: 'g9',
        isGroup: true,
        memberCount: 3,
        user: { id: 'party', name: 'Party Planning', handle: '@party', avatar: 'https://placehold.co/150/EC4899/ffffff?text=PPC', isOnline: false },
        lastMessage: 'Angela: No green streamers.',
        lastMessageTime: '1d',
        unreadCount: 0,
        messages: createMessages('the holiday party', true),
    },
    {
        id: 'g10',
        isGroup: true,
        memberCount: 22,
        user: { id: 'tech-talk', name: 'Tech Talk', handle: '@tech', avatar: '', isOnline: true },
        lastMessage: 'Ryan: Javascript is the future.',
        lastMessageTime: '2d',
        unreadCount: 0,
        messages: createMessages('the new framework', true),
    },
    {
        id: 'g11',
        isGroup: true,
        memberCount: 7,
        user: { id: 'accounting', name: 'Accounting', handle: '@acct', avatar: '', isOnline: false },
        lastMessage: 'Oscar: Budget review next week.',
        lastMessageTime: '2d',
        unreadCount: 0,
        messages: createMessages('expense reports', true),
    },
    {
        id: 'g12',
        isGroup: true,
        memberCount: 15,
        user: { id: 'warehouse', name: 'Warehouse', handle: '@ware', avatar: '', isOnline: false },
        lastMessage: 'Darryl: Shipment arrived.',
        lastMessageTime: '3d',
        unreadCount: 0,
        messages: createMessages('inventory', true),
    },
    {
        id: 'g13',
        isGroup: true,
        memberCount: 4,
        user: { id: 'gaming', name: 'Gaming Club', handle: '@game', avatar: 'https://placehold.co/150/8B5CF6/ffffff?text=GC', isOnline: true },
        lastMessage: 'Jim: CoD tonight?',
        lastMessageTime: '4d',
        unreadCount: 9,
        messages: createMessages('the tournament', true),
    },
    {
        id: 'g14',
        isGroup: true,
        memberCount: 8,
        user: { id: 'travel', name: 'Travel Enthusiasts', handle: '@travel', avatar: '', isOnline: false },
        lastMessage: 'Toby: Costa Rica photos.',
        lastMessageTime: '1w',
        unreadCount: 0,
        messages: createMessages('vacation days', true),
    },
    {
        id: 'g15',
        isGroup: true,
        memberCount: 11,
        user: { id: 'books', name: 'Book Club', handle: '@books', avatar: '', isOnline: false },
        lastMessage: 'Pam: New chapter discussion.',
        lastMessageTime: '1w',
        unreadCount: 0,
        messages: createMessages('the new book', true),
    }
];
