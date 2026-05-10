'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import {
    Bell,
    Compass,
    BookOpen,
    Home,
    MessageSquare,
    Users,
    Waves,
    PenTool,
    Cloud,
    Plus,
    X,
    ImagePlus,
    Loader2,
    Newspaper,
    Map,
    Info,
    Bookmark,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPost } from '@/services/feedService';
import { addPostOptimistic } from '@/store/features/postSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getWeatherForLocation } from '@/services/weatherService';
import { RootState } from '@/store/store';
import { chatConfig } from '@/config/chatConfig';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

export const Sidebar = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const user = useAppSelector((state: RootState) => state.user.user);
    const { unreadCount, unreadMessages } = useAppSelector((state: RootState) => state.notifications);

    const [weather, setWeather] = useState<any>(null);
    const [hoveredDay, setHoveredDay] = useState<any>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

    const MENU_ITEMS = [
        { icon: Home, label: 'Feed', route: '/feed' },
        { icon: MessageSquare, label: 'Messages', route: '/messages', badge: unreadMessages },
        { icon: Bookmark, label: 'Saved', route: '/saved' },
        { icon: User, label: 'My Profile', route: user?.handle ? `/u/${user.handle}` : '/login' },
        { icon: Users, label: 'Communities', route: '/communities', comingSoon: chatConfig.comingSoon.communities },
        { icon: Bell, label: 'Notifications', route: '/notifications', badge: unreadCount },
    ];


    useEffect(() => {
        getWeatherForLocation("69e661e45acdd0d8c0787b50")
            .then((res) => {
                setWeather(res);
            })
            .catch((error) => {
                console.error("Failed to get weather", error);
            });
    }, []);

    return (
        <aside className="sticky top-0 h-screen w-[260px] flex flex-col gap-6 overflow-y-auto no-scrollbar py-6">
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center">
                    <img src="/logo.png" alt="Explore.baby" className="h-full w-full object-contain" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">Explore.baby</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.route;
                    const baseClasses = "inline-flex items-center justify-start gap-4 px-6 text-[15px] font-semibold tracking-normal rounded-xl transition-colors focus-visible:outline-none w-full h-[46px]";
                    const variantClasses = isActive
                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50';

                    return (
                        <Link
                            key={item.label}
                            href={item.route}
                            className={`${baseClasses} ${variantClasses} justify-between pr-4`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                                {item.label}
                            </div>
                            {(item.badge ?? 0) > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {item.badge! > 50 ? '50+' : item.badge}
                                </span>
                            )}
                            {(item as any).comingSoon && (
                                <span className="flex h-4 px-1.5 items-center justify-center rounded-md bg-blue-500/10 text-[9px] font-black text-blue-500 uppercase tracking-tighter border border-blue-500/20">
                                    Soon
                                </span>
                            )}

                        </Link>
                    );
                })}
            </nav>



            {/* New Post Button */}
            <Button variant="primary" className="mt-auto w-full gap-2 rounded-xl h-[44px] shrink-0" onClick={() => setIsPostModalOpen(true)}>
                <Plus className="h-5 w-5 stroke-[3]" />
                <span className="text-[14px] font-bold tracking-wide">New Post</span>
            </Button>

            {/* Weather Widget (Bottom Left in design) */}
            <Card className="bg-[#F8F9FA]/60 border-0 shadow-none border-[1px] border-gray-200 border shrink-0 overflow-visible" padding="md">
                {weather ? (
                    <>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-[17px] text-gray-900 leading-none">{weather.location.name}</h3>
                                <p className="text-[11px] font-medium text-gray-400 mt-1 capitalize">
                                    {weather.forecast[0]?.description || 'N/A'}
                                </p>
                            </div>
                            {weather.forecast[0]?.icon && (
                                <img
                                    src={`https://openweathermap.org/img/wn/${weather.forecast[0].icon}@2x.png`}
                                    alt={weather.forecast[0].description}
                                    className="h-10 w-10 -mt-1"
                                />
                            )}
                        </div>
                        <div className="text-[32px] font-bold text-gray-900 mb-6 tracking-tight">
                            {Math.round(weather.forecast[0]?.avgTemp ?? 0)}°C
                        </div>

                        <div className="flex justify-between text-center gap-2">
                            {weather.forecast.slice(0, 5).map((day: any) => {
                                const dayLabel = new Date(day.date + 'T00:00:00')
                                    .toLocaleDateString('en-US', { weekday: 'short' })
                                    .toUpperCase();
                                return (
                                    <div
                                        key={day.date}
                                        className="flex flex-col items-center gap-1.5 cursor-pointer"
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const tooltipW = 170;
                                            let left = rect.left + rect.width / 2 - tooltipW / 2;
                                            // clamp so it doesn't overflow viewport
                                            left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));
                                            setTooltipPos({ top: rect.top - 8, left });
                                            setHoveredDay(day);
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredDay(null);
                                            setTooltipPos(null);
                                        }}
                                    >
                                        <span className="text-[9px] font-bold text-gray-400 tracking-wider">{dayLabel}</span>
                                        <img
                                            src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                            alt={day.description}
                                            className="h-6 w-6"
                                        />
                                        <span className="text-[10px] font-bold text-gray-600">
                                            {Math.round(day.avgTemp)}°
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {hoveredDay && tooltipPos && createPortal(
                            <div
                                className="fixed z-[99999] pointer-events-none"
                                style={{
                                    top: tooltipPos.top,
                                    left: tooltipPos.left,
                                    width: 170,
                                    transform: 'translateY(-100%)',
                                }}
                            >
                                <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 shadow-xl text-left">
                                    <p className="text-[11px] font-semibold text-white capitalize mb-2">{hoveredDay.description}</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-400">High / Low</span>
                                            <span className="text-[10px] font-semibold text-white">{Math.round(hoveredDay.maxTemp)}° / {Math.round(hoveredDay.minTemp)}°</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-400">Feels like</span>
                                            <span className="text-[10px] font-semibold text-white">{Math.round(hoveredDay.avgFeelsLike)}°</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-400">Humidity</span>
                                            <span className="text-[10px] font-semibold text-white">{Math.round(hoveredDay.avgHumidity)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-400">Wind</span>
                                            <span className="text-[10px] font-semibold text-white">{hoveredDay.avgWindSpeed} m/s</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Arrow pointing down */}
                                <div className="mx-auto w-2.5 h-2.5 bg-gray-900/95 rotate-45 -mt-[6px]"></div>
                            </div>,
                            document.body
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center py-4">
                        <span className="text-[12px] text-gray-400">Loading weather...</span>
                    </div>
                )}
            </Card>

            {/* New Post Modal */}
            <CreatePostModal 
                isOpen={isPostModalOpen} 
                onClose={() => setIsPostModalOpen(false)} 
            />
        </aside>
    );
};
