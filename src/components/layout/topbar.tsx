"use client";

import { useEffect, useState } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "h-24 sticky top-0 z-40 flex items-center justify-between px-12 transition-all duration-500",
      scrolled ? "glass-panel shadow-sm" : "bg-transparent"
    )}>
      <div className="flex-1 max-w-xl relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Global search..." 
          className="pl-12 pr-12 glass-pill border-none focus-visible:ring-2 focus-visible:ring-primary/20 h-12 transition-all font-semibold text-sm"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/60 border text-[10px] font-black text-slate-400 opacity-60">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isAdmin && (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2">
            <ShieldCheck size={14} />
            Administrator
          </Badge>
        )}
        
        <Button variant="ghost" size="icon" className="relative text-slate-500 glass-pill h-11 w-11 hover:bg-white/80 transition-all border-none">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-2xl overflow-hidden group p-0 shadow-sm border-white border">
              <Avatar className="h-full w-full rounded-2xl">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 glass-card p-4 mt-4 shadow-2xl border-none" align="end">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-base font-black leading-none text-slate-900">{user?.displayName}</p>
                <p className="text-[10px] font-black leading-none text-slate-400 uppercase tracking-widest">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-200/40" />
            <DropdownMenuItem className="rounded-xl cursor-pointer font-bold py-2.5 text-sm">My Profile</DropdownMenuItem>
            {isAdmin && <DropdownMenuItem className="rounded-xl cursor-pointer font-bold py-2.5 text-sm text-amber-600">Admin Console</DropdownMenuItem>}
            <DropdownMenuSeparator className="my-2 bg-slate-200/40" />
            <DropdownMenuItem className="rounded-xl text-rose-500 focus:text-rose-600 cursor-pointer font-bold py-2.5 text-sm" onClick={() => logOut()}>
              Sign Out Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}