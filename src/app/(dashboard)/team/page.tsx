
"use client";

import { useState } from 'react';
import { 
  Users, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  Target,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { TeamMember, Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TeamPage() {
  const db = useFirestore();

  const teamQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'teamMembers'), 
      where('status', '==', 'Authorized'),
      orderBy('name', 'asc')
    );
  }, [db]);

  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: members, isLoading: membersLoading } = useCollection<TeamMember>(teamQuery);
  const { data: allProjects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const getMemberProjects = (memberId: string) => {
    return (allProjects || []).filter(p => p.assignedTeamMemberIds?.includes(memberId));
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-50 text-purple-700';
      case 'Released': return 'bg-emerald-50 text-emerald-700';
      case 'Discussion': return 'bg-blue-50 text-blue-700';
      case 'Pre Production': return 'bg-indigo-50 text-indigo-700';
      case 'Production': return 'bg-amber-50 text-amber-700';
      case 'Post Production': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const isLoading = membersLoading || projectsLoading;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">Production Personnel</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Strategic talent mapping and real-time workload synchronization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-[5px] animate-pulse bg-white/50 border border-slate-100" />
          ))
        ) : members?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-[5px] border border-dashed">
            <p className="text-lg font-medium italic">No authorized personnel records found.</p>
          </div>
        ) : (
          members?.map((member) => {
            const assignedProjects = getMemberProjects(member.id);
            return (
              <Card key={member.id} className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden group hover:shadow-md transition-all duration-300">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="projects" className="border-none">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-16 shrink-0">
                          <div className="absolute inset-0 bg-primary/10 rounded-[5px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative w-16 h-16 rounded-[5px] overflow-hidden border-2 border-white shadow-sm z-10">
                            <img 
                              src={member.photoURL || `https://picsum.photos/seed/${member.id}/200/200`} 
                              alt={member.name} 
                              className="object-cover w-full h-full" 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-slate-900">{member.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="rounded-[3px] bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-2 h-5">
                              {member.role}
                            </Badge>
                            <Badge variant="outline" className="rounded-[3px] border-slate-200 text-slate-400 font-bold text-[9px] uppercase h-5">
                              {assignedProjects.length} Active Missions
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <AccordionTrigger className="hover:no-underline p-0">
                          <Button variant="outline" size="sm" className="rounded-[5px] border-slate-200 h-10 px-4 font-black text-[10px] uppercase gap-2 hover:bg-slate-50">
                            <Layers size={14} className="text-primary" />
                            View Loadout
                            <ChevronDown size={14} className="ml-1 opacity-50" />
                          </Button>
                        </AccordionTrigger>
                        <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[5px] text-slate-400 hover:text-primary hover:bg-primary/5">
                          <Mail size={18} />
                        </Button>
                      </div>
                    </div>

                    <AccordionContent className="px-6 pb-8 pt-2">
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {assignedProjects.length === 0 ? (
                            <div className="col-span-full py-8 text-center bg-slate-50/50 rounded-[5px] border border-dashed border-slate-200">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active production assignments detected.</p>
                            </div>
                          ) : assignedProjects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                              <div className="p-4 rounded-[5px] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all group/node">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight group-hover/node:text-primary transition-colors">{project.projectName}</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.client}</p>
                                  </div>
                                  <Badge className={cn("rounded-[3px] text-[8px] font-black uppercase tracking-widest border-none px-1.5 h-4", getStageColor(project.stage))}>
                                    {project.stage}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1"><Target size={10} className="text-primary" /> Progress</span>
                                    <span className="text-slate-900">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-1 bg-slate-100 rounded-full" />
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-400 tracking-widest">
                                    <Clock size={10} />
                                    Updated: {project.updatedAt?.seconds ? new Date(project.updatedAt.seconds * 1000).toLocaleDateString() : 'TBD'}
                                  </div>
                                  <ChevronDown size={12} className="text-slate-200 -rotate-90" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
