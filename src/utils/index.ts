import { TOKEN_KEY } from "@/constants";

export const isValidEmail = (email: string): boolean => {
    if (!email) {
        return false
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

export const setCookie = (name: string, value: string, days = 7) => {
    if (typeof window === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const deleteCookie = (name: string) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

export const getTagStyles = (tag?: string) => {
    switch (tag) {
        case 'ad': return 'bg-amber-50 text-amber-600 border-amber-100';
        default: return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20';
    }
};

// export const setAuthCookie = (token: string) => {
//     setCookie(TOKEN_KEY, token, 7);
// };

// export const getAuthCookie = () => {
//     console.log("getcookie", getCookie(TOKEN_KEY))
//     return getCookie(TOKEN_KEY);
// };

// export const deleteAuthCookie = () => {
//     deleteCookie(TOKEN_KEY);
// };

// utils/image.ts
export const getImageUrl = (
    path: string,
    options?: { w?: number; q?: number }
) => {
    const base = process.env.NEXT_PUBLIC_IMAGEKIT_URL;

    const transformations = [
        options?.w ? `w-${options.w}` : null,
        options?.q ? `q-${options.q}` : null,
        "f-webp"
    ]
        .filter(Boolean)
        .join(",");

    return `${base}/${path}?tr=${transformations}`;
};


