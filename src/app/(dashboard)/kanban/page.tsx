"use client";

import { useState, useEffect } from 'react';
import { Project, ProjectStage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, GripVertical, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-context';

const STAGES: ProjectStage[] = ['Pitch', 'Discussion', 'Pre Production', 'Production', 'Post Production', 'Released'];

export default function KanbanPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    const projectsRef = collection(db, 'projects');
    if (!isAdmin) {
      return query(
        projectsRef,
        where('assignedTeamMemberIds', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );
    }
    return query(projectsRef, orderBy('createdAt', 'desc'));
  }, [db, user?.uid, isAdmin]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const projectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = (projects || []).filter(p => p.stage === stage);
    return acc;
  }, {} as Record<ProjectStage, Project[]>);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-destructive bg-destructive/10';
      case 'Medium': return 'text-orange-500 bg-orange-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'N/A';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Board visibility is restricted based on project assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground">Visualize and manage your project workflow stages.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{stage}</h3>
                <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px]">
                  {projectsByStage[stage]?.length || 0}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical size={16} />
              </Button>
            </div>

            <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px] border border-dashed border-slate-300">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground/30 italic text-xs">
                  Loading...
                </div>
              ) : projectsByStage[stage].length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground/30 italic text-xs">
                  Empty stage
                </div>
              ) : (
                projectsByStage[stage].map((project) => (
                  <Card key={project.id} className="border-none shadow-sm premium-shadow rounded-xl bg-card hover:ring-2 hover:ring-primary/20 transition-all cursor-grab active:cursor-grabbing group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{project.projectName}</h4>
                        </Link>
                        <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={cn("text-[9px] h-4 rounded px-1 border-none", getPriorityColor(project.priority))}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] h-4 rounded px-1 border-none bg-muted/50 text-muted-foreground">
                          {project.client}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span>{project.progress}% Complete</span>
                        </div>
                        <Progress value={project.progress} className="h-1 rounded-full bg-slate-100" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <Clock size={12} />
                            {formatDeadline(project.deadline)}
                         </div>
                         <div className="flex -space-x-1.5">
                            {[1, 2].map(i => (
                               <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                  <img src={`https://picsum.photos/seed/${project.id}${i}/100/100`} alt="Avatar" />
                               </div>
                            ))}
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              <Button variant="ghost" className="w-full justify-start gap-2 h-10 rounded-xl text-muted-foreground hover:bg-slate-200/50 hover:text-slate-900 border-none transition-all" asChild>
                <Link href="/projects/new">
                  <Plus size={16} />
                  <span className="text-xs font-semibold">Quick add</span>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}