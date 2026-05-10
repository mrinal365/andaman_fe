'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ProgressStep {
    id: number;
    label: string;
    status: 'waiting' | 'loading' | 'completed';
}

interface GoogleProgressModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const GoogleProgressModal: React.FC<GoogleProgressModalProps> = ({ isOpen, onComplete }) => {
    const [steps, setSteps] = useState<ProgressStep[]>([
        { id: 1, label: 'Verifying Google Account', status: 'loading' },
        { id: 2, label: 'Registering User', status: 'waiting' },
        { id: 3, label: 'Creating a unique handle', status: 'waiting' },
        { id: 4, label: 'Finalizing setup', status: 'waiting' },
    ]);

    useEffect(() => {
        if (!isOpen) return;

        const runProgress = async () => {
            // Step 1 -> 2
            await new Promise(r => setTimeout(r, 1500));
            setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'completed' } : s.id === 2 ? { ...s, status: 'loading' } : s));

            // Step 2 -> 3
            await new Promise(r => setTimeout(r, 1200));
            setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'completed' } : s.id === 3 ? { ...s, status: 'loading' } : s));

            // Step 3 -> 4
            await new Promise(r => setTimeout(r, 1000));
            setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'completed' } : s.id === 4 ? { ...s, status: 'loading' } : s));

            // Complete
            await new Promise(r => setTimeout(r, 800));
            setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: 'completed' } : s));

            await new Promise(r => setTimeout(r, 500));
            onComplete();
        };

        runProgress();
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl overflow-hidden relative"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Setting up your account</h2>
                        <p className="text-neutral-400 text-sm">Please wait while we prepare your journey</p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step) => (
                            <div key={step.id} className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {step.status === 'completed' ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </motion.div>
                                    ) : step.status === 'loading' ? (
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-neutral-700" />
                                    )}
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-300 ${step.status === 'waiting' ? 'text-neutral-500' : 'text-neutral-200'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{
                                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
                            }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
