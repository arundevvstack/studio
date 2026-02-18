"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Trello, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Kanban', href: '/kanban', icon: Trello },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  return (
    <div className="flex h-full w-72 flex-col border-r bg-white/50 backdrop-blur-2xl px-4 py-8 relative">
      <div className="px-4 mb-10">
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 group-hover:rotate-6 transition-transform">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">MediaFlow</span>
        </Link>
      </div>

      <div className="px-2 mb-8">
        <Button className="w-full justify-center h-14 rounded-2xl font-black text-sm gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
          <Link href="/projects/new">
            <Plus size={20} strokeWidth={3} />
            Create Project
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-1.5 px-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Main Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                item.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-100 px-2 space-y-1.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center px-4 py-3 text-sm font-bold rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
          )}
        >
          <Settings className="mr-3 h-5 w-5 text-slate-400" />
          Settings
        </Link>
        <button
          onClick={() => logOut()}
          className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  );
}
