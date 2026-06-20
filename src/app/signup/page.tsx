'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { AuthBackground } from '@/components/login/AuthBackground';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { signup, googleLogin } from '@/services/authService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/icons';
import { setCookie, getCookie } from '@/utils';
import { TOKEN_KEY } from '@/constants';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleProgressModal } from '@/components/auth/GoogleProgressModal';
import { signupRateLimiter } from '@/utils/rateLimiter';
import { validateSignupForm, validatePassword, type PasswordStrength } from '@/utils/validation';

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        const token = getCookie(TOKEN_KEY);
        if (token) {
            router.replace('/feed');
        }
    }, [router]);

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [pendingAuthResponse, setPendingAuthResponse] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        handle: '',
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

    // Honeypot field — bots fill it, humans don't see it
    const [honeypot, setHoneypot] = useState('');

    // Rate limit state
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

    // Check rate limit on mount
    useEffect(() => {
        const result = signupRateLimiter.check();
        if (!result.allowed) {
            setIsRateLimited(true);
            setRateLimitCountdown(Math.ceil(result.retryAfterMs / 1000));
        }
    }, []);

    // Countdown timer when rate limited
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Live password strength indicator
        if (name === 'password') {
            if (value.length > 0) {
                const result = validatePassword(value);
                setPasswordStrength(result.strength);
            } else {
                setPasswordStrength(null);
            }
        }
    };

    const formatCountdown = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side rate limit check
        const rateLimitResult = signupRateLimiter.check();
        if (!rateLimitResult.allowed) {
            setIsRateLimited(true);
            setRateLimitCountdown(Math.ceil(rateLimitResult.retryAfterMs / 1000));
            toast.error('Too many signup attempts. Please wait before trying again.');
            return;
        }

        // Validate all fields
        const errors = validateSignupForm(formData);
        if (errors) {
            // Filter out undefined values to match Record<string, string>
            const cleanErrors: Record<string, string> = {};
            for (const [key, value] of Object.entries(errors)) {
                if (value) cleanErrors[key] = value;
            }
            setFormErrors(cleanErrors);
            // Focus the first error field
            const firstErrorField = Object.keys(errors)[0];
            const el = document.getElementById(firstErrorField);
            if (el) el.focus();
            return;
        }

        setIsLoading(true);

        // Include honeypot field in request (server checks it)
        const submitData = { ...formData, website: honeypot };

        signup(submitData).then((res) => {
            // Record successful signup for client-side rate limiting
            signupRateLimiter.record();
            toast.success("Signup Successful");
            setCookie(TOKEN_KEY, res?.token);
            router.push("/feed");
        }).catch((err) => {
            const status = err.response?.status;
            const message = err.response?.data?.message || "Signup failed. Please try again.";

            if (status === 429) {
                // Server-side rate limit hit
                const retryAfter = err.response?.data?.retryAfter;
                setIsRateLimited(true);
                setRateLimitCountdown(retryAfter || 3600);
                toast.error(message);
            } else {
                toast.error(message);
            }
        }).finally(() => {
            setIsLoading(false);
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

    const strengthColors: Record<PasswordStrength, string> = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    };

    const strengthLabels: Record<PasswordStrength, string> = {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
    };

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
                            Create Account
                        </h1>
                        <p className="text-neutral-400 mt-2 text-sm">
                            Explore the world with us
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
                        {/* Honeypot field — hidden from humans, visible to bots */}
                        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                            <label htmlFor="website">Website</label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                            />
                        </div>

                        <Input
                            label="Full Name"
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            error={formErrors.name}
                        />
                        <Input
                            label="Handle"
                            id="handle"
                            name="handle"
                            type="text"
                            placeholder="johndoe"
                            value={formData.handle}
                            onChange={handleChange}
                            error={formErrors.handle}
                        />

                        <Input
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={formErrors.email}
                        />

                        <div>
                            <Input
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                error={formErrors.password}
                            />
                            {/* Password strength indicator */}
                            {passwordStrength && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                                                style={{
                                                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%'
                                                }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength === 'weak' ? 'text-red-400' :
                                            passwordStrength === 'medium' ? 'text-yellow-400' :
                                            'text-green-400'
                                        }`}>
                                            {strengthLabels[passwordStrength]}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            loading={isLoading}
                            type="submit"
                            variant="primary"
                            disabled={isRateLimited}
                        >
                            {isRateLimited ? `Try again in ${formatCountdown(rateLimitCountdown)}` : 'Sign Up'}
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
                            Sign up with Google
                        </Button>
                    </form>

                    <GoogleProgressModal
                        isOpen={showProgressModal}
                        onComplete={() => completeLogin(pendingAuthResponse)}
                    />

                    <div className="mt-8 text-center">
                        <p className="text-neutral-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
