'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    authApi.getSession().then((data) => {
      if (data.authenticated) {
        setUser(data.user);
      }
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="h-screen w-full overflow-hidden flex bg-[#0B0E17] text-white selection:bg-blue-600 selection:text-white relative">
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-48 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Fixed and Non-Scrolling */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-screen w-[260px]
          bg-[#0E121E] text-white flex flex-col justify-between
          transition-transform duration-300 ease-out border-r border-white/[0.06] shrink-0 select-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Branding */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.06] shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <img
                src="/api/logo"
                alt="Taskora Logo"
                className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-md border border-white/[0.08] transition-transform group-hover:scale-105"
              />
              <div className="leading-tight">
                <span className="text-lg font-display font-bold tracking-tight text-white block">Taskora</span>
                <span className="text-xs text-zinc-400 font-normal">Plan. Track. Achieve.</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`
                    flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }
                  `}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Right Side Main Layout Area - ONLY this side scrolls */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 shrink-0 bg-[#0B0E17]/85 backdrop-blur-md border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 sm:px-10 py-3.5">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <form 
                className="relative w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const q = formData.get('q')?.toString() || '';
                  if (q.trim()) {
                    router.push(`/tasks?search=${encodeURIComponent(q.trim())}`);
                  }
                }}
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search projects, tasks..."
                  className="w-full bg-[#131824] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </form>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3.5 relative">
              {/* Working Upper Right User Avatar Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white text-xs font-semibold shrink-0 hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer focus:outline-none"
                  title={user?.fullName || 'User menu'}
                >
                  {initials}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-[#121622] border border-white/[0.08] rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-1">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.fullName || 'User Profile'}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {user?.email || 'user@taskora.io'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
