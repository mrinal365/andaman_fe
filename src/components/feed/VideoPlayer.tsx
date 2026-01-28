// // // // 'use client';

// // // // import { useEffect, useRef, useState } from 'react';

// // // // declare global {
// // // //     interface Window {
// // // //         YT: any;
// // // //         onYouTubeIframeAPIReady: () => void;
// // // //     }
// // // // }

// // // // function extractVideoId(url: string) {
// // // //     try {
// // // //         const u = new URL(url);
// // // //         return u.searchParams.get('v');
// // // //     } catch {
// // // //         return null;
// // // //     }
// // // // }

// // // // export function VideoPlayer({ url }: { url: string }) {
// // // //     const containerRef = useRef<HTMLDivElement>(null);
// // // //     const playerRef = useRef<any>(null);

// // // //     const [ready, setReady] = useState(false);
// // // //     const [playing, setPlaying] = useState(false);
// // // //     const [muted, setMuted] = useState(true);
// // // //     const [progress, setProgress] = useState(0);

// // // //     const videoId = extractVideoId(url);

// // // //     // Load YouTube API once
// // // //     useEffect(() => {
// // // //         if (!videoId || !containerRef.current) return;

// // // //         function createPlayer() {
// // // //             if (!containerRef.current) return;

// // // //             playerRef.current = new window.YT.Player(containerRef.current, {
// // // //                 videoId,
// // // //                 playerVars: {
// // // //                     controls: 0,
// // // //                     autoplay: 1,
// // // //                     mute: 1,
// // // //                     playsinline: 1,
// // // //                     modestbranding: 1,
// // // //                     rel: 0,
// // // //                 },
// // // //                 events: {
// // // //                     onReady: () => {
// // // //                         setReady(true);
// // // //                     },
// // // //                     onStateChange: (e: any) => {
// // // //                         setPlaying(e.data === window.YT.PlayerState.PLAYING);
// // // //                     },
// // // //                 },
// // // //             });
// // // //         }

// // // //         if (window.YT?.Player) {
// // // //             createPlayer();
// // // //         } else {
// // // //             if (!document.getElementById('yt-api')) {
// // // //                 const tag = document.createElement('script');
// // // //                 tag.id = 'yt-api';
// // // //                 tag.src = 'https://www.youtube.com/iframe_api';
// // // //                 document.body.appendChild(tag);
// // // //             }
// // // //             window.onYouTubeIframeAPIReady = createPlayer;
// // // //         }

// // // //         return () => {
// // // //             playerRef.current?.destroy();
// // // //             playerRef.current = null;
// // // //         };
// // // //     }, [videoId]);

// // // //     // Progress tracking
// // // //     useEffect(() => {
// // // //         if (!ready) return;

// // // //         const interval = setInterval(() => {
// // // //             if (!playerRef.current) return;
// // // //             const current = playerRef.current.getCurrentTime();
// // // //             const duration = playerRef.current.getDuration();
// // // //             if (duration) setProgress((current / duration) * 100);
// // // //         }, 300);

// // // //         return () => clearInterval(interval);
// // // //     }, [ready]);

// // // //     const togglePlay = () => {
// // // //         if (!playerRef.current) return;
// // // //         playing
// // // //             ? playerRef.current.pauseVideo()
// // // //             : playerRef.current.playVideo();
// // // //     };

// // // //     const toggleMute = () => {
// // // //         if (!playerRef.current) return;
// // // //         muted
// // // //             ? playerRef.current.unMute()
// // // //             : playerRef.current.mute();
// // // //         setMuted(!muted);
// // // //     };

// // // //     return (
// // // //         <div className="relative w-full h-[320px] bg-black rounded-xl overflow-hidden">
// // // //             {/* Player */}
// // // //             <div ref={containerRef} className="w-full h-full" />

// // // //             {/* Custom Controls */}
// // // //             <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
// // // //                 {/* Progress bar */}
// // // //                 <div className="w-full h-1 bg-white/30 rounded mb-3">
// // // //                     <div
// // // //                         className="h-full bg-white rounded"
// // // //                         style={{ width: `${progress}%` }}
// // // //                     />
// // // //                 </div>

// // // //                 {/* Buttons */}
// // // //                 <div className="flex items-center gap-4 pointer-events-auto">
// // // //                     <button
// // // //                         onClick={togglePlay}
// // // //                         className="px-3 py-1 bg-white/20 text-white rounded"
// // // //                     >
// // // //                         {playing ? 'Pause' : 'Play'}
// // // //                     </button>

// // // //                     <button
// // // //                         onClick={toggleMute}
// // // //                         className="px-3 py-1 bg-white/20 text-white rounded"
// // // //                     >
// // // //                         {muted ? 'Unmute' : 'Mute'}
// // // //                     </button>
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }



// // // 'use client';

// // // import { useEffect, useRef } from 'react';

// // // declare global {
// // //     interface Window {
// // //         YT: any;
// // //         onYouTubeIframeAPIReady: () => void;
// // //     }
// // // }

// // // function getVideoId(url: string) {
// // //     return new URL(url).searchParams.get('v');
// // // }

// // // export function VideoPlayer({ url }: { url: string }) {
// // //     const ref = useRef<HTMLDivElement>(null);
// // //     const player = useRef<any>(null);
// // //     const videoId = getVideoId(url);

