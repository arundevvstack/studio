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
  User as UserIcon,
  ArrowUpDown
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

  const sortedAndGroupedByClient = useMemo(() => {
    const groups: Record<string, Project[]> = {};
    filteredProjects.forEach(p => {
      const client = p.client || 'General';
      if (!groups[client]) groups[client] = [];
      groups[client].push(p);
    });

    return Object.entries(groups).sort((a, b) => {
      if (sortOrder === 'asc') return a[0].localeCompare(b[0]);
      return b[0].localeCompare(a[0]);
    });
  }, [filteredProjects, sortOrder]);

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
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="p-6 glass-card bg-rose-50/50 text-rose-600 border-rose-100">
          <ShieldAlert size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-700 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 text-sm font-medium max-w-xl opacity-70">
            Project data requires higher clearance.
          </p>
        </div>
        <Button variant="outline" className="glass-pill h-10 px-6 font-black text-xs ios-clickable" onClick={() => window.location.reload()}>
          <RotateCcw size={16} className="mr-2" /> Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black tracking-tighter text-slate-700 leading-tight">Projects</h1>
          <p className="text-slate-500 text-sm font-medium opacity-80">Managing global production assets grouped by client.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex glass-pill p-1 border-slate-200/50">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-full h-8 w-8 p-0 ios-clickable"
              onClick={() => setView('table')}
            >
              <List size={16} />
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-full h-8 w-8 p-0 ios-clickable"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
          <Button className="glass-pill h-10 px-6 shadow-sm font-black bg-primary text-xs ios-clickable" asChild>
            <Link href="/projects/new">
              <Plus size={16} className="mr-2" strokeWidth={3} />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 glass-pill p-3 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search projects or clients..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0 h-10 text-sm font-bold placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="glass-pill h-10 px-4 gap-2 border-slate-200 hover:bg-white font-black text-[10px] uppercase tracking-widest ios-clickable"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown size={14} className="text-primary" />
            Client {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>
          <Button variant="ghost" className="glass-pill h-10 px-6 gap-2 border-slate-200 hover:bg-white font-black text-xs ios-clickable">
            <Filter size={16} />
            Refine
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-[5px] animate-pulse bg-white/50 border-none shadow-sm" />
          ))}
        </div>
      ) : sortedAndGroupedByClient.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-[5px] border border-dashed">
           <p className="text-sm font-medium italic">No projects found.</p>
           <Button variant="link" className="mt-1 font-bold text-xs" asChild><Link href="/projects/new">Create your first production</Link></Button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedAndGroupedByClient.map(([client, clientProjects]) => (
            <div key={client} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-[3px] bg-white shadow-sm flex items-center justify-center text-primary">
                  <UserIcon size={14} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-700 tracking-tight">{client}</h2>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{clientProjects.length} active projects</p>
                </div>
              </div>

              {view === 'table' ? (
                <Card className="glass-card border-none overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/30 h-10">
                      <TableRow className="hover:bg-transparent border-b border-slate-200/40">
                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400 pl-6">Production Entity</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Current Phase</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Optimization</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Delivery</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400 text-right pr-6">Execute</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientProjects.map((project) => (
                        <TableRow key={project.id} className="hover:bg-white/40 transition-all border-b border-slate-200/20 last:border-0 h-14">
                          <TableCell className="pl-6">
                            <Link href={`/projects/${project.id}`} className="block group ios-clickable">
                              <div className="flex items-center gap-2">
                                <div className="font-arial font-black text-slate-700 group-hover:text-primary transition-colors text-[12px] tracking-tight">{project.projectName}</div>
                                {project.isRecurring && (
                                  <Badge className="bg-primary/5 text-primary border-none rounded-[3px] h-4 px-1 flex items-center gap-0.5">
                                    <RefreshCcw size={8} />
                                    <span className="text-[7px] font-black">RECURRING</span>
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">ID: {project.id.slice(0, 6)}</div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                              {project.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[180px]">
                            <div className="space-y-1.5 pr-6">
                              <div className="flex items-center justify-between text-[8px] font-black text-primary uppercase tracking-widest">
                                <span>{project.progress}% Sync</span>
                              </div>
                              <Progress value={project.progress} className="h-1 bg-slate-200/30" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                              <Clock size={12} className="text-primary opacity-60" />
                              {formatDeadline(project.deadline)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" className="h-8 w-8 glass-pill hover:bg-white hover:text-primary transition-all ios-clickable" asChild>
                              <Link href={`/projects/${project.id}`}>
                                <ChevronRight size={16} />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clientProjects.map((project) => (
                    <Card key={project.id} className="glass-card group border-none ios-card-hover overflow-hidden">
                      <div className="h-40 bg-slate-200 relative overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${project.id}/600/400`} 
                          alt="Production Still" 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" 
                          data-ai-hint="production still"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                          <Badge className={cn("rounded-full border-none font-black text-[8px] uppercase tracking-widest shadow-lg px-2.5 py-0.5", getStageColor(project.stage))}>
                            {project.stage}
                          </Badge>
                          {project.isRecurring && (
                            <Badge className="rounded-full bg-white/90 text-primary border-none shadow-lg px-2 h-5 flex items-center gap-1">
                              <RefreshCcw size={10} strokeWidth={3} />
                              <span className="text-[8px] font-black uppercase">Recur</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <Link href={`/projects/${project.id}`} className="ios-clickable inline-block">
                            <h3 className="font-arial font-black text-[12px] group-hover:text-primary transition-colors tracking-tight text-slate-700">{project.projectName}</h3>
                          </Link>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phase: {project.stage}</p>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-200/20">
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Optimization</span>
                            <span className="text-primary">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1 bg-slate-200/30" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             <Clock size={12} className="text-primary opacity-60" />
                             {formatDeadline(project.deadline)}
                          </div>
                          <Button variant="ghost" size="icon" className="glass-pill h-8 w-8 text-slate-400 hover:bg-primary hover:text-white transition-all ios-clickable" asChild>
                             <Link href={`/projects/${project.id}`}>
                                <ChevronRight size={16} />
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
