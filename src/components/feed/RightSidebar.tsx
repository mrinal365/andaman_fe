'use client'
import { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ChevronDown, Video, Clock, Layout, Coffee, Leaf, Users, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

// ... (existing constants)

const DISCOVERY_ITEMS = [
    {
        id: 1,
        label: 'TECH',
        title: 'AI Breakthroughs',
        posts: '24k',
        img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 2,
        label: 'DESIGN',
        title: 'Maximalism',
        posts: '18.5k',
        img: 'https://i.pravatar.cc/150?u=design_guy'
    },
    {
        id: 3,
        label: 'TRAVEL',
        title: 'Hidden Gems',
        posts: '12.1k',
        img: 'https://images.unsplash.com/photo-1518182170546-0766cee69690?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 4,
        label: 'STYLE',
        title: 'Sustainable Looks',
        posts: '9.8k',
        img: 'https://i.pravatar.cc/150?u=style_guy'
    },
    {
        id: 5,
        label: 'WORK',
        title: 'Remote Life',
        posts: '7.3k',
        img: 'https://i.pravatar.cc/150?u=work_girl'
    },
];

const TRENDING_NEWS = [
    {
        title: "SpaceX Starship successfully reaches orbit after historic launch from Texas",
        time: "2h ago",
        readers: "12k reads"
    },
    {
        title: "European Union passes landmark AI Act to regulate artificial intelligence use",
        time: "4h ago",
        readers: "8.5k reads"
    },
    {
        title: "Apple announces Vision Pro 2 with lighter design and improved battery life",
        time: "6h ago",
        readers: "15k reads"
    },
    {
        title: "Revolutionary solid-state battery tech promises to double EV range by 2025",
        time: "12h ago",
        readers: "5k reads"
    }
];
const COMMUNITIES = [
    { name: 'UI/UX Designers', members: '12k', icon: Layout },
    { name: 'Minimalist Living', members: '8.5k', icon: Coffee },
    { name: 'Yoga & Wellness', members: '5.2k', icon: Leaf },
];

export const RightSidebar = () => {
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    return (
        <aside className="h-full w-full flex flex-col gap-4 overflow-y-auto no-scrollbar pt-6 pb-4">
            {/* Profile Snippet */}
            {/* Profile Snippet - Expandable */}
            <Card
                className="group relative flex flex-col rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 bg-white transition-all overflow-hidden cursor-pointer active:scale-[0.99] shrink-0"
                padding="none"
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
                {/* Header Row */}
                <div className="flex items-center gap-3 py-2.5 px-4 w-full">
                    <Avatar src="https://i.pravatar.cc/150?u=jane" size="md" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[14px] text-gray-900 leading-tight">Jane Doe</h4>
                        <p className="text-[12px] text-gray-400 font-medium">@janedoe</p>
                    </div>
                    <ChevronDown
                        className={cn(
                            "h-5 w-5 text-gray-400 stroke-[1.5] transition-transform duration-300",
                            isProfileExpanded ? "rotate-180 text-[var(--color-primary)]" : ""
                        )}
                    />
                </div>

                {/* Expanded Content */}
                <div className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-in-out",
                    isProfileExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}>
                    <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-50">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-3">
                                {['Traveler', 'Service Owner', 'Guide'].map((tag) => (
                                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-900 border-gray-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-center">
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">128</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Posts</div>
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">1.2k</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Followers</div>
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-gray-900">450</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Following</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Discovery -> Trending Communities */}
            <Card className="p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">Trending News</h3>
                    <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline tracking-wide uppercase">VIEW ALL</button>
                </div>
                <div className="flex flex-col gap-4">
                    {TRENDING_NEWS.map((item, i) => (
                        <div key={i} className="flex flex-col gap-1 cursor-pointer group">
                            <h4 className="font-bold text-[13px] text-gray-900 leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                <span>{item.readers}</span>
                                <span className="h-0.5 w-0.5 rounded-full bg-gray-300"></span>
                                <span>{item.time}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-500 text-[11px] tracking-widest">UPCOMING EVENTS</h3>
                    <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline tracking-wide">CALENDAR</button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center justify-center h-[50px] w-[50px] bg-[var(--color-primary)]/5 rounded-md text-[var(--color-primary)] shrink-0">
                            <span className="text-[19px] font-bold leading-none mb-0.5">24</span>
                            <span className="text-[9px] font-bold tracking-wide">OCT</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-[14px] text-gray-900">Design Meetup</h4>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                                <Clock className="h-3 w-3" />
                                10:00 AM • Downtown
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center justify-center h-[50px] w-[50px] bg-[var(--color-primary)]/5 rounded-md text-[var(--color-primary)] shrink-0">
                            <span className="text-[19px] font-bold leading-none mb-0.5">02</span>
                            <span className="text-[9px] font-bold tracking-wide">NOV</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-[14px] text-gray-900">Product Launch</h4>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                                <Video className="h-3 w-3" />
                                2:00 PM • Virtual
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Communities */}
            <Card className="p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-500 text-[11px] tracking-widest">COMMUNITIES</h3>
                </div>
                <div className="flex flex-col gap-4">
                    {COMMUNITIES.map((c) => (
                        <div key={c.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                    <c.icon className="h-5 w-5 text-current" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[14px] text-gray-900">{c.name}</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">{c.members} members</p>
                                </div>
                            </div>
                            <button className="h-[28px] px-4 rounded-full border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-50 bg-white transition-colors">
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </aside>
    );
};
