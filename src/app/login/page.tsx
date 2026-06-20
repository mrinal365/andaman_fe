'use client'
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

import { AuthBackground } from '@/components/login/AuthBackground';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import { GoogleIcon } from '@/components/icons';
import { isFormDataValid } from './utils';
import { login, googleLogin } from '@/services/authService';
import { setCookie, getCookie } from '@/utils';
import { TOKEN_KEY } from '@/constants';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleProgressModal } from '@/components/auth/GoogleProgressModal';
import { loginRateLimiter } from '@/utils/rateLimiter';

export default function LoginPage() {
    const router = useRouter()
    
    useEffect(() => {
        const token = getCookie(TOKEN_KEY);
        if (token) {
            router.replace('/feed');
        }
    }, [router]);

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

    // Login attempt tracking
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

    // Check rate limit on mount
    useEffect(() => {
        const result = loginRateLimiter.check();
        if (!result.allowed) {
            setIsRateLimited(true);
            setRateLimitCountdown(Math.ceil(result.retryAfterMs / 1000));
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!isRateLimited || rateLimitCountdown <= 0) return;

        const timer = setInterval(() => {
            setRateLimitCountdown(prev => {
                if (prev <= 1) {
                    setIsRateLimited(false);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRateLimited, rateLimitCountdown]);

    const formatCountdown = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check rate limit before attempting login
        const rateLimitResult = loginRateLimiter.check();
        if (!rateLimitResult.allowed) {
            setIsRateLimited(true);
            setRateLimitCountdown(Math.ceil(rateLimitResult.retryAfterMs / 1000));
            toast.error('Too many login attempts. Please wait before trying again.');
            return;
        }

        setIsLoggingLoading(true);
        login(formData).then((res) => {
            toast.success("Login Successful");
            setCookie(TOKEN_KEY, res?.token);
            router.push("/feed");
        }).catch((err) => {
            // Record failed login attempt for rate limiting
            loginRateLimiter.record();

            const status = err.response?.status;
            const message = err.response?.data?.message || "Invalid email or password";

            if (status === 429) {
                const retryAfter = err.response?.data?.retryAfter;
                setIsRateLimited(true);
                setRateLimitCountdown(retryAfter || 1800);
                toast.error(message);
            } else {
                toast.error(message);
            }

            // Check if we've just hit the limit after this failure
            const checkAfter = loginRateLimiter.check();
            if (!checkAfter.allowed) {
                setIsRateLimited(true);
                setRateLimitCountdown(Math.ceil(checkAfter.retryAfterMs / 1000));
            }
        }).finally(() => {
            setIsLoggingLoading(false);
        });
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
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="Explore.baby" className="h-16 w-16 object-contain" />
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-400 mt-2 text-sm">
                            Your journey continues here
                        </p>
                    </div>

                    {/* Rate Limit Warning Banner */}
                    {isRateLimited && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-red-400 font-medium text-sm">Too many attempts</span>
                            </div>
                            <p className="text-red-300/70 text-xs">
                                Please try again in <span className="font-mono font-bold text-red-300">{formatCountdown(rateLimitCountdown)}</span>
                            </p>
                        </div>
                    )}

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

                        <Button
                            loading={isLoggingLoading}
                            type="submit"
                            variant="primary"
                            disabled={isRateLimited}
                        >
                            {isRateLimited ? `Try again in ${formatCountdown(rateLimitCountdown)}` : 'Sign In'}
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
