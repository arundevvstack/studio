"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Search, Command, ShieldCheck, Sun, Moon, CheckCircle2, Clock, AlertCircle, User as UserIcon, Settings, LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/firebase/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Production Shift', message: "'Nike Summer 24' moved to Production.", time: '2m ago', type: 'success', isNew: true },
  { id: '2', title: 'Financial Sync', message: 'Invoice #MRZL_2024 has been Paid.', time: '45m ago', type: 'info', isNew: true },
];

export function Topbar() {
  const { user, isAdmin, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 bg-transparent">
      <div className="flex-1 max-w-lg relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary" />
        <Input placeholder="Search production assets..." className="pl-10 pr-12 glass-pill border-none h-10 font-semibold text-xs" />
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && <Badge className="bg-amber-100 text-amber-900 border-none rounded-[3px] px-3 py-1 font-black text-[9px] uppercase tracking-widest gap-1.5"><ShieldCheck size={12} />Admin</Badge>}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative text-slate-500 glass-pill h-10 w-10 border-none"><Bell size={18} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm"></span></Button></DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 glass-card p-0 mt-2 shadow-2xl border-none overflow-hidden" align="end">
            <DropdownMenuLabel className="p-5 border-b border-slate-100"><h3 className="text-sm font-black tracking-tight text-slate-700">Intelligence Notifications</h3></DropdownMenuLabel>
            {MOCK_NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="p-4 border-b border-slate-50 last:border-0 rounded-none cursor-pointer">
                <div className="flex items-start gap-3 w-full">
                  <div className={cn("w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0", n.type === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500")}><CheckCircle2 size={14} /></div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.title}</h4><span className="text-[8px] font-bold text-slate-300">{n.time}</span></div>
                    <p className="font-arial text-[12px] text-slate-700 leading-snug">{n.message}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="relative h-10 w-10 rounded-[3px] overflow-hidden p-0 border"><Avatar className="h-full w-full rounded-[3px]"><AvatarImage src={user?.photoURL} className="object-cover" /><AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{user?.displayName?.[0]}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 glass-card p-4 mt-2 shadow-2xl border-none" align="end">
            <DropdownMenuLabel className="p-2"><p className="text-sm font-black text-slate-900">{user?.displayName}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.email}</p></DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild className="rounded-[3px] font-bold py-2 text-xs cursor-pointer"><Link href="/profile" className="flex items-center gap-2"><UserIcon size={14} /> My Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-[3px] font-bold py-2 text-xs cursor-pointer"><Link href="/settings" className="flex items-center gap-2"><Settings size={14} /> Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-[3px] text-rose-500 font-bold py-2 text-xs cursor-pointer" onClick={() => logOut()}><LogOut size={14} className="mr-2" /> Sign Out Securely</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
