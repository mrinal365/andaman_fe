'use client';

import { useState } from 'react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { MOCK_NOTIFICATIONS } from '@/components/notifications/data';
import { cn } from '@/utils/cn';

export default function NotificationsPage() {
    const [filter, setFilter] = useState('All');
    const filters = ['All', 'Mentions', 'Feed', 'Communities', 'Messages', 'Events', 'System'];

    // Header logic: We want header fixed, list scrolling.

    return (
        <div className="w-full flex justify-center bg-[#FAFAFA] h-full">
            <div className="w-full bg-white border-x border-gray-200 h-full flex flex-col">

                {/* Header Section (Fixed) */}
                <div className="shrink-0 border-b border-gray-100 bg-white z-10">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
                        <button className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider">
                            Mark all as read
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="px-6 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3.5 py-1 rounded-full text-[12px] font-medium transition-all whitespace-nowrap",
                                    filter === f
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {MOCK_NOTIFICATIONS.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>

                    {/* Load More / End */}
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">End of notifications</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
