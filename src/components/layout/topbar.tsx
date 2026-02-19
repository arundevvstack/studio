"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  Command, 
  ShieldCheck, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  User as UserIcon,
  Settings,
  LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/firebase/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";

// Mock notification data for tactical demonstration
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Production Shift',
    message: "Project 'Nike Summer 24' moved to Production phase.",
    time: '2 minutes ago',
    type: 'success',
    isNew: true
  },
  {
    id: '2',
    title: 'Financial Sync',
    message: 'Invoice #MRZL_2024_A9B2 has been marked as Paid.',
    time: '45 minutes ago',
    type: 'info',
    isNew: true
  },
  {
    id: '3',
    title: 'Personnel Authorized',
    message: 'Sarah Chen has been granted Director-level clearance.',
    time: '2 hours ago',
    type: 'auth',
    isNew: false
  },
  {
    id: '4',
    title: 'Milestone Alert',
    message: 'Deadline approaching for Adidas Global Campaign.',
    time: '5 hours ago',
    type: 'warning',
    isNew: false
  }
];

export function Topbar() {
  const { user, isAdmin, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <header className={cn(
      "h-20 sticky top-0 z-40 flex items-center justify-between px-8 transition-all duration-500",
      scrolled ? "glass-panel shadow-sm" : "bg-transparent"
    )}>
      <div className="flex-1 max-w-lg relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Search production assets..." 
          className="pl-10 pr-12 glass-pill border-none focus-visible:ring-2 focus-visible:ring-primary/20 h-10 transition-all font-semibold text-xs"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/60 dark:bg-slate-800/60 border text-[9px] font-black text-slate-400 opacity-60">
          <Command size={8} />
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 border-none rounded-[3px] px-3 py-1 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={12} />
            Admin
          </Badge>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-pill h-10 w-10 border-none"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-500" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-500 glass-pill h-10 w-10 hover:bg-white/80 dark:hover:bg-slate-800 transition-all border-none group">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-110 transition-transform"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 glass-card p-0 mt-2 shadow-2xl border-none overflow-hidden" align="end">
            <DropdownMenuLabel className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-tight text-slate-700 dark:text-slate-100">Intelligence Notifications</h3>
                <Badge className="rounded-[3px] bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-1.5 h-4">
                  {MOCK_NOTIFICATIONS.filter(n => n.isNew).length} NEW
                </Badge>
              </div>
            </DropdownMenuLabel>
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {MOCK_NOTIFICATIONS.map((n) => (
                <DropdownMenuItem key={n.id} className="p-4 focus:bg-slate-50 dark:focus:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 rounded-none relative">
                  {n.isNew && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
                  <div className="flex items-start gap-3 w-full">
                    <div className={cn(
                      "w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 shadow-sm",
                      n.type === 'success' ? "bg-emerald-50 text-emerald-500" :
                      n.type === 'info' ? "bg-blue-50 text-blue-500" :
                      n.type === 'warning' ? "bg-amber-50 text-amber-500" :
                      "bg-slate-50 text-slate-500"
                    )}>
                      {n.type === 'success' ? <CheckCircle2 size={14} /> : 
                       n.type === 'warning' ? <AlertCircle size={14} /> :
                       <Clock size={14} />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.title}</h4>
                        <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600">{n.time}</span>
                      </div>
                      <p className="font-arial text-[12px] text-slate-700 dark:text-slate-300 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="m-0 bg-slate-100 dark:border-slate-800" />
            <div className="p-3 text-center">
              <Button variant="ghost" className="w-full h-8 rounded-[3px] font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                View All Intelligence
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-[3px] overflow-hidden group p-0 shadow-sm border-white dark:border-slate-800 border">
              <Avatar className="h-full w-full rounded-[3px]">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 glass-card p-4 mt-2 shadow-2xl border-none" align="end">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black leading-none text-slate-900 dark:text-slate-100">{user?.displayName}</p>
                <p className="text-[9px] font-black leading-none text-slate-400 uppercase tracking-widest">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-200/40 dark:bg-slate-700/40" />
            <DropdownMenuItem asChild className="rounded-[3px] cursor-pointer font-bold py-2 text-xs">
              <Link href="/profile" className="flex items-center gap-2">
                <UserIcon size={14} /> My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-[3px] cursor-pointer font-bold py-2 text-xs">
              <Link href="/settings" className="flex items-center gap-2">
                <Settings size={14} /> System Settings
              </Link>
            </DropdownMenuItem>
            {isAdmin && <DropdownMenuItem asChild className="rounded-[3px] cursor-pointer font-bold py-2 text-xs text-amber-600">
              <Link href="/admin" className="flex items-center gap-2">
                <ShieldCheck size={14} /> Admin Console
              </Link>
            </DropdownMenuItem>}
            <DropdownMenuSeparator className="my-2 bg-slate-200/40 dark:bg-slate-700/40" />
            <DropdownMenuItem className="rounded-[3px] text-rose-500 focus:text-rose-600 cursor-pointer font-bold py-2 text-xs" onClick={() => logOut()}>
              <LogOut size={14} className="mr-2" /> Sign Out Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
