'use client'

import Loader from "@/components/common/Loading";
import { getCurrentUser } from "@/services/authService";
import { logout as logoutAction, updateUserInfo } from "@/store/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { User } from "../../../types/user";
import { RootState } from "@/store/store";
import { AlertCircle, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

export default function TokenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.user.user);
    const { logout } = useLogout();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((res: any) => {
                const userData: User = res?.data || res;
                if (userData && userData._id && !userData.id) {
                    userData.id = userData._id;
                }
                dispatch(updateUserInfo(userData));
            })
            .catch((err) => {
                console.error('Session validation failed:', err);
                logout(); // Automatically clear local session and redirect
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [dispatch]);

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (user?.blockedByAdmin) {
        return (
            <div className="h-screen w-full bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
                        <AlertCircle size={48} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Restricted</h1>
                        <p className="text-gray-500 font-medium">
                            Your account has been blocked by an administrator. You cannot perform any actions at this time.
                        </p>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-lg"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                        Contact support if you believe this is a mistake
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AppProviders>
            {children}
        </AppProviders>
    );
}
