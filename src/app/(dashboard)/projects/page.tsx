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
  Eye,
  Trash2,
  Edit2,
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
import { Card, CardContent } from '@/components/ui/card';
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
    
    // Admins see all. Members only see assigned.
    if (isAdmin) {
      return query(
        collection(db, 'projects'), 
        orderBy('createdAt', 'desc')
      );
    }
    
    return query(
      collection(db, 'projects'),
      where('assignedTeamMemberIds', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user, isAdmin, isUserLoading]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const filteredProjects = (projects || []).filter(p => 
    p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Released': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Discussion': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Pre Production': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Production': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Post Production': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'TBD';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-in fade-in duration-500">
        <div className="p-5 rounded-3xl bg-destructive/10 text-destructive shadow-lg shadow-destructive/5">
          <ShieldAlert size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sync Encountered a Blocker</h2>
          <p className="text-muted-foreground text-center max-w-md font-medium leading-relaxed">
            The studio is unable to provision your production portfolio at this time. This may be due to clearance issues or required composite indexes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold" onClick={() => window.location.reload()}>
            <RotateCcw size={18} className="mr-2" /> Retry Session
          </Button>
          <Button asChild className="rounded-2xl h-12 px-8 font-black bg-primary">
            <Link href="/dashboard">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Project Portfolio</h1>
          <p className="text-muted-foreground text-lg font-medium">Centralized command for all active studio productions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl h-9 w-9 p-0"
              onClick={() => setView('table')}
            >
              <List size={18} />
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl h-9 w-9 p-0"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} />
            </Button>
          </div>
          <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 font-black bg-primary hover:scale-[1.02] transition-all" asChild>
            <Link href="/projects/new">
              <Plus size={20} className="mr-2" strokeWidth={3} />
              Launch Production
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/40 shadow-sm premium-shadow">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by project identifier or strategic client..." 
            className="pl-14 border-none bg-slate-100/80 rounded-2xl h-14 text-lg font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-14 px-8 gap-2 border-slate-200 bg-white hover:bg-slate-50 font-bold">
          <Filter size={20} />
          Refine
        </Button>
      </div>

      {(isLoading || isUserLoading) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-96 rounded-[3rem] animate-pulse bg-slate-100/50 border-none" />
          ))}
        </div>
      ) : view === 'table' ? (
        <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-slate-50/50 h-16">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[350px] font-black uppercase tracking-widest text-[10px] text-slate-400 pl-10">Production Entity</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Current Phase</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Completion</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Delivery Date</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 text-right pr-10">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center text-slate-400 italic text-lg font-medium">
                    No active productions found in this workspace.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-white/40 transition-all border-b border-slate-50 last:border-0 group h-24">
                    <TableCell className="pl-10">
                      <Link href={`/projects/${project.id}`} className="block group">
                        <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg tracking-tight leading-none">{project.projectName}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">{project.client}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                        {project.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[220px]">
                      <div className="space-y-2.5 pr-8">
                        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="text-primary">{project.progress}% Optimized</span>
                        </div>
                        <Progress value={project.progress} className="h-2 rounded-full bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5 text-sm text-slate-500 font-bold">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                          <Clock size={16} strokeWidth={2.5} />
                        </div>
                        {formatDeadline(project.deadline)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-white hover:text-primary transition-all" asChild>
                        <Link href={`/projects/${project.id}`}><ChevronRight size={20} /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-none shadow-2xl premium-shadow rounded-[3rem] bg-white/70 backdrop-blur-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-500 group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <img src={`https://picsum.photos/seed/${project.id}/800/600`} alt="Production Frame" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-5 right-5">
                  <Badge className={cn("rounded-2xl border-none font-black text-[10px] uppercase tracking-[0.2em] shadow-lg px-4 py-2", getStageColor(project.stage))}>
                    {project.stage}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-8">
                <Link href={`/projects/${project.id}`}>
                  <h3 className="font-black text-2xl mb-1 group-hover:text-primary transition-colors tracking-tight text-slate-900 leading-tight">{project.projectName}</h3>
                </Link>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{project.client}</p>
                
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Optimization</span>
                      <span className="text-primary">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2.5 rounded-full bg-slate-100" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <Clock size={16} className="text-primary" />
                       {formatDeadline(project.deadline)}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}