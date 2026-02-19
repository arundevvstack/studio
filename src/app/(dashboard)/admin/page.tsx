
"use client";

import { useState } from 'react';
import { ShieldCheck, UserCheck, UserMinus, ShieldAlert, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { TeamMember, TeamStatus, TeamRole } from '@/lib/types';
import { updateTeamMemberStatus, updateTeamMemberRole } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminConsole() {
  const { isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const membersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'teamMembers'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: members, isLoading } = useCollection<TeamMember>(membersQuery);

  const handleStatusChange = (userId: string, status: TeamStatus, name: string) => {
    if (!db) return;
    updateTeamMemberStatus(db, userId, status);
    toast({ title: "Status Synchronized", description: `${name} is now ${status}.` });
  };

  const handleRoleChange = (userId: string, role: TeamRole, name: string) => {
    if (!db) return;
    updateTeamMemberRole(db, userId, role);
    toast({ title: "Role Modified", description: `${name} promoted to ${role}.` });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-in fade-in duration-700">
        <div className="p-8 bg-rose-50 rounded-[5px] text-rose-500 border border-rose-100"><ShieldAlert size={64} /></div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Terminal Restricted</h2>
          <p className="text-slate-500 text-lg font-medium max-w-md">Admin-level clearance required for personnel management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Admin Console</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Authorize personnel and manage production clearance levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Personnel</p>
            <div className="text-4xl font-black text-slate-900">{members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Clearance</p>
            <div className="text-4xl font-black text-amber-500">{members?.filter(m => m.status === 'Pending').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Producers</p>
            <div className="text-4xl font-black text-primary">{members?.filter(m => m.status === 'Authorized').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 h-16">
            <TableRow className="border-b border-slate-100">
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 pl-10">Personnel Entity</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Clearance Status</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Strategic Role</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 text-right pr-10">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-64 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Personnel records...</TableCell></TableRow>
            ) : members?.map((member) => (
              <TableRow key={member.id} className="hover:bg-white/40 border-b border-slate-50 last:border-0 h-24">
                <TableCell className="pl-10">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[5px] overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <img src={member.photoURL || `https://picsum.photos/seed/${member.id}/100/100`} alt={member.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-lg tracking-tight">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-[5px] px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                    member.status === 'Authorized' ? "bg-emerald-50 text-emerald-600" : 
                    member.status === 'Pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select value={member.role} onValueChange={(val) => handleRoleChange(member.id, val as TeamRole, member.name)}>
                    <SelectTrigger className="w-32 h-9 rounded-[5px] font-bold text-xs bg-slate-50 border-none shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[5px] border-none shadow-2xl">
                      <SelectItem value="Producer" className="font-bold">Producer</SelectItem>
                      <SelectItem value="Editor" className="font-bold">Editor</SelectItem>
                      <SelectItem value="Director" className="font-bold">Director</SelectItem>
                      <SelectItem value="Admin" className="font-bold text-primary">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex items-center justify-end gap-2">
                    {member.status === 'Pending' ? (
                      <Button size="sm" className="rounded-[5px] font-black text-[10px] uppercase bg-emerald-500 hover:bg-emerald-600 h-9 px-4 gap-2" onClick={() => handleStatusChange(member.id, 'Authorized', member.name)}>
                        <UserCheck size={14} /> Authorize
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-[5px] font-black text-[10px] uppercase text-rose-500 hover:bg-rose-50 h-9 px-4 gap-2" onClick={() => handleStatusChange(member.id, 'Suspended', member.name)}>
                        <UserMinus size={14} /> Suspend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
