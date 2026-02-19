
"use client";

import { useState } from 'react';
import { 
  Users, 
  Mail, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  Target,
  Clock,
  Briefcase,
  Activity
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1400px] mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-tight">Production Team</h1>
          <p className="text-slate-500 text-xs font-medium opacity-80">Strategic talent mapping and real-time workload synchronization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-[3px] bg-slate-100 text-slate-600 border-none font-black text-[8px] uppercase h-7 px-2">
            {members?.length || 0} Personnel
          </Badge>
          <Badge className="rounded-[3px] bg-primary/10 text-primary border-none font-black text-[8px] uppercase h-7 px-2">
            {allProjects?.length || 0} Assets Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-[5px] animate-pulse bg-white/50 border border-slate-100" />
          ))
        ) : members?.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-[5px] border border-dashed border-slate-200">
            <Users size={32} className="mb-3 opacity-20" />
            <p className="text-xs font-bold italic">No authorized personnel detected.</p>
          </div>
        ) : (
          members?.map((member) => {
            const assignedProjects = getMemberProjects(member.id);
            return (
              <Card key={member.id} className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden group hover:shadow-md transition-all duration-300">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="projects" className="border-none">
                    <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0">
                          <div className="relative w-10 h-10 rounded-[3px] overflow-hidden border border-white shadow-sm z-10">
                            <img 
                              src={member.photoURL || `https://picsum.photos/seed/${member.id}/100/100`} 
                              alt={member.name} 
                              className="object-cover w-full h-full" 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-black tracking-tight text-slate-900">{member.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className="rounded-[2px] bg-primary/5 text-primary border-none font-black text-[7px] uppercase tracking-widest px-1.5 h-4">
                              {member.role}
                            </Badge>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Briefcase size={8} /> {assignedProjects.length} Assignments
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
                          <Button variant="outline" size="sm" className="rounded-[3px] border-slate-200 h-8 px-3 font-black text-[8px] uppercase gap-1.5 hover:bg-slate-50">
                            <Activity size={12} className="text-primary" />
                            Workload
                            <ChevronDown size={12} className="ml-0.5 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                          </Button>
                        </AccordionTrigger>
                        <div className="h-6 w-[1px] bg-slate-100 mx-1 hidden md:block"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[3px] text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                          <Mail size={14} />
                        </Button>
                      </div>
                    </div>

                    <AccordionContent className="px-3 pb-4 pt-0">
                      <div className="space-y-2 animate-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center gap-1.5 px-1 mb-1">
                           <Layers size={10} className="text-slate-400" />
                           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Current Nodes</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {assignedProjects.length === 0 ? (
                            <div className="col-span-full py-4 text-center bg-slate-50/50 rounded-[3px] border border-dashed border-slate-200">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No active nodes.</p>
                            </div>
                          ) : assignedProjects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`} className="block">
                              <div className="p-3 rounded-[3px] bg-white border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all group/node relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-slate-100 group-hover/node:bg-primary transition-colors" />
                                
                                <div className="flex justify-between items-start mb-2 pl-1">
                                  <div className="space-y-0.5">
                                    <h4 className="font-black text-slate-900 text-xs tracking-tight group-hover/node:text-primary transition-colors truncate max-w-[150px]">
                                      {project.projectName}
                                    </h4>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{project.client}</p>
                                  </div>
                                  <Badge className={cn("rounded-[2px] text-[7px] font-black uppercase tracking-widest border-none px-1 h-3.5", getStageColor(project.stage))}>
                                    {project.stage}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 pl-1">
                                  <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1"><Target size={8} className="text-primary" /> Progress</span>
                                    <span className="text-slate-900">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-0.5 bg-slate-50 rounded-full" />
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between pl-1">
                                  <div className="flex items-center gap-1 text-[7px] font-black uppercase text-slate-400 tracking-widest">
                                    <Clock size={8} />
                                    Sync: {project.updatedAt?.seconds ? new Date(project.updatedAt.seconds * 1000).toLocaleDateString() : 'TBD'}
                                  </div>
                                  <ShieldCheck size={10} className="text-slate-200 group-hover/node:text-primary/40 transition-colors" />
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
