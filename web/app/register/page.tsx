'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { ArrowRight, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
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
      await authApi.register({ fullName, email, password });
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      {/* Left Panel — Dark Obsidian Executive Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-sidebar relative overflow-hidden flex-col justify-between p-12 border-r border-white/[0.06]">
        {/* Subtle monochrome ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/[0.04] rounded-full blur-[100px]" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-soft">
              <svg className="w-5 h-5 text-sidebar" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5c1.38 0 2.62.62 3.46 1.6l-1.42 1.42C12.58 9.94 11.85 9.5 11 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.1 0 2.03-.71 2.36-1.7H11v-2h4.41c.06.32.09.65.09 1 0 2.62-1.93 4.7-4.5 4.7z"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-display font-bold text-white tracking-tight block">Taskora</span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">Executive Edition</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-white text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Executive Workspace Setup</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-display font-extrabold text-white leading-tight mb-4">
            Command your project delivery pipeline.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Join engineering leaders and product teams using Taskora to orchestrate complex deliverables with certainty.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-zinc-400 text-xs">
          <span>Taskora Executive</span>
          <span>·</span>
          <span>Enterprise Grade</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5c1.38 0 2.62.62 3.46 1.6l-1.42 1.42C12.58 9.94 11.85 9.5 11 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.1 0 2.03-.71 2.36-1.7H11v-2h4.41c.06.32.09.65.09 1 0 2.62-1.93 4.7-4.5 4.7z"/>
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-ink">Taskora</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-ink mb-1">Create an account</h1>
          <p className="text-muted text-sm mb-8">Set up your workspace to get started</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="label-field">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label-field">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-ink font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
