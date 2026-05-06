'use client';

import React from 'react';
import { Card } from '@/components/common/Card';
import { ComingSoonPoster } from '@/components/common/ComingSoonPoster';
import { chatConfig } from '@/config/chatConfig';
import { Clock, Video } from 'lucide-react';

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

export const NewsWidget = () => (
    <Card className="p-5 bg-white">
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">Trending News</h3>
            {!chatConfig.comingSoon.news && (
                <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline tracking-wide uppercase">VIEW ALL</button>
            )}
        </div>
        {chatConfig.comingSoon.news ? (
            <ComingSoonPoster 
                compact 
                title="News Coming Soon" 
                description="Stay updated with the latest island news." 
            />
        ) : (
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
        )}
    </Card>
);

export const EventsWidget = () => (
    <Card className="p-5 bg-white">
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">UPCOMING EVENTS</h3>
            {!chatConfig.comingSoon.upcomingEvents && (
                <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline tracking-wide">CALENDAR</button>
            )}
        </div>
        {chatConfig.comingSoon.upcomingEvents ? (
            <ComingSoonPoster 
                compact 
                title="Events Coming Soon" 
                description="Exciting island events are on the horizon." 
            />
        ) : (
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
        )}
    </Card>
);
