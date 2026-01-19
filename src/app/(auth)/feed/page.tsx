import { CreatePost } from '@/components/feed/CreatePost';
import { FeedPost } from '@/components/feed/FeedPost';
import { RightSidebar } from '@/components/feed/RightSidebar';
import { StoryReel } from '@/components/feed/StoryReel';

const POSTS = [
    {
        author: {
            name: "Mark Wilson",
            avatar: "https://i.pravatar.cc/150?u=mark",
            time: "2h",
            location: "Kyoto, Japan",
            verified: true
        },
        content: {
            text: "Just arrived in Kyoto for a weekend getaway. The architecture here is simply breathtaking. Can't wait to explore more temples tomorrow! 🏯✨",
            // 3 Image Grid (Shows 2 + 1)
            images: [
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1528360983277-13d9b151434c?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000&auto=format&fit=crop"
            ],
            tag: 'update' as const,
            likes: "1.2k",
            comments: "45",
            views: "8.5k",
            commentsList: [
                { user: "anna_j", text: "The colors in this photo are amazing! 📸" },
                { user: "travel_mike", text: "Enjoy Kyoto! Make sure to visit Fushimi Inari." }
            ]
        }
    },
    {
        author: {
            name: "Sarah Jenkins",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            time: "5h",
            location: ""
        },
        content: {
            text: "Finally finished my new minimalist workspace setup. Less clutter = more focus. What do you think? 🖥️",
            // 2 Image Grid
            images: [
                "https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1486946255434-2466348c2166?q=80&w=1000&auto=format&fit=crop"
            ],
            tag: 'guide' as const,
            likes: "856",
            comments: "124",
            views: "5.2k",
            commentsList: [
                { user: "dev_tom", text: "Clean setup! Is that a 32-inch monitor?" }
            ]
        }
    },
    {
        author: {
            name: "Alex Chen",
            avatar: "https://i.pravatar.cc/150?u=alex",
            time: "8h",
            location: "",
            verified: true
        },
        content: {
            text: "Just announced: The annual Tech Design Conference 2024 is happening this October in San Francisco! Who else is going? 🎟️ #Design2024 #Tech",
            image: "",
            tag: 'news' as const,
            likes: "2.3k",
            comments: "342",
            views: "12k",
            commentsList: [
                { user: "design_guru", text: "Already got my tickets! Can't wait." }
            ]
        }
    },
    {
        author: {
            name: "Minimalist Daily",
            avatar: "https://i.pravatar.cc/150?u=minimal",
            time: "12h",
            location: ""
        },
        content: {
            text: "5 habits to improve your productivity instantly: \n1. Plan your day the night before 📝\n2. Use the pomodoro technique ⏱️\n3. Declutter your digital space 🗑️\n4. Take regular breaks ☕\n5. Drink more water 💧",
            // 4 Image Grid
            images: [
                "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop"
            ],
            tag: 'post' as const,
            likes: "5.1k",
            comments: "208",
            views: "25k",
            commentsList: []
        }
    },
    {
        author: {
            name: "Elena Rodriguez",
            avatar: "https://i.pravatar.cc/150?u=elena",
            time: "1d",
            location: "Barcelona, Spain"
        },
        content: {
            text: "Golden hour in Barcelona. Does it get any better than this? 🌅🍷 #Travel #Spain #Sunset",
            // 5 Image Grid (Shows 4 + 1)
            images: [
                "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop"
            ],
            tag: 'ad' as const,
            likes: "3.4k",
            comments: "92",
            views: "15k",
            commentsList: [
                { user: "maria_s", text: "Que bonita! Miss you! ❤️" }
            ]
        }
    }
];

export default function FeedPage() {
    return (
        <>
            {/* Main Feed */}
            <main className="flex-1 flex flex-col gap-4 max-w-[740px] mx-auto w-full pt-14 md:pt-4 pb-20 md:pb-0 h-full overflow-y-auto no-scrollbar px-3 md:px-0">
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
