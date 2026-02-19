
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
  Workflow,
  ReceiptRussianRuble
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Workflow },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Board', href: '/kanban', icon: Trello },
  { name: 'Schedule', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/invoices', icon: ReceiptRussianRuble },
  { name: 'Intelligence', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const logo = PlaceHolderImages.find(img => img.id === 'marzelz-logo');

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 glass-card z-50 flex flex-col p-5 overflow-hidden">
      <div className="px-2 mb-8">
        <Link href="/dashboard" className="flex justify-center group ios-clickable">
          {logo && (
            <div className="relative h-12 w-full">
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                fill 
                className="object-contain"
                data-ai-hint={logo.imageHint}
                priority
              />
            </div>
          )}
        </Link>
      </div>

      <div className="mb-6">
        <Button 
          asChild
          className="w-full h-12 rounded-lg font-black text-xs gap-2 shadow-xl shadow-primary/20 bg-primary border-none ios-clickable"
        >
          <Link href="/projects/new">
            <Plus size={16} strokeWidth={3} />
            New Production
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-1">
        <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 opacity-70">Workspace</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-xs font-bold rounded-lg transition-all duration-300 ios-clickable",
                isActive 
                  ? "bg-white/80 text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-white/40 hover:text-slate-900"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
              {isActive && <ChevronRight size={12} className="text-primary/40" />}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200/40 space-y-1">
        <Link
          href="/settings"
          className="flex items-center px-4 py-3 text-xs font-bold rounded-lg text-slate-500 hover:bg-white/40 hover:text-slate-900 transition-all ios-clickable"
        >
          <Settings className="mr-3 h-4 w-4 text-slate-400" />
          Settings
        </Link>
        <button
          onClick={() => logOut()}
          className="w-full flex items-center px-4 py-3 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-50/50 transition-all ios-clickable"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
