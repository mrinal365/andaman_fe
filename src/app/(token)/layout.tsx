'use client'

import Loader from "@/components/common/Loading";
import { getCurrentUser } from "@/services/authService";
import { updateUserInfo } from "@/store/features/userSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect, useState } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { User } from "../../../types/user";

export default function TokenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((res: any) => {
                const user: User = res?.data || res;
                if (user && user._id && !user.id) {
                    user.id = user._id;
                }
                dispatch(updateUserInfo(user));
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [])

    if (isLoading) {
        return (
            <Loader text="Checking user..." />
        );
    }

    return (
        <AppProviders>
            {children}
        </AppProviders>
    );
}
