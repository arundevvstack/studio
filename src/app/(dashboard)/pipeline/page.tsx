
"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Workflow,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  AlertCircle
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

export default function PipelinePage() {
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const { user, isAdmin, isUserLoading } = useUser();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pipelineQuery = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null;
    
    const baseRef = collection(db, 'projects');
    
    if (isAdmin) {
      return query(baseRef, orderBy('createdAt', 'desc'));
    }

    return query(
      baseRef,
      where('assignedTeamMemberIds', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid, isAdmin, isUserLoading]);

  const { data: allProjects, isLoading, error } = useCollection<Project>(pipelineQuery);

  const filteredProjects = useMemo(() => {
    return (allProjects || [])
      .filter(p => ['Pitch', 'Discussion'].includes(p.stage))
      .filter(p => 
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.client?.toLowerCase().includes(search.toLowerCase())
      );
  }, [allProjects, search]);

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Discussion': return 'bg-blue-50 text-blue-700 border-blue-100';
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
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="p-6 rounded-[5px] bg-destructive/10 text-destructive">
          <AlertCircle size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Pipeline Sync Error</h2>
          <p className="text-muted-foreground text-sm font-medium max-w-md">
            {error.message.includes('permission') 
              ? "Clearance level restriction."
              : `System error: ${error.message}`}
          </p>
        </div>
        <Button onClick={() => window.location.reload()} className="rounded-[3px] px-6 h-10 font-black text-xs">
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Strategic Pipeline</h1>
            <Badge className="bg-purple-100 text-purple-700 border-none rounded-[3px] px-2 py-0.5 font-bold text-[8px] uppercase flex items-center gap-1">
              <Sparkles size={10} /> Early Stage
            </Badge>
          </div>
          <p className="text-slate-500 text-sm font-medium">Managing high-potential opportunities in Pitch & Discussion phases.</p>
        </div>
        <Button className="rounded-[3px] h-10 px-6 shadow-sm font-black bg-primary text-xs" asChild>
          <Link href="/projects/new">
            <Workflow size={16} className="mr-2" strokeWidth={3} />
            Draft New Pitch
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-3 rounded-[5px] border border-white/40 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search pending pitches and discussions..." 
            className="pl-10 border-none bg-slate-100/80 rounded-[3px] h-10 text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-[3px] h-10 px-6 gap-2 border-slate-200 bg-white font-bold text-xs">
          <Filter size={16} />
          Refine
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 h-12">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[350px] font-black uppercase tracking-widest text-[9px] text-slate-400 pl-6">Potential Production</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Pipeline Phase</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Confidence</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Est. Kickoff</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400 text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center animate-pulse font-bold text-slate-400 uppercase tracking-widest text-[10px]">Syncing Pipeline Intelligence...</TableCell></TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic font-medium text-xs">No projects in the early-stage pipeline.</TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-white/40 transition-all border-b border-slate-50 last:border-0 group h-14">
                  <TableCell className="pl-6">
                    <Link href={`/projects/${project.id}`} className="block group">
                      <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm tracking-tight">{project.projectName}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{project.client}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-[3px] px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                      {project.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="space-y-1 pr-6">
                      <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1 rounded-full bg-slate-100" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                      <Clock size={12} className="text-primary" />
                      {formatDeadline(project.deadline)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[3px] hover:bg-white hover:text-primary transition-all ios-interactive" asChild>
                      <Link href={`/projects/${project.id}`}><ChevronRight size={16} /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
