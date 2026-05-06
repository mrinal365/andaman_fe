import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/utils';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/features/userSlice';
import { socket } from '@/utils/socket';
import { TOKEN_KEY } from '@/constants';
import { toast } from 'react-toastify';

export const useLogout = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const logout = () => {
        try {
            // 1. Socket cleanup
            socket.emit('logout_user');
            socket.disconnect();

            // 2. Google OAuth logout (safe to call even if not logged in via Google)
            googleLogout();

            // 3. Local session cleanup
            deleteCookie(TOKEN_KEY);
            
            // 4. Redux state cleanup
            dispatch(logoutAction());

            // 5. Redirect and notify
            toast.success("Logged out successfully");
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback: still try to redirect to login
            deleteCookie(TOKEN_KEY);
            router.push('/login');
        }
    };

    return { logout };
};
