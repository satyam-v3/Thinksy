import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
    const { login, register } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);

    // Grouped form state for cleaner handling
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
            } else {
                await login({
                    email: formData.email,
                    password: formData.password
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isSignUp ? 'sign up' : 'log in'}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grain flex min-h-screen w-screen items-center justify-center bg-bg p-4 text-fg sm:p-8">

            {/* Container */}
            <div className="w-full max-w-[400px] animate-fade-up">

                {/* Logo / Brand Header */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <h1 className="font-display text-3xl font-medium tracking-tight">
                        Welcome to Thinksy
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        {isSignUp
                            ? "Create an account to start analyzing documents."
                            : "Sign in to continue chatting with your PDFs."}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="card p-6 sm:p-8">

                    {/* Error State styled for dark/light mode compatibility */}
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {isSignUp && (
                            <div className="space-y-1">
                                <label className="ml-1 text-xs font-medium text-muted">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-border bg-surface2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:bg-surface focus:ring-1 focus:ring-accent"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="ml-1 text-xs font-medium text-muted">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-border bg-surface2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:bg-surface focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="ml-1 flex items-center justify-between">
                                <label className="text-xs font-medium text-muted">Password</label>
                                {!isSignUp && (
                                    <a href="#" className="text-xs text-accent transition-colors hover:text-accent2">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-border bg-surface2 py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:bg-surface focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary mt-2 w-full py-2.5"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="mt-6 text-center text-sm text-muted">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setFormData({ name: '', email: '', password: '' });
                            }}
                            className="font-medium text-fg underline underline-offset-4 transition-colors hover:text-accent focus:outline-none"
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};