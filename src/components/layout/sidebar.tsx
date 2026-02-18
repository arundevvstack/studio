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
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Kanban', href: '/kanban', icon: Trello },
  { name: 'Calendar', href: '/calendar', icon: Calendar, disabled: true },
  { name: 'Reports', href: '/reports', icon: BarChart3, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <FolderKanban size={18} />
          </div>
          <span>MediaFlow</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="mb-4">
          <Button variant="default" className="w-full justify-start gap-2 shadow-sm rounded-xl font-medium" asChild>
            <Link href="/projects/new">
              <Plus size={18} />
              New Project
            </Link>
          </Button>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "" : "group-hover:text-accent-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-4 border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          )}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={() => logOut()}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}