import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from '@/config';
import { TOKEN_KEY } from './constants';
import { getCookie } from './utils';

// Define public paths that don't require authentication
const publicPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    const token = request.cookies.get(TOKEN_KEY)?.value;

    // Handle root path (/)
    if (pathname === '/') {
        return NextResponse.redirect(new URL(token ? '/feed' : '/login', request.url));
    }

    // 1. If user is on a public path (login/signup) and HAS a token, redirect to feed
    if (publicPaths.some(path => pathname.startsWith(path))) {
        if (token) {
            return NextResponse.redirect(new URL('/feed', request.url));
        }
        return NextResponse.next();
    }

    // 2. If user is NOT on a public path and has NO token, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login?error=session_expired', request.url));
    }

    try {
        // Validate token with API
        const response = await fetch(`${appConfig.api.baseUrl}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Token validation failed');
        }

        // Token is valid, proceed
        return NextResponse.next();
    } catch (error) {
        // API Check failed, redirect to login
        const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url));
        // Clear invalid cookie using the correct key
        response.cookies.delete(TOKEN_KEY);
        return response;
    }
}

// Matcher configuration
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
