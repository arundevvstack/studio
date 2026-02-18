
"use client";

import { Bell, Search, User as UserIcon, Command, ShieldCheck } from 'lucide-react';
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
    <header className="h-20 border-b bg-white/40 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-10">
      <div className="flex-1 max-w-xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Quick search projects, teams or documents..." 
          className="pl-12 pr-12 bg-slate-100/80 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary h-12 transition-all font-medium text-slate-900"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
          <Command size={12} strokeWidth={3} />
          <span className="text-[10px] font-black">K</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isAdmin && (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <ShieldCheck size={14} />
            Full Access Root
          </Badge>
        )}
        
        <div className="hidden md:flex items-center gap-2 pr-4 border-r">
          <Badge variant="outline" className="rounded-xl px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] uppercase tracking-wider">
            Enterprise Cloud
          </Badge>
        </div>

        <Button variant="ghost" size="icon" className="relative text-slate-500 rounded-2xl h-11 w-11 hover:bg-slate-100 transition-all group">
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-[3px] border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-2xl overflow-hidden group p-0">
              <Avatar className={cn(
                "h-11 w-11 ring-2 transition-all rounded-2xl",
                isAdmin ? "ring-amber-400" : "ring-slate-100 group-hover:ring-primary/40"
              )}>
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black rounded-2xl">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-[1.75rem] p-3 mt-4 shadow-2xl border-slate-100" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black leading-none text-slate-900">{user?.displayName}</p>
                <p className="text-xs font-medium leading-none text-slate-500 mt-1">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-xl cursor-pointer font-bold py-2.5">Workspace Profile</DropdownMenuItem>
            {isAdmin && <DropdownMenuItem className="rounded-xl cursor-pointer font-bold py-2.5 text-amber-600">Admin Console</DropdownMenuItem>}
            <DropdownMenuItem className="rounded-xl cursor-pointer font-bold py-2.5">Security Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-xl text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer font-bold py-2.5" onClick={() => logOut()}>
              Sign Out Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
