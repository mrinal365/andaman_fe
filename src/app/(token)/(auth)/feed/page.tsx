import { CreatePost } from '@/components/feed/CreatePost';
import { FeedPost } from '@/components/feed/FeedPost';
import { RightSidebar } from '@/components/feed/RightSidebar';
import { StoryReel } from '@/components/feed/StoryReel';

const POSTS = [
    {
        author: {
            name: "Rohan Mehta",
            avatar: "https://i.pravatar.cc/150?u=rohan",
            time: "1h",
            location: "Havelock Island, Andaman",
            verified: true
        },
        content: {
            text: "First morning in Havelock 🌊 The water is unreal and the silence hits different. This is exactly the reset I needed.",
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            ],
            tag: "update" as const,
            likes: "1.8k",
            comments: "62",
            views: "9.4k",
            commentsList: [
                { user: "travel_anu", text: "Havelock is pure magic 😍" }
            ]
        }
    },
    {
        author: {
            name: "Ananya Kapoor",
            avatar: "https://i.pravatar.cc/150?u=ananya",
            time: "3h",
            location: "Radhanagar Beach"
        },
        content: {
            text: "Sunset at Radhanagar Beach never disappoints 🌅 Easily one of the most peaceful places I’ve been to.",
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                "https://images.unsplash.com/photo-1493558103817-58b2924bce98"
            ],
            tag: "post" as const,
            likes: "2.2k",
            comments: "104",
            views: "11k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Andaman Explorer",
            avatar: "https://i.pravatar.cc/150?u=andaman",
            time: "5h",
            location: "",
            verified: true
        },
        content: {
            text: "Top 5 beaches to visit in Andaman 🏝️\n1. Radhanagar\n2. Elephant Beach\n3. Kalapathar\n4. Laxmanpur\n5. Corbyn’s Cove",
            images: [
                "https://images.unsplash.com/photo-1510414696678-2415ad8474aa",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                "https://images.unsplash.com/photo-1493558103817-58b2924bce98"
            ],
            tag: "guide" as const,
            likes: "4.6k",
            comments: "211",
            views: "23k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Kunal Verma",
            avatar: "https://i.pravatar.cc/150?u=kunal",
            time: "7h",
            location: "Neil Island"
        },
        content: {
            text: "Neil Island feels slower, quieter, and more personal. If you want calm over crowds — this is it.",
            images: [
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            ],
            tag: "update" as const,
            likes: "1.1k",
            comments: "38",
            views: "6.8k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Island Diaries",
            avatar: "https://i.pravatar.cc/150?u=island",
            time: "9h",
            location: "",
            verified: true
        },
        content: {
            text: "Scuba diving in Andaman is beginner-friendly and unforgettable 🤿 Clear visibility, colorful reefs, and calm waters.",
            images: [
                "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
                "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1"
            ],
            tag: "guide" as const,
            likes: "3.9k",
            comments: "189",
            views: "18k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Megha Iyer",
            avatar: "https://i.pravatar.cc/150?u=megha",
            time: "11h",
            location: "Port Blair"
        },
        content: {
            text: "Visited Cellular Jail today. Heavy place, important history. The light & sound show is a must.",
            image: "",
            tag: "post" as const,
            likes: "2.7k",
            comments: "96",
            views: "14k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Travel With Arjun",
            avatar: "https://i.pravatar.cc/150?u=arjun",
            time: "13h",
            location: "",
            verified: true
        },
        content: {
            text: "Best time to visit Andaman? ☀️\nOctober to May — calm seas, perfect weather, best for water sports.",
            images: [
                "https://images.unsplash.com/photo-1510414696678-2415ad8474aa",
                "https://images.unsplash.com/photo-1493558103817-58b2924bce98"
            ],
            tag: "guide" as const,
            likes: "5.2k",
            comments: "244",
            views: "28k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Sneha Roy",
            avatar: "https://i.pravatar.cc/150?u=sneha",
            time: "16h",
            location: "Kalapathar Beach"
        },
        content: {
            text: "Early morning walks at Kalapathar Beach hit different 🖤 Quiet roads, waves, and no crowd.",
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            ],
            tag: "update" as const,
            likes: "980",
            comments: "27",
            views: "4.9k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Andaman Food Trails",
            avatar: "https://i.pravatar.cc/150?u=food",
            time: "18h",
            location: "",
            verified: true
        },
        content: {
            text: "Must-try food in Andaman 🍤 Fresh seafood, coconut curries, grilled fish by the beach.",
            images: [
                "https://images.unsplash.com/photo-1553621042-f6e147245754",
                "https://images.unsplash.com/photo-1553621042-f6e147245754"
            ],
            tag: "post" as const,
            likes: "2.9k",
            comments: "143",
            views: "12k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Rahul Singh",
            avatar: "https://i.pravatar.cc/150?u=rahul",
            time: "20h",
            location: "Elephant Beach"
        },
        content: {
            text: "Snorkeling at Elephant Beach 🐠 Clear water, easy access, perfect for first-timers.",
            images: [
                "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
                "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1"
            ],
            tag: "update" as const,
            likes: "1.6k",
            comments: "58",
            views: "7.3k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Island Stays",
            avatar: "https://i.pravatar.cc/150?u=stay",
            time: "22h",
            location: "",
            verified: true
        },
        content: {
            text: "Beachside stays in Andaman range from budget huts to luxury resorts 🌴 Choose based on island, not price.",
            images: [
                "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            ],
            tag: "ad" as const,
            likes: "3.3k",
            comments: "81",
            views: "16k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Pooja Malhotra",
            avatar: "https://i.pravatar.cc/150?u=pooja",
            time: "1d",
            location: "Neil Island"
        },
        content: {
            text: "Watched the stars last night with zero light pollution ✨ Andaman nights are underrated.",
            image: "",
            tag: "post" as const,
            likes: "1.2k",
            comments: "33",
            views: "6.1k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Andaman Updates",
            avatar: "https://i.pravatar.cc/150?u=news",
            time: "1d",
            location: "",
            verified: true
        },
        content: {
            text: "New ferry schedules announced between Port Blair, Havelock & Neil Island 🚢 Travel planning just got easier.",
            image: "",
            tag: "news" as const,
            likes: "4.1k",
            comments: "198",
            views: "21k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Vikram Joshi",
            avatar: "https://i.pravatar.cc/150?u=vikram",
            time: "2d",
            location: "Corbyn’s Cove"
        },
        content: {
            text: "Last evening in Andaman 💙 Leaving with a calmer mind and a full camera roll.",
            images: [
                "https://images.unsplash.com/photo-1510414696678-2415ad8474aa"
            ],
            tag: "update" as const,
            likes: "2.4k",
            comments: "71",
            views: "10k",
            commentsList: []
        }
    }
];


export default function FeedPage() {
    return (
        <>
            {/* Main Feed */}
            <main className="flex-1 outline-none flex flex-col gap-4 max-w-[740px] mx-auto w-full pt-14 md:pt-4 pb-20 md:pb-0 h-full overflow-y-auto no-scrollbar px-3 md:px-0">
                <StoryReel />

                <div className="flex flex-col gap-4 pb-10">
                    {POSTS.map((post, i) => (
                        <FeedPost key={i} {...post} />
                    ))}
                </div>
            </main>

            {/* Right Widgets */}
            <div className="hidden xl:block w-[380px] shrink-0 h-full">
                <RightSidebar />
            </div>
        </>
    );
}
