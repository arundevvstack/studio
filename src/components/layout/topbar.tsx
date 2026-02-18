"use client";

import { Bell, Search, Command, ShieldCheck } from 'lucide-react';
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

export function Topbar() {
  const { user, isAdmin, logOut } = useAuth();

  return (
    <header className="h-24 bg-white/40 backdrop-blur-3xl border-b border-slate-200/50 sticky top-0 z-30 flex items-center justify-between px-12">
      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Search productions, teams or briefs..." 
          className="pl-14 pr-12 bg-slate-200/50 border-none rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-primary h-14 transition-all font-semibold text-slate-900"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80 border text-slate-400 font-bold opacity-60 group-focus-within:opacity-0 transition-opacity">
          <Command size={14} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase">K</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {isAdmin && (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-2xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={16} />
            Administrator
          </Badge>
        )}
        
        <Button variant="ghost" size="icon" className="relative text-slate-500 rounded-[1.25rem] h-12 w-12 hover:bg-white/80 transition-all group border-none">
          <Bell size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-[3px] border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-[1.25rem] overflow-hidden group p-0">
              <Avatar className={cn(
                "h-12 w-12 ring-2 transition-all rounded-[1.25rem]",
                isAdmin ? "ring-amber-400" : "ring-slate-100 group-hover:ring-primary/40"
              )}>
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black rounded-[1.25rem] text-lg">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 rounded-[2rem] p-4 mt-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] border-none ios-blur" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-2">
                <p className="text-lg font-black leading-none text-slate-900">{user?.displayName}</p>
                <p className="text-sm font-bold leading-none text-slate-500 uppercase tracking-widest text-[10px]">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-3 opacity-50" />
            <DropdownMenuItem className="rounded-2xl cursor-pointer font-black py-3.5 text-sm hover:bg-slate-100/50">My Profile</DropdownMenuItem>
            {isAdmin && <DropdownMenuItem className="rounded-2xl cursor-pointer font-black py-3.5 text-sm text-amber-600 hover:bg-amber-50/50">Admin Console</DropdownMenuItem>}
            <DropdownMenuItem className="rounded-2xl cursor-pointer font-black py-3.5 text-sm hover:bg-slate-100/50">Security Keys</DropdownMenuItem>
            <DropdownMenuSeparator className="my-3 opacity-50" />
            <DropdownMenuItem className="rounded-2xl text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer font-black py-3.5 text-sm" onClick={() => logOut()}>
              Sign Out Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
