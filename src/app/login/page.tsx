'use client'
import Link from 'next/link';
import { useState } from 'react';

import { AuthBackground } from '@/components/login/AuthBackground';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import { GoogleIcon } from '@/components/icons';
import { isFormDataValid } from './utils';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (!isFormDataValid(formData)) {
            return
        }
        e.preventDefault();
        console.log('Login Data:', formData);
        // Add auth logic here
    };



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

                        <Button type="submit" variant="primary">
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
                        >
                            Sign in with Google
                        </Button>
                    </form>

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
