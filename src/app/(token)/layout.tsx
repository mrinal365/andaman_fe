// import { config } from '@/config';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function TokenLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const cookieStore = await cookies();   // ✅ IMPORTANT
//     const token = cookieStore.get('token')?.value;

//     if (!token) {
//         redirect('/login');
//     }

//     // const res = await fetch(`${config.api.baseUrl}/auth/me`, {
//     //     headers: {
//     //         Authorization: `Bearer ${token}`,
//     //     },
//     //     cache: 'no-store',
//     // });

//     if (!res.ok) {
//         redirect('/login?error=session_expired');
//     }

//     return <>{children}</>;
// }



import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMeSSR } from '@/services/authServiceServer';

export default async function TokenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const isValid = await getMeSSR(token);

    if (!isValid) {
        redirect('/login?error=session_expired');
    }

    return <>{children}</>;
}
