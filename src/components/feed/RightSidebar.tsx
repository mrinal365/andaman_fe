import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ChevronDown, Video, Clock, Layout, Coffee, Leaf } from 'lucide-react';
import Image from 'next/image';

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
    return (
        <aside className="sticky top-0 h-screen w-[320px] flex flex-col gap-5 overflow-y-auto no-scrollbar pt-6 pb-10">
            {/* Profile Snippet */}
            <Card className="flex items-center gap-3 rounded-xl py-2.5 px-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 bg-white" padding="none">
                <Avatar src="https://i.pravatar.cc/150?u=jane" size="md" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[14px] text-gray-900 leading-tight">Jane Doe</h4>
                    <p className="text-[12px] text-gray-400 font-medium">@janedoe</p>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400 stroke-[1.5]" />
            </Card>

            {/* Discovery -> Trending Communities */}
            <Card className="p-5 bg-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">Trending News</h3>
                    <button className="text-[10px] font-bold text-[#B91C1C] hover:underline tracking-wide uppercase">VIEW ALL</button>
                </div>
                <div className="flex flex-col gap-4">
                    {TRENDING_NEWS.map((item, i) => (
                        <div key={i} className="flex flex-col gap-1 cursor-pointer group">
                            <h4 className="font-bold text-[13px] text-gray-900 leading-snug group-hover:text-[#B91C1C] transition-colors line-clamp-2">{item.title}</h4>
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
                    <button className="text-[10px] font-bold text-[#B91C1C] hover:underline tracking-wide">CALENDAR</button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center justify-center h-[50px] w-[50px] bg-[#FEF2F2] rounded-md text-[#9d0208] shrink-0">
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
                        <div className="flex flex-col items-center justify-center h-[50px] w-[50px] bg-[#FEF2F2] rounded-md text-[#9d0208] shrink-0">
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
                                <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                    <c.icon className={`h-5 w-5 ${c.name === 'Minimalist Living' ? 'text-slate-600' : 'text-current'}`} />
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

            <div className="text-[10px] text-gray-300 text-center pb-4 font-medium tracking-wide">
                © 2024 BloodRedFeed Inc.
            </div>
        </aside>
    );
};
