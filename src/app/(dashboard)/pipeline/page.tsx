"use client";

import { useState, useEffect } from 'react';
import { 
  Workflow,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-context';

export default function PipelinePage() {
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pipelineQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    
    // We filter for 'Pitch' and 'Discussion' stages. 
    // Firestore doesn't support OR on multiple 'where' with different values for the same field directly in a simple way without 'in'.
    return query(
      collection(db, 'projects'),
      where('stage', 'in', ['Pitch', 'Discussion']),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: projects, isLoading, error } = useCollection<Project>(pipelineQuery);

  const filteredProjects = (projects || []).filter(p => 
    (p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())) &&
    (!isAdmin ? p.assignedTeamMemberIds?.includes(user?.uid || '') : true)
  );

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black">Pipeline Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Access to early-stage pipeline data is restricted based on assignment clearance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Strategic Pipeline</h1>
            <Badge className="bg-purple-100 text-purple-700 border-none rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase flex items-center gap-1.5">
              <Sparkles size={12} /> Early Stage
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">Managing high-potential opportunities in Pitch & Discussion phases.</p>
        </div>
        <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-all" asChild>
          <Link href="/projects/new">
            <Workflow size={20} className="mr-2" strokeWidth={3} />
            Draft New Pitch
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/40 shadow-sm premium-shadow">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search pending pitches and discussions..." 
            className="pl-14 border-none bg-slate-100/80 rounded-2xl h-14 text-lg font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-14 px-8 gap-2 border-slate-200 bg-white hover:bg-slate-50 font-bold">
          <Filter size={20} />
          Refine
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Pitch Volume</p>
            <div className="text-4xl font-black text-slate-900">{(projects || []).filter(p => p.stage === 'Pitch').length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Discussion Active</p>
            <div className="text-4xl font-black text-slate-900">{(projects || []).filter(p => p.stage === 'Discussion').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-slate-50/50 h-16">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[350px] font-black uppercase tracking-widest text-[10px] text-slate-400 pl-10">Potential Production</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Pipeline Phase</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Confidence</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Est. Kickoff</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 text-right pr-10">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-64 text-center animate-pulse">Syncing Pipeline...</TableCell></TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-400 italic">No projects currently in the early-stage pipeline.</TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-white/40 transition-all border-b border-slate-50 last:border-0 group h-24">
                  <TableCell className="pl-10">
                    <Link href={`/projects/${project.id}`} className="block group">
                      <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg tracking-tight">{project.projectName}</div>
                      <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-0.5">{project.client}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest border-none", getStageColor(project.stage))}>
                      {project.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1.5 pr-8">
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5 rounded-full bg-slate-100" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5 text-sm text-slate-500 font-bold">
                      <Clock size={16} className="text-primary" />
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
    </div>
  );
}
