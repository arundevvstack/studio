"use client";

import { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  RotateCcw
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
    if (isAdmin) {
      return query(projectsRef, orderBy('createdAt', 'desc'));
    }
    
    return query(
      projectsRef,
      where('assignedTeamMemberIds', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid, isAdmin, isUserLoading]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const filteredProjects = (projects || []).filter(p => 
    p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-100 text-purple-700';
      case 'Released': return 'bg-emerald-100 text-emerald-700';
      case 'Discussion': return 'bg-blue-100 text-blue-700';
      case 'Pre Production': return 'bg-indigo-100 text-indigo-700';
      case 'Production': return 'bg-amber-100 text-amber-700';
      case 'Post Production': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'TBD';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-rose-50 text-rose-600 premium-shadow">
          <ShieldAlert size={64} />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 text-xl font-medium max-w-xl">
            Portfolio data requires high-clearance authentication or specific project assignments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-[1.5rem] h-14 px-8 font-black" onClick={() => window.location.reload()}>
            <RotateCcw size={20} className="mr-3" /> Retry Sync
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1400px] mx-auto pb-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">Project Portfolio</h1>
          <p className="text-slate-500 text-xl font-medium">Managing all studio productions from kickoff to final release.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/50 backdrop-blur-xl p-2 rounded-[1.5rem] border border-slate-200/50">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl h-11 w-11 p-0"
              onClick={() => setView('table')}
            >
              <List size={22} />
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl h-11 w-11 p-0"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={22} />
            </Button>
          </div>
          <Button className="rounded-[1.5rem] h-14 px-10 shadow-2xl shadow-primary/25 font-black bg-primary hover:scale-[1.02] transition-all border-none text-white" asChild>
            <Link href="/projects/new">
              <Plus size={24} className="mr-3" strokeWidth={3} />
              New Production
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 bg-white/60 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/40 shadow-sm ios-blur">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search production entities or clients..." 
            className="pl-16 border-none bg-slate-200/50 rounded-[2rem] h-16 text-xl font-bold placeholder:text-slate-400 focus-visible:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-[2rem] h-16 px-10 gap-3 border-slate-200 bg-white/80 hover:bg-white font-black text-lg">
          <Filter size={24} />
          Refine
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] rounded-[3.5rem] animate-pulse bg-white/50 border-none" />
          ))}
        </div>
      ) : view === 'table' ? (
        <Card className="ios-card border-none">
          <Table>
            <TableHeader className="bg-slate-50/50 h-20">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[400px] font-black uppercase tracking-widest text-[11px] text-slate-400 pl-12">Entity Brief</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[11px] text-slate-400">Current Phase</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[11px] text-slate-400">Optimization</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[11px] text-slate-400">Target Release</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[11px] text-slate-400 text-right pr-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[400px] text-center text-slate-400 italic text-xl font-medium">
                    No matching productions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-white/60 transition-all border-b border-slate-50 last:border-0 h-28">
                    <TableCell className="pl-12">
                      <Link href={`/projects/${project.id}`} className="block group ios-interactive">
                        <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-2xl tracking-tighter leading-tight">{project.projectName}</div>
                        <div className="text-sm text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{project.client}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-2xl px-5 py-2 text-[12px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                        {project.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[280px]">
                      <div className="space-y-3 pr-10">
                        <div className="flex items-center justify-between text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                          <span>{project.progress}% Complete</span>
                        </div>
                        <Progress value={project.progress} className="h-3 rounded-full bg-slate-100/80" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-base text-slate-500 font-bold">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100/80 flex items-center justify-center text-primary">
                          <Clock size={20} strokeWidth={2.5} />
                        </div>
                        {formatDeadline(project.deadline)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-12">
                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.5rem] hover:bg-white hover:text-primary transition-all border border-transparent hover:border-slate-100 ios-interactive" asChild>
                        <Link href={`/projects/${project.id}`}>
                          <ChevronRight size={28} />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="ios-card group border-none hover:translate-y-[-10px] transition-all duration-500">
              <div className="h-64 bg-slate-200 relative overflow-hidden">
                <img src={`https://picsum.photos/seed/${project.id}/800/600`} alt="Production Still" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 right-6">
                  <Badge className={cn("rounded-2xl border-none font-black text-[11px] uppercase tracking-widest shadow-2xl px-5 py-2", getStageColor(project.stage))}>
                    {project.stage}
                  </Badge>
                </div>
              </div>
              <div className="p-10 space-y-8">
                <div>
                  <Link href={`/projects/${project.id}`} className="ios-interactive inline-block">
                    <h3 className="font-black text-3xl mb-2 group-hover:text-primary transition-colors tracking-tight text-slate-900 leading-tight">{project.projectName}</h3>
                  </Link>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.25em]">{project.client}</p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Production Optimization</span>
                    <span className="text-primary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3 rounded-full bg-slate-100/80" />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3 text-sm font-black text-slate-500 uppercase tracking-widest">
                     <Clock size={20} className="text-primary" />
                     {formatDeadline(project.deadline)}
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-[1.25rem] h-12 w-12 bg-slate-100/50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm ios-interactive" asChild>
                     <Link href={`/projects/${project.id}`}>
                        <ChevronRight size={24} />
                     </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
