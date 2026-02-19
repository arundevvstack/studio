"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  RefreshCcw,
  User as UserIcon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function ProjectsPage() {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const { user, isAdmin, isUserLoading } = useUser();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null;
    const projectsRef = collection(db, 'projects');
    if (isAdmin) return query(projectsRef, orderBy('createdAt', 'desc'));
    return query(projectsRef, where('assignedTeamMemberIds', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user?.uid, isAdmin, isUserLoading]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const filteredProjects = (projects || []).filter(p => 
    p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );

  // Grouping logic for "Projects under Clients"
  const groupedByClient = useMemo(() => {
    const groups: Record<string, Project[]> = {};
    filteredProjects.forEach(p => {
      const client = p.client || 'General';
      if (!groups[client]) groups[client] = [];
      groups[client].push(p);
    });
    return groups;
  }, [filteredProjects]);

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-50/80 text-purple-600';
      case 'Released': return 'bg-emerald-50/80 text-emerald-600';
      case 'Discussion': return 'bg-blue-50/80 text-blue-600';
      case 'Pre Production': return 'bg-indigo-50/80 text-indigo-600';
      case 'Production': return 'bg-amber-50/80 text-amber-600';
      case 'Post Production': return 'bg-rose-50/80 text-rose-600';
      default: return 'bg-slate-100/80 text-slate-600';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'TBD';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
        <div className="p-8 glass-card bg-rose-50/50 text-rose-600 border-rose-100">
          <ShieldAlert size={64} />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl opacity-70">
            Project data requires higher clearance.
          </p>
        </div>
        <Button variant="outline" className="glass-pill h-14 px-8 font-black ios-clickable" onClick={() => window.location.reload()}>
          <RotateCcw size={20} className="mr-3" /> Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Projects</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Managing global production assets grouped by client.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex glass-pill p-1.5 border-slate-200/50">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-full h-10 w-10 p-0 ios-clickable"
              onClick={() => setView('table')}
            >
              <List size={20} />
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-full h-10 w-10 p-0 ios-clickable"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={20} />
            </Button>
          </div>
          <Button className="glass-pill h-14 px-10 shadow-2xl shadow-primary/25 font-black bg-primary ios-clickable" asChild>
            <Link href="/projects/new">
              <Plus size={22} className="mr-3" strokeWidth={3} />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 glass-pill p-5 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search projects or clients..." 
            className="pl-14 border-none bg-transparent focus-visible:ring-0 h-12 text-lg font-bold placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="glass-pill h-12 px-8 gap-2 border-slate-200 hover:bg-white font-black ios-clickable">
          <Filter size={20} />
          Refine
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[380px] rounded-[2.5rem] animate-pulse bg-white/50 border-none shadow-sm" />
          ))}
        </div>
      ) : Object.keys(groupedByClient).length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-[2.5rem] border border-dashed">
           <p className="text-lg font-medium italic">No projects found.</p>
           <Button variant="link" className="mt-2 font-bold" asChild><Link href="/projects/new">Create your first production</Link></Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedByClient).map(([client, clientProjects]) => (
            <div key={client} className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{client}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{clientProjects.length} active projects</p>
                </div>
              </div>

              {view === 'table' ? (
                <Card className="glass-card border-none overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/30 h-16">
                      <TableRow className="hover:bg-transparent border-b border-slate-200/40">
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 pl-10">Production Entity</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Current Phase</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Optimization</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Delivery</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 text-right pr-10">Execute</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientProjects.map((project) => (
                        <TableRow key={project.id} className="hover:bg-white/40 transition-all border-b border-slate-200/20 last:border-0 h-24">
                          <TableCell className="pl-10">
                            <Link href={`/projects/${project.id}`} className="block group ios-clickable">
                              <div className="flex items-center gap-2">
                                <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-xl tracking-tighter">{project.projectName}</div>
                                {project.isRecurring && (
                                  <Badge className="bg-primary/5 text-primary border-none rounded-lg h-5 px-1.5 flex items-center gap-1">
                                    <RefreshCcw size={10} />
                                    <span className="text-[8px] font-black">RECURRING</span>
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {project.id.slice(0, 8)}</div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                              {project.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[240px]">
                            <div className="space-y-2.5 pr-8">
                              <div className="flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                                <span>{project.progress}% Complete</span>
                              </div>
                              <Progress value={project.progress} className="h-2 rounded-full bg-slate-200/30" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                              <Clock size={14} className="text-primary opacity-60" />
                              {formatDeadline(project.deadline)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <Button variant="ghost" size="icon" className="h-11 w-11 glass-pill hover:bg-white hover:text-primary transition-all ios-clickable" asChild>
                              <Link href={`/projects/${project.id}`}>
                                <ChevronRight size={22} />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {clientProjects.map((project) => (
                    <Card key={project.id} className="glass-card group border-none ios-card-hover overflow-hidden">
                      <div className="h-56 bg-slate-200 relative overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${project.id}/800/600`} 
                          alt="Production Still" 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" 
                          data-ai-hint="production still"
                        />
                        <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
                          <Badge className={cn("rounded-full border-none font-black text-[9px] uppercase tracking-widest shadow-xl px-4 py-1.5", getStageColor(project.stage))}>
                            {project.stage}
                          </Badge>
                          {project.isRecurring && (
                            <Badge className="rounded-full bg-white/90 text-primary border-none shadow-xl px-3 h-7 flex items-center gap-1.5">
                              <RefreshCcw size={12} strokeWidth={3} />
                              <span className="text-[9px] font-black uppercase">Recurring</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-8 space-y-6">
                        <div>
                          <Link href={`/projects/${project.id}`} className="ios-clickable inline-block">
                            <h3 className="font-black text-2xl mb-1 group-hover:text-primary transition-colors tracking-tight text-slate-900">{project.projectName}</h3>
                          </Link>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase: {project.stage}</p>
                        </div>
                        
                        <div className="space-y-3 pt-3 border-t border-slate-200/20">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Optimization</span>
                            <span className="text-primary">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2 rounded-full bg-slate-200/30" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                             <Clock size={14} className="text-primary opacity-60" />
                             {formatDeadline(project.deadline)}
                          </div>
                          <Button variant="ghost" size="icon" className="glass-pill h-10 w-10 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all ios-clickable" asChild>
                             <Link href={`/projects/${project.id}`}>
                                <ChevronRight size={20} />
                             </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
