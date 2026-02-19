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
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Board', href: '/kanban', icon: Trello },
  { name: 'Schedule', href: '/calendar', icon: Calendar },
  { name: 'Intelligence', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-72 glass-card z-50 flex flex-col p-6 overflow-hidden">
      <div className="px-2 mb-10">
        <Link href="/dashboard" className="flex items-center gap-3 group ios-clickable">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">MediaFlow</span>
        </Link>
      </div>

      <div className="mb-8">
        <Button 
          asChild
          className="w-full h-14 rounded-2xl font-black text-sm gap-2 shadow-xl shadow-primary/20 bg-primary border-none ios-clickable"
        >
          <Link href="/projects/new">
            <Plus size={18} strokeWidth={3} />
            New Production
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide px-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 opacity-70">Workspace</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ios-clickable",
                isActive 
                  ? "bg-white/80 text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-white/40 hover:text-slate-900"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3.5 h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
              {isActive && <ChevronRight size={14} className="text-primary/40" />}
            </Link>
          );
        })}
      </div>

      <div className="pt-6 mt-6 border-t border-slate-200/40 space-y-1">
        <Link
          href="/settings"
          className="flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl text-slate-500 hover:bg-white/40 hover:text-slate-900 transition-all ios-clickable"
        >
          <Settings className="mr-3.5 h-5 w-5 text-slate-400" />
          Settings
        </Link>
        <button
          onClick={() => logOut()}
          className="w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl text-rose-500 hover:bg-rose-50/50 transition-all ios-clickable"
        >
          <LogOut className="mr-3.5 h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