// // //     useEffect(() => {
// // //         if (!videoId || !ref.current) return;

// // //         const createPlayer = () => {
// // //             player.current = new window.YT.Player(ref.current!, {
// // //                 videoId,
// // //                 host: 'https://www.youtube-nocookie.com',
// // //                 playerVars: {
// // //                     autoplay: 1,
// // //                     mute: 1,
// // //                     controls: 0,
// // //                     modestbranding: 1,
// // //                     rel: 0,
// // //                     fs: 0,
// // //                     iv_load_policy: 3,
// // //                     playsinline: 1,
// // //                     disablekb: 1,
// // //                 },
// // //             });
// // //         };

// // //         if (window.YT?.Player) {
// // //             createPlayer();
// // //         } else {
// // //             if (!document.getElementById('yt-api')) {
// // //                 const tag = document.createElement('script');
// // //                 tag.id = 'yt-api';
// // //                 tag.src = 'https://www.youtube.com/iframe_api';
// // //                 document.body.appendChild(tag);
// // //             }
// // //             window.onYouTubeIframeAPIReady = createPlayer;
// // //         }

// // //         return () => player.current?.destroy();
// // //     }, [videoId]);

// // //     return (
// // //         <div className="relative w-full h-[320px] bg-black overflow-hidden rounded-xl">
// // //             <div ref={ref} className="w-full h-full" />
// // //         </div>
// // //     );
// // // }



// // 'use client';

// // import { useEffect, useRef } from "react";
// // import videojs from "video.js";
// // import "video.js/dist/video-js.css";
// // import "videojs-youtube";

// // export function VideoPlayer({ url }: { url: string }) {
// //     const videoRef = useRef<HTMLVideoElement>(null);

// //     useEffect(() => {
// //         const player = videojs(videoRef.current!, {
// //             techOrder: ["youtube"],
// //             sources: [{ type: "video/youtube", src: url }],
// //             controls: true,
// //             autoplay: false,
// //             muted: true,
// //         });

// //         return () => {
// //             player.dispose();
// //         };
// //     }, [url]);

// //     return (
// //         <div data-vjs-player>
// //             <video ref={videoRef} className="video-js vjs-big-play-centered" />
// //         </div>
// //     );
// // }



// 'use client';

// import { useEffect, useRef } from 'react';
// import videojs from 'video.js';
// import 'video.js/dist/video-js.css';
// import 'videojs-youtube';

// export function VideoPlayer({ url }: { url: string }) {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const playerRef = useRef<videojs.Player | null>(null);
//     const containerRef = useRef<HTMLDivElement>(null);


//     // Initialize player ONCE
//     useEffect(() => {
//         if (!videoRef.current) return;

//         playerRef.current = videojs(videoRef.current, {
//             techOrder: ['youtube'],
//             sources: [{ type: 'video/youtube', src: url }],
//             controls: true,
//             autoplay: false, // IMPORTANT: we control this manually
//             muted: true,
//             preload: 'auto',
//             playsinline: true,
//         });

//         return () => {
//             playerRef.current?.dispose();
//             playerRef.current = null;
//         };
//     }, [url]);

//     // Intersection Observer (auto play / pause)
//     useEffect(() => {
//         if (!containerRef.current || !playerRef.current) return;

//         const observer = new IntersectionObserver(
//             ([entry]) => {
//                 const player = playerRef.current;
//                 if (!player) return;

//                 if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
//                     player.play().catch(() => { });
//                 } else {
//                     player.pause();
//                 }
//             },
//             {
//                 threshold: [0.4],
//             }
//         );

//         observer.observe(containerRef.current);

//         return () => observer.disconnect();
//     }, []);

//     return (
//         <div
//             ref={containerRef}
//             className="relative w-full h-[420px] rounded-xl overflow-hidden bg-black"
//         >
//             <video
//                 ref={videoRef}
//                 className="video-js vjs-fill vjs-big-play-centered"
//             />
//         </div>
//     );
// }



'use client';

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-youtube";

export function VideoPlayer({ url }: { url: string }) {
    const pathname = usePathname(); // 🔥 IMPORTANT
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // INIT PLAYER
    useEffect(() => {
        if (!videoRef.current) return;

        playerRef.current = videojs(videoRef.current, {
            techOrder: ["youtube"],
            sources: [{ type: "video/youtube", src: url }],
            controls: false,
            autoplay: false,
            muted: true,
            playsinline: true,
            preload: "auto",
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [pathname, url]); // 🔥 PATHNAME TRIGGERS FULL RESET

    // AUTOPLAY ON SCROLL
    useEffect(() => {
        if (!containerRef.current || !playerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!playerRef.current) return;

                if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                    playerRef.current.play();
                } else {
                    playerRef.current.pause();
                }
            },
            { threshold: [0.3, 0.6] }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [pathname]);

    return (
        <div
            key={pathname} // 🔥 HARD RESET DOM
            ref={containerRef}
            className="relative w-full h-[320px] bg-black rounded-xl overflow-hidden"
        >
            <video
                ref={videoRef}
                className="video-js vjs-fill vjs-big-play-centered"
            />
        </div>
    );
}
