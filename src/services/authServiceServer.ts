import { config } from '@/config';

export async function getMeSSR(token: string) {
    const res = await fetch(`${config.api.baseUrl}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Unauthorized');
    }

    return res.json();
}
