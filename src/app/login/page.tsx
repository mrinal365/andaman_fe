'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { toast } from 'react-toastify'; // Added toast

import { AuthBackground } from '@/components/login/AuthBackground';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import { GoogleIcon } from '@/components/icons';
import { isFormDataValid } from './utils';
import { login, googleLogin } from '@/services/authService';
import { setCookie } from '@/utils';
import { TOKEN_KEY } from '@/constants';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleProgressModal } from '@/components/auth/GoogleProgressModal';

export default function LoginPage() {
    const router = useRouter()
    // const searchParams = useSearchParams(); // Get search params
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    });

    const [isLoggingLoading, setIsLoggingLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [pendingAuthResponse, setPendingAuthResponse] = useState<any>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        // if (!isFormDataValid(formData)) {
        //     return
        // }
        setIsLoggingLoading(true)
        login(formData).then((res) => {
            toast.success("Login Successful");
            setCookie(TOKEN_KEY, res?.token);
            router.push("/feed");
            console.log("res", res);
        }).catch((err) => {
            // toast.error("Login Failed");
            console.log("err", err);
        }).finally(() => {
            setIsLoggingLoading(false)
        })
        e.preventDefault();
        console.log('Login Data:', formData);
        // Add auth logic here
    };

    const handleGoogleLoginSuccess = async (tokenResponse: any) => {
        setIsGoogleLoading(true);
        try {
            const res = await googleLogin(tokenResponse.access_token);
            if (res.isNewUser) {
                setPendingAuthResponse(res);
                setShowProgressModal(true);
            } else {
                completeLogin(res);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Google login failed");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const completeLogin = (res: any) => {
        toast.success("Login Successful");
        setCookie(TOKEN_KEY, res?.token);
        router.push("/feed");
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: () => toast.error("Google login failed"),
    });



    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Modular Background Component */}
            <AuthBackground />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-neutral-900/30 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-400 mt-2 text-sm">
                            Catch the wave to your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            error={formErrors.email}
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                                    Password
                                </label>
                                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                label=""
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                error={formErrors.password}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <Button loading={isLoggingLoading} type="submit" variant="primary">
                            Sign In
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-black text-neutral-400">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="primary"
                            icon={<GoogleIcon />}
                            loading={isGoogleLoading}
                            onClick={() => loginWithGoogle()}
                        >
                            Sign in with Google
                        </Button>
                    </form>

                    <GoogleProgressModal 
                        isOpen={showProgressModal} 
                        onComplete={() => completeLogin(pendingAuthResponse)} 
                    />

                    <div className="mt-8 text-center">
                        <p className="text-neutral-400 text-sm">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-white font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
