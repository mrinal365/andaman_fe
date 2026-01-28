import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from '@/config';

// Define public paths that don't require authentication
const publicPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    console.log("middleware wexcectired")
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Get token from cookies (assuming 'token' is the cookie name)
    const token = request.cookies.get('token')?.value;

    if (!token) {
        // No token found, redirect to login
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
        // Optional: Clear invalid cookie
        response.cookies.delete('token');
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
