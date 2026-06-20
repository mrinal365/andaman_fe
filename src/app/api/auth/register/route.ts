/**
 * Server-side Rate-Limited Signup Proxy
 * 
 * This Next.js Route Handler sits between the frontend signup form and the
 * real backend. It enforces rate limiting based on IP + device fingerprint,
 * validates inputs, and detects bot submissions via honeypot fields.
 * 
 * Rate limit: 3 signups per IP+fingerprint combination per hour.
 */

import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from '@/config';

// ─── In-Memory Rate Limit Store ──────────────────────────────────────────────
// Key: composite of IP + fingerprint
// Value: array of signup timestamps (epoch ms)

const rateLimitStore = new Map<string, number[]>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Cleans up expired entries from the store periodically.
 * Runs on every request but only removes stale data.
 */
function cleanupStore(): void {
    const now = Date.now();
    const cutoff = now - RATE_LIMIT_WINDOW_MS;

    for (const [key, timestamps] of rateLimitStore.entries()) {
        const valid = timestamps.filter(ts => ts > cutoff);
        if (valid.length === 0) {
            rateLimitStore.delete(key);
        } else {
            rateLimitStore.set(key, valid);
        }
    }
}

/**
 * Extract client IP from request headers.
 * Vercel / reverse proxies set x-forwarded-for.
 */
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        // x-forwarded-for can be comma-separated; first one is the client
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP.trim();
    return 'unknown';
}

/**
 * Basic email format validation (server-side check).
 */
function isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // Clean up old entries
        cleanupStore();

        // Parse body
        let body: Record<string, any>;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: 'Invalid request body' },
                { status: 400 }
            );
        }

        // ── Honeypot check ──
        // If the hidden "website" field has a value, it's likely a bot
        if (body.website) {
            // Return a fake success to not tip off the bot
            return NextResponse.json(
                { message: 'Account created successfully', token: 'ok' },
                { status: 200 }
            );
        }
        // Remove honeypot field before forwarding
        delete body.website;

        // ── Basic Input Validation ──
        const { name, email, password, handle } = body;

        if (!name || !email || !password || !handle) {
            return NextResponse.json(
                { message: 'All fields are required (name, email, password, handle)' },
                { status: 400 }
            );
        }

        if (typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { message: 'Name must be at least 2 characters' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { message: 'Invalid email address' },
                { status: 400 }
            );
        }

        if (typeof password !== 'string' || password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        if (typeof handle !== 'string' || handle.length < 3 || !/^[a-zA-Z0-9_]+$/.test(handle)) {
            return NextResponse.json(
                { message: 'Handle must be 3+ chars with only letters, numbers, and underscores' },
                { status: 400 }
            );
        }

        // ── Rate Limiting ──
        const clientIP = getClientIP(request);
        const fingerprint = request.headers.get('x-device-fingerprint') || 'no-fp';
        const compositeKey = `${clientIP}:${fingerprint}`;

        const now = Date.now();
        const cutoff = now - RATE_LIMIT_WINDOW_MS;

        const existingTimestamps = rateLimitStore.get(compositeKey) || [];
        const recentTimestamps = existingTimestamps.filter(ts => ts > cutoff);

        if (recentTimestamps.length >= RATE_LIMIT_MAX) {
            // Calculate when the oldest entry expires
            const oldestTimestamp = Math.min(...recentTimestamps);
            const retryAfterSeconds = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);

            return NextResponse.json(
                {
                    message: 'Too many account creation attempts. Please try again later.',
                    retryAfter: retryAfterSeconds,
                    code: 'RATE_LIMITED',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSeconds),
                    },
                }
            );
        }

        // Also check IP-only (without fingerprint) to catch fingerprint spoofing
        const ipOnlyKey = `ip:${clientIP}`;
        const ipTimestamps = rateLimitStore.get(ipOnlyKey) || [];
        const recentIPTimestamps = ipTimestamps.filter(ts => ts > cutoff);

        if (recentIPTimestamps.length >= RATE_LIMIT_MAX) {
            const oldestTimestamp = Math.min(...recentIPTimestamps);
            const retryAfterSeconds = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);

            return NextResponse.json(
                {
                    message: 'Too many account creation attempts from this network. Please try again later.',
                    retryAfter: retryAfterSeconds,
                    code: 'RATE_LIMITED',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSeconds),
                    },
                }
            );
        }

        // ── Forward to Real Backend ──
        const backendUrl = `${appConfig.api.baseUrl}/auth/register`;

        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, handle: handle.trim() }),
        });

        const responseData = await backendResponse.json();

        if (backendResponse.ok) {
            // Record successful signup for rate limiting
            recentTimestamps.push(now);
            rateLimitStore.set(compositeKey, recentTimestamps);

            recentIPTimestamps.push(now);
            rateLimitStore.set(ipOnlyKey, recentIPTimestamps);
        }

        return NextResponse.json(responseData, { status: backendResponse.status });
    } catch (error: any) {
        console.error('[Signup Proxy Error]', error);
        return NextResponse.json(
            { message: 'Internal server error. Please try again.' },
            { status: 500 }
        );
    }
}
