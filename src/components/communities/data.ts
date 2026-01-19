export interface Community {
    id: string;
    name: string;
    members: string;
    tagStr: string; // e.g., "San Diego, CA", "Global", "Invite Only"
    description: string;
    coverImage: string;
    avatar: string;
    isPrivate: boolean;
    actionLabel: string;
    category: 'public' | 'private';
}

export interface PopularGroup {
    id: string;
    name: string;
    members: string;
    avatar: string; // Initials or URL
    color?: string; // For initial background
}

export const COMMUNTIES_DATA: Community[] = [
    {
        id: '1',
        name: 'Surf & Sand Locals',
        members: '12.5k Members',
        tagStr: 'San Diego, CA',
        description: 'Connect with local surfers, check morning reports, and organize beach cleanups.',
        coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&h=300&fit=crop',
        avatar: 'https://i.pravatar.cc/150?u=surf',
        isPrivate: false,
        actionLabel: 'Join Community',
        category: 'public'
    },
    {
        id: '2',
        name: 'Mediterranean Cruises',
        members: '45k Members',
        tagStr: 'Global',
        description: 'The ultimate guide to cruising the Med. Port reviews, ship tours, and daily itineraries.',
        coverImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&h=300&fit=crop', // Hotel/Resort vibe
        avatar: 'https://i.pravatar.cc/150?u=cruise',
        isPrivate: false,
        actionLabel: 'Join Community',
        category: 'public'
    },
    {
        id: '3',
        name: 'Hidden Beach Resorts',
        members: '2.1k Members',
        tagStr: 'Invite Only',
        description: 'Exclusive discussions on the world\'s most secluded and pristine destinations.',
        coverImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&h=300&fit=crop',
        avatar: 'https://placehold.co/150/E5E7EB/A3A3A3?text=H',
        isPrivate: true,
        actionLabel: 'Request to Join',
        category: 'private'
    },
    {
        id: '4',
        name: 'Ocean Architecture',
        members: '15k Members',
        tagStr: 'Design',
        description: 'Exploring modern coastal homes, floating structures, and sustainable marine living.',
        coverImage: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=500&h=300&fit=crop', // Modern building structure
        avatar: 'https://i.pravatar.cc/150?u=arch',
        isPrivate: false,
        actionLabel: 'Join Community',
        category: 'public'
    },
    {
        id: '5',
        name: 'Yacht Crew Net',
        members: '8.5k Members',
        tagStr: 'Professional',
        description: 'Professional networking for yacht captains, stewards, and deckhands worldwide.',
        coverImage: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=500&h=300&fit=crop',
        avatar: 'https://placehold.co/150/9d0208/ffffff?text=YC', // Icon
        isPrivate: true,
        actionLabel: 'Request to Join',
        category: 'private'
    },
    {
        id: '6',
        name: 'Seaside Analog',
        members: '18.4k Members',
        tagStr: 'Photography',
        description: 'Capturing the coast on film. Share your best sun-drenched shots and tips.',
        coverImage: 'https://images.unsplash.com/photo-1520052203542-d309559db695?w=500&h=300&fit=crop',
        avatar: 'https://i.pravatar.cc/150?u=analog',
        isPrivate: false,
        actionLabel: 'Join Community',
        category: 'public'
    }
];

export const POPULAR_COMMUNITIES: PopularGroup[] = [
    { id: '1', name: 'Global Surfers', members: '142k Members', avatar: 'https://i.pravatar.cc/150?u=gs' },
    { id: '2', name: 'Cruise Life', members: '89k Members', avatar: 'https://i.pravatar.cc/150?u=cl' },
    { id: '3', name: 'Beach Photography', members: '65k Members', avatar: '', color: 'bg-gray-100 text-gray-600' },
    { id: '4', name: 'Ocean Conservation', members: '210k Members', avatar: '', color: 'bg-blue-100 text-blue-600' },
    { id: '5', name: 'Island Divers', members: '18.2k Members', avatar: 'https://i.pravatar.cc/150?u=id' },
    { id: '6', name: 'Coastal Yoga', members: '7.5k Members', avatar: '', color: 'bg-orange-100 text-orange-600' },
    { id: '7', name: 'Sunset Photographers', members: '52k Members', avatar: '', color: 'bg-gray-100 text-gray-600' },
    { id: '8', name: 'Sailing Enthusiasts', members: '34k Members', avatar: '', color: 'bg-blue-100 text-blue-600' }
];

export const INVITES_DATA: PopularGroup[] = [
    { id: 'i1', name: 'Exclusive Resorts', members: 'Invite from Mark', avatar: '', color: 'bg-purple-100 text-purple-600' },
    { id: 'i2', name: 'Digital Nomads Bali', members: 'Invite from Sarah', avatar: 'https://i.pravatar.cc/150?u=dnb' },
    { id: 'i3', name: 'Yacht Owners Club', members: 'Invite from Captain Lee', avatar: '', color: 'bg-slate-100 text-slate-700' },
];

export const FILTERS = [
    'All Coastal',
    'Surf Spots',
    'Luxury Resorts',
    'Local Eats',
    'Diving & Snorkeling',
    'Sailing',
    'Marine Life',
    'Photography'
];
