"use client";

import { useState } from 'react';
import { 
  Users, Mail, ShieldCheck, Layers, ChevronDown, Target, Clock, Briefcase, Activity, UserPlus, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { TeamMember, Project, TeamRole } from '@/lib/types';
import { createInvitation } from '@/lib/firebase/firestore';
import { generateInvitationEmail } from '@/ai/flows/generate-invitation-email';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TeamPage() {
  const db = useFirestore();
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Editor');
  const [isInviting, setIsInviting] = useState(false);

  const teamQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'teamMembers'), where('status', '==', 'Authorized'), orderBy('name', 'asc'));
  }, [db]);

  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: members, isLoading: membersLoading } = useCollection<TeamMember>(teamQuery);
  const { data: allProjects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !inviteEmail) return;
    setIsInviting(true);
    try {
      await createInvitation(db, user.uid, inviteEmail, inviteRole);
      await generateInvitationEmail({ email: inviteEmail, role: inviteRole, inviteLink: window.location.origin, adminName: user.displayName || 'Admin' });
      toast({ title: "Invitation Dispatched", description: `Strategic brief synthesized for ${inviteEmail}.` });
      setIsInviteOpen(false);
    } catch (error: any) {
      toast({ title: "Synthesis Error", description: error.message, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
        <div><h1 className="text-2xl font-black tracking-tighter text-slate-700 leading-tight">Production Team</h1><p className="text-slate-500 text-xs font-medium opacity-80">Strategic talent mapping and workload synchronization.</p></div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild><Button className="rounded-[5px] h-8 px-4 font-black text-[10px] uppercase gap-2 bg-primary"><UserPlus size={14} /> Invite Personnel</Button></DialogTrigger>
              <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm">
                <DialogHeader><DialogTitle className="text-xl font-black text-slate-700">Invite Team Member</DialogTitle></DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 pt-2">
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">Strategic Email</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="rounded-[5px] border-slate-200 h-11 font-bold text-sm" required /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-400">Assigned Role</Label><Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}><SelectTrigger className="rounded-[5px] h-11 font-bold"><SelectValue /></SelectTrigger><SelectContent className="rounded-[5px]"><SelectItem value="Producer" className="text-xs">Producer</SelectItem><SelectItem value="Editor" className="text-xs">Editor</SelectItem><SelectItem value="Director" className="text-xs">Director</SelectItem><SelectItem value="Admin" className="text-xs text-primary">Admin</SelectItem></SelectContent></Select></div>
                  <DialogFooter className="pt-2"><Button variant="ghost" type="button" onClick={() => setIsInviteOpen(false)} className="rounded-[5px] text-xs h-10">Discard</Button><Button type="submit" disabled={isInviting} className="rounded-[5px] font-black text-xs h-10 bg-primary px-6">{isInviting ? 'Syncing...' : 'Dispatch Invitation'}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Badge className="rounded-[3px] bg-slate-100 text-slate-600 font-black text-[8px] uppercase h-7 px-2">{members?.length || 0} Personnel</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {members?.map((member) => (
          <Card key={member.id} className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="projects" className="border-none">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-[3px]"><AvatarImage src={member.photoURL} className="object-cover" /><AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{member.name[0]}</AvatarFallback></Avatar>
                    <div><h3 className="text-sm font-black text-slate-700">{member.name}</h3><Badge className="rounded-[2px] bg-primary/5 text-primary border-none font-black text-[7px] uppercase px-1.5 h-4">{member.role}</Badge></div>
                  </div>
                  <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden"><Button variant="outline" size="sm" className="rounded-[3px] border-slate-200 h-8 px-3 font-black text-[8px] uppercase gap-1.5">Workload <ChevronDown size={12} /></Button></AccordionTrigger>
                </div>
                <AccordionContent className="px-3 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {allProjects?.filter(p => p.assignedTeamMemberIds?.includes(member.id)).map(p => (
                      <Link key={p.id} href={`/projects/${p.id}`} className="block p-3 rounded-[3px] bg-white border border-slate-100 font-arial"><div className="font-black text-slate-700 text-[12px]">{p.projectName}</div><p className="text-[7px] font-black text-slate-400 uppercase">{p.client} • {p.progress}% Complete</p></Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  );
}
