'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.login({ email, password });
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-subtle text-ink">
      {/* Left Panel — Dark Showcase with Taskora Brand Artwork */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[48%] 2xl:w-[46%] bg-[#080B11] overflow-hidden">
        <img
          src="/api/showcase-image"
          alt="Taskora - Plan. Track. Achieve."
          className="w-full h-full object-cover object-[20%_center]"
        />
      </div>

      {/* Right Panel — Clean Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo matching brand artwork */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img
              src="/api/logo"
              alt="Taskora Logo"
              className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-soft border border-ash/80"
            />
            <div>
              <span className="text-2xl font-display font-bold text-ink block leading-tight">Taskora</span>
              <span className="text-xs text-muted font-medium">Plan. Track. Achieve.</span>
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-ink mb-1.5">Welcome back</h1>
          <p className="text-muted text-sm mb-8">Sign in to access your executive workspace</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl text-sm bg-white border border-ash/80 text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-all shadow-soft"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-10 rounded-xl text-sm bg-white border border-ash/80 text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-all shadow-soft"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/60 hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-ink text-white font-medium text-sm hover:bg-zinc-800 active:bg-black transition-all duration-200 ease-out shadow-soft hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-ink font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
