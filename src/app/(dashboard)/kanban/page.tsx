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
import { updateProject } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const STAGES: ProjectStage[] = ['Pitch', 'Discussion', 'Pre Production', 'Production', 'Post Production', 'Released'];

export default function KanbanPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<ProjectStage | null>(null);
  
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

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
      case 'High': return 'text-rose-600 bg-rose-50/50';
      case 'Medium': return 'text-amber-600 bg-amber-50/50';
      default: return 'text-blue-600 bg-blue-50/50';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'N/A';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a small drag ghosting effect
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProjectId(null);
    setDropTargetStage(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, stage: ProjectStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetStage !== stage) {
      setDropTargetStage(stage);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: ProjectStage) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    setDropTargetStage(null);

    if (!projectId || !db) return;

    const project = projects?.find(p => p.id === projectId);
    if (project && project.stage !== targetStage) {
      // Optimistic update handled by Firestore local cache
      updateProject(db, projectId, { stage: targetStage });
      
      toast({
        title: "Stage Updated",
        description: `"${project.projectName}" moved to ${targetStage}.`,
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-8 rounded-[2.5rem] bg-rose-50/50 text-rose-600 border border-rose-100">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md font-medium">
          Board visibility is restricted based on production clearance levels.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-10 overflow-hidden animate-in fade-in duration-700 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Board</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Visualize and manage your production pipeline.</p>
        </div>
        <Button className="glass-pill h-14 px-8 shadow-2xl shadow-primary/25 font-black bg-primary ios-clickable" asChild>
          <Link href="/projects/new">
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Quick Add
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex gap-8 overflow-x-auto pb-10 scrollbar-hide px-2">
        {STAGES.map((stage) => (
          <div 
            key={stage} 
            className="flex-shrink-0 w-80 flex flex-col gap-6"
            onDragOver={(e) => handleDragOver(e, stage)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-[11px] uppercase tracking-[0.25em] text-slate-400">{stage}</h3>
                <Badge className="rounded-full bg-slate-200/50 text-slate-600 border-none px-2.5 h-6 text-[10px] font-black">
                  {projectsByStage[stage]?.length || 0}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-30 hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </Button>
            </div>

            <div className={cn(
              "flex-1 rounded-[2.5rem] p-4 flex flex-col gap-4 min-h-[600px] transition-all duration-300",
              dropTargetStage === stage 
                ? "bg-primary/5 ring-2 ring-primary/20 ring-inset border-none shadow-inner" 
                : "bg-white/40 border border-white/60 shadow-sm"
            )}>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : projectsByStage[stage].length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-2">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Drop Here</p>
                </div>
              ) : (
                projectsByStage[stage].map((project) => (
                  <Card 
                    key={project.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "border-none shadow-sm ios-card-hover rounded-3xl bg-white/80 backdrop-blur-xl group cursor-grab active:cursor-grabbing overflow-hidden",
                      draggedProjectId === project.id && "ring-2 ring-primary/50"
                    )}
                  >
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <h4 className="font-black text-base text-slate-900 group-hover:text-primary transition-colors tracking-tight leading-snug">
                            {project.projectName}
                          </h4>
                        </Link>
                        <GripVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={cn("text-[9px] h-5 rounded-lg px-2 font-black uppercase tracking-widest border-none shadow-none", getPriorityColor(project.priority))}>
                          {project.priority}
                        </Badge>
                        <Badge className="text-[9px] h-5 rounded-lg px-2 font-black uppercase tracking-widest border-none bg-slate-100 text-slate-500 shadow-none">
                          {project.client}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{project.progress}% Complete</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5 rounded-full bg-slate-100" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <Clock size={12} className="text-primary opacity-60" />
                            {formatDeadline(project.deadline)}
                         </div>
                         <div className="flex -space-x-2">
                            {[1, 2].map(i => (
                               <div key={i} className="w-7 h-7 rounded-xl border-2 border-white bg-slate-100 overflow-hidden shadow-sm ring-1 ring-slate-100">
                                  <img 
                                    src={`https://picsum.photos/seed/${project.id}${i}/100/100`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-14 rounded-3xl text-slate-400 hover:bg-white hover:text-primary border-none transition-all ios-interactive mt-auto" 
                asChild
              >
                <Link href="/projects/new">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">New Entry</span>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
