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
  Zap,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Workflow },
  { name: 'Portfolio', href: '/projects', icon: FolderKanban },
  { name: 'Board', href: '/kanban', icon: Trello },
  { name: 'Schedule', href: '/calendar', icon: Calendar },
  { name: 'Intelligence', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  return (
    <div className="flex h-screen w-80 flex-col bg-white/40 backdrop-blur-3xl border-r border-slate-200/50 px-6 py-10 shrink-0 relative z-40">
      <div className="px-4 mb-12">
        <Link href="/dashboard" className="flex items-center gap-4 group cursor-pointer ios-interactive">
          <div className="w-12 h-12 rounded-[1.25rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 group-hover:rotate-6 transition-transform">
            <Zap size={26} fill="currentColor" />
          </div>
          <span className="font-black text-3xl tracking-tighter text-slate-900">MediaFlow</span>
        </Link>
      </div>

      <div className="px-2 mb-10">
        <Button 
          asChild
          className="w-full h-16 rounded-[1.5rem] font-black text-base gap-3 shadow-2xl shadow-primary/25 transition-all bg-primary border-none ios-interactive"
        >
          <Link href="/projects/new">
            <Plus size={22} strokeWidth={3} />
            Create Project
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-2 px-2 overflow-y-auto scrollbar-hide">
        <p className="px-4 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Workspace</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-5 py-4 text-[15px] font-bold rounded-[1.5rem] transition-all duration-300 ios-interactive",
                isActive 
                  ? "bg-white text-primary premium-shadow" 
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
              )}
            >
              <div className="flex items-center pointer-events-none">
                <item.icon className={cn("mr-4 h-6 w-6", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
              {isActive && <ChevronRight size={16} className="text-primary/50 pointer-events-none" />}
            </Link>
          );
        })}
      </div>

      <div className="pt-8 mt-6 border-t border-slate-200/50 px-2 space-y-2">
        <Link
          href="/settings"
          className="flex items-center px-5 py-4 text-[15px] font-bold rounded-[1.5rem] text-slate-500 hover:bg-white/60 hover:text-slate-900 transition-all duration-300 ios-interactive"
        >
          <Settings className="mr-4 h-6 w-6 text-slate-400 pointer-events-none" />
          Settings
        </Link>
        <button
          onClick={() => logOut()}
          className="w-full flex items-center px-5 py-4 text-[15px] font-bold rounded-[1.5rem] text-rose-500 hover:bg-rose-50 transition-all duration-300 ios-interactive"
        >
          <LogOut className="mr-4 h-6 w-6 pointer-events-none" />
          Log out
        </button>
      </div>
    </div>
  );
}
