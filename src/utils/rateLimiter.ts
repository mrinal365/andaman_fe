/**
 * Rate Limiter Module
 * 
 * A reusable, client-side rate limiting utility with device fingerprinting.
 * Can be used for any action that needs throttling (signup, login, API calls, etc).
 * 
 * Usage:
 *   const signupLimiter = createRateLimiter({ action: 'signup', maxAttempts: 3, windowMs: 60 * 60 * 1000 });
 *   const result = signupLimiter.check();
 *   if (!result.allowed) { // blocked }
 *   signupLimiter.record(); // after successful action
 */

// ─── Device Fingerprint ──────────────────────────────────────────────────────

/**
 * Generates a semi-stable device fingerprint by hashing multiple browser signals.
 * Not cryptographically secure, but sufficient to identify repeat visitors
 * across sessions and incognito mode (same device).
 */
export function getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server';

    const signals: string[] = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        String(navigator.hardwareConcurrency || ''),
        String((navigator as any).deviceMemory || ''),
        String(screen.width),
        String(screen.height),
        String(screen.colorDepth),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Canvas fingerprint — renders text and extracts a hash
        getCanvasFingerprint(),
    ];

    return simpleHash(signals.join('|'));
}

function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('fingerprint', 4, 17);

        return canvas.toDataURL().slice(-50);
    } catch {
        return 'canvas-error';
    }
}

/**
 * Simple non-crypto hash (djb2 variant). Fast and deterministic.
 */
function simpleHash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit int
    }
    return Math.abs(hash).toString(36);
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

const STORAGE_PREFIX = '_rl_';

interface StoredData {
    timestamps: number[];
    fp: string;
}

function encode(data: StoredData): string {
    try {
        return btoa(JSON.stringify(data));
    } catch {
        return '';
    }
}

function decode(raw: string): StoredData | null {
    try {
        return JSON.parse(atob(raw));
    } catch {
        return null;
    }
}

function getStorageKey(action: string): string {
    return `${STORAGE_PREFIX}${action}`;
}

function loadData(action: string): StoredData {
    if (typeof window === 'undefined') {
        return { timestamps: [], fp: 'server' };
    }

    const key = getStorageKey(action);
    const raw = localStorage.getItem(key);
    if (!raw) {
        return { timestamps: [], fp: getDeviceFingerprint() };
    }

    const data = decode(raw);
    if (!data) {
        return { timestamps: [], fp: getDeviceFingerprint() };
    }

    return data;
}

function saveData(action: string, data: StoredData): void {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(action);
    localStorage.setItem(key, encode(data));
}

// ─── Rate Limiter Factory ────────────────────────────────────────────────────

export interface RateLimitConfig {
    /** Unique identifier for the action being rate-limited (e.g. 'signup', 'login') */
    action: string;
    /** Maximum allowed attempts within the time window */
    maxAttempts: number;
    /** Time window in milliseconds (e.g. 3600000 for 1 hour) */
    windowMs: number;
}

export interface RateLimitResult {
    /** Whether the action is currently allowed */
    allowed: boolean;
    /** How many attempts remain in the current window */
    remainingAttempts: number;
    /** Milliseconds until the oldest attempt expires (0 if allowed) */
    retryAfterMs: number;
    /** The device fingerprint used */
    fingerprint: string;
}

export interface RateLimiter {
    /** Check if the action is currently allowed */
    check: () => RateLimitResult;
    /** Record a successful action (call after the action completes) */
    record: () => void;
    /** Reset all tracked data for this action */
    reset: () => void;
    /** Get the device fingerprint */
    getFingerprint: () => string;
}

/**
 * Creates a rate limiter instance for a specific action.
 * 
 * @example
 * const limiter = createRateLimiter({ action: 'signup', maxAttempts: 3, windowMs: 3600000 });
 * 
 * // Before performing action:
 * const { allowed, remainingAttempts, retryAfterMs } = limiter.check();
 * if (!allowed) {
 *   console.log(`Blocked. Try again in ${Math.ceil(retryAfterMs / 1000)}s`);
 *   return;
 * }
 * 
 * // After successful action:
 * limiter.record();
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
    const { action, maxAttempts, windowMs } = config;

    function getRelevantTimestamps(): number[] {
        const data = loadData(action);
        const now = Date.now();
        const cutoff = now - windowMs;
        // Only keep timestamps within the active window
        return data.timestamps.filter(ts => ts > cutoff);
    }

    function check(): RateLimitResult {
        const fingerprint = getDeviceFingerprint();
        const relevant = getRelevantTimestamps();
        const allowed = relevant.length < maxAttempts;
        const remainingAttempts = Math.max(0, maxAttempts - relevant.length);

        let retryAfterMs = 0;
        if (!allowed && relevant.length > 0) {
            // Time until the oldest relevant timestamp expires
            const oldestInWindow = Math.min(...relevant);
            retryAfterMs = Math.max(0, (oldestInWindow + windowMs) - Date.now());
        }

        return { allowed, remainingAttempts, retryAfterMs, fingerprint };
    }

    function record(): void {
        const data = loadData(action);
        const now = Date.now();
        const cutoff = now - windowMs;
        // Clean up old entries and add new one
        data.timestamps = data.timestamps.filter(ts => ts > cutoff);
        data.timestamps.push(now);
        data.fp = getDeviceFingerprint();
        saveData(action, data);
    }

    function reset(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(getStorageKey(action));
    }

    function getFingerprint(): string {
        return getDeviceFingerprint();
    }

    return { check, record, reset, getFingerprint };
}

// ─── Pre-configured Limiters ─────────────────────────────────────────────────

/** Rate limiter for signup: max 3 accounts per hour per device */
export const signupRateLimiter = createRateLimiter({
    action: 'signup',
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
});

/** Rate limiter for login: max 5 failed attempts per 30 minutes */
export const loginRateLimiter = createRateLimiter({
    action: 'login_fail',
    maxAttempts: 5,
    windowMs: 30 * 60 * 1000, // 30 minutes
});
