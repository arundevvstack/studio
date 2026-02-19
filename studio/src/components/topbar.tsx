'use client';

import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export function Topbar() {
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  const notifications = [
    { id: 1, title: 'Project Milestone', description: 'Summer Campaign stage shifted to Post-Production.', time: '2m ago' },
    { id: 2, title: 'Financial Event', description: 'Invoice #4402 has been marked as PAID.', time: '1h ago' },
    { id: 3, title: 'Team Authorization', description: 'Sarah Chen has joined the Design node.', time: '3h ago' },
  ];

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full text-slate-700">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workspace..."
            className="pl-9 bg-muted/50 border-none h-9 focus-visible:ring-1 text-slate-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-700 hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 border shadow-xl rounded-lg">
            <DropdownMenuLabel className="font-bold px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Studio Activity Feed
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between w-full">
                    <span className="font-bold text-[10px] uppercase tracking-tighter text-primary">
                      {n.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">{n.description}</p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary font-bold uppercase tracking-widest text-[9px] cursor-pointer py-2">
              Access Full Audit Log
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0 overflow-hidden border shadow-sm">
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="object-cover" />
                <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border shadow-xl rounded-lg">
            <DropdownMenuLabel className="flex flex-col gap-0.5 p-3">
              <p className="text-sm font-bold truncate text-slate-900">{user?.displayName || 'Studio User'}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-widest">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer py-2">
                <User className="mr-2 h-4 w-4 text-slate-500" />
                <span className="font-medium">My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer py-2">
                <Settings className="mr-2 h-4 w-4 text-slate-500" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive py-2" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}