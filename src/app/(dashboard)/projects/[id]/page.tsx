"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Project, Task, ProjectStage, ProjectPriority, TeamMember } from '@/lib/types';
import { updateProject } from '@/lib/firebase/firestore';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  MessageSquare,
  History,
  FileText,
  Plus,
  ShieldAlert,
  Clock,
  Trash2,
  Layers,
  Settings2,
  User as UserIcon,
  UserPlus,
  ArrowRightCircle,
  Trophy
} from 'lucide-react';
import { summarizeProjectStatus } from '@/ai/flows/summarize-project-status';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const STAGES: ProjectStage[] = ['Pitch', 'Discussion', 'Pre Production', 'Production', 'Post Production', 'Released'];
const PRIORITIES: ProjectPriority[] = ['Low', 'Medium', 'High'];

const STAGE_PROGRESS_MAP: Record<ProjectStage, number> = {
  'Pitch': 5,
  'Discussion': 15,
  'Pre Production': 35,
  'Production': 65,
  'Post Production': 85,
  'Released': 100
};

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const db = useFirestore();
  const { toast } = useToast();
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [localProgress, setLocalProgress] = useState<number | null>(null);

  // Objective Creation State
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDueDate, setNewPhaseDueDate] = useState('');
  const [selectedPhaseTeamMembers, setSelectedPhaseTeamMembers] = useState<string[]>([]);
  const [isCreatingPhase, setIsCreatingPhase] = useState(false);

  // Modify Scope State
  const [isModifyScopeOpen, setIsModifyScopeOpen] = useState(false);
  const [isUpdatingScope, setIsUpdatingScope] = useState(false);
  const [scopeData, setScopeData] = useState({
    projectName: '',
    client: '',
    budget: '',
    description: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'projects', id);
  }, [db, id]);

  const { data: project, isLoading: isProjectLoading, error: projectError } = useDoc<Project>(projectRef);

  const phasesQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(collection(db, 'projects', id, 'tasks'), orderBy('createdAt', 'asc'));
  }, [db, id]);

  const { data: phases, isLoading: isPhasesLoading } = useCollection<Task>(phasesQuery);

  const teamQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'teamMembers'), where('status', '==', 'Authorized'), orderBy('name', 'asc'));
  }, [db]);

  const { data: allTeamMembers } = useCollection<TeamMember>(teamQuery);

  const currentStagePhases = useMemo(() => {
    if (!phases || !project) return [];
    return phases.filter(p => p.stage === project.stage);
  }, [phases, project?.stage]);

  useEffect(() => {
    if (project && localProgress === null) {
      setLocalProgress(project.progress || 0);
    }
  }, [project, localProgress]);

  useEffect(() => {
    if (project) {
      setScopeData({
        projectName: project.projectName || '',
        client: project.client || '',
        budget: project.budget?.toString() || '',
        description: project.description || '',
      });
    }
  }, [project]);

  const allPhasesCompleted = currentStagePhases.length > 0 && currentStagePhases.every(p => p.completed);
  const currentStageIndex = project ? STAGES.indexOf(project.stage) : -1;
  const nextStage = (project && currentStageIndex < STAGES.length - 1) ? STAGES[currentStageIndex + 1] : null;

  const handleSliderChange = (val: number[]) => {
    setLocalProgress(val[0]);
  };

  const handleUpdateProgressCommit = (val: number[]) => {
    if (!project || !db) return;
    const newProgress = val[0];
    setLocalProgress(newProgress);
    updateProject(db, id, { progress: newProgress });
  };

  const handleStageChange = (val: string) => {
    if (!project || !db) return;
    const nextStage = val as ProjectStage;
    const newProgress = STAGE_PROGRESS_MAP[nextStage] || project.progress;
    updateProject(db, id, { stage: nextStage, progress: newProgress });
    setLocalProgress(newProgress);
    toast({ title: "Lifecycle Updated", description: `Production phase shifted to ${nextStage}.` });
  };

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    handleStageChange(nextStage);
    toast({ 
      title: "Strategic Advancement", 
      description: `Project transitioned to ${nextStage}.`,
    });
  };

  const handlePriorityChange = (val: string) => {
    if (!project || !db) return;
    updateProject(db, id, { priority: val as ProjectPriority });
    toast({ title: "Priority Shifted", description: `Criticality updated to ${val}.` });
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !project || !newPhaseName.trim()) return;

    setIsCreatingPhase(true);
    const newPhaseRef = doc(collection(db, 'projects', id, 'tasks'));
    const phaseData: Partial<Task> = {
      id: newPhaseRef.id,
      projectId: id,
      stage: project.stage,
      name: newPhaseName,
      completed: false,
      priority: 'Medium',
      dueDate: newPhaseDueDate ? new Date(newPhaseDueDate).toISOString() : null,
      assignedTeamMemberIds: selectedPhaseTeamMembers,
      projectAssignedTeamMemberIds: project.assignedTeamMemberIds || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDoc(newPhaseRef, phaseData)
      .then(() => {
        toast({ title: "Objective Deployed", description: `Objective added to ${project.stage}.` });
        setNewPhaseName('');
        setNewPhaseDueDate('');
        setSelectedPhaseTeamMembers([]);
        setIsPhaseDialogOpen(false);
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: newPhaseRef.path,
          operation: 'create',
          requestResourceData: phaseData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsCreatingPhase(false));
  };

  const handleUpdateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !project) return;
    setIsUpdatingScope(true);
    try {
      await updateProject(db, id, {
        projectName: scopeData.projectName,
        client: scopeData.client,
        budget: Number(scopeData.budget),
        description: scopeData.description,
      });
      toast({ title: "Scope Modified", description: "Project parameters updated." });
      setIsModifyScopeOpen(false);
    } catch (err) {
      toast({ title: "Update Failed", description: "Sync error.", variant: "destructive" });
    } finally {
      setIsUpdatingScope(false);
    }
  };

  const togglePhaseStatus = (phase: Task) => {
    if (!db) return;
    const phaseRef = doc(db, 'projects', id, 'tasks', phase.id);
    updateDoc(phaseRef, { completed: !phase.completed, updatedAt: serverTimestamp() });
  };

  const handleToggleTaskAssignee = (phaseId: string, memberId: string, currentAssignees: string[]) => {
    if (!db) return;
    const phaseRef = doc(db, 'projects', id, 'tasks', phaseId);
    const newAssignees = currentAssignees.includes(memberId)
      ? currentAssignees.filter(uid => uid !== memberId)
      : [...currentAssignees, memberId];
    
    updateDoc(phaseRef, { 
      assignedTeamMemberIds: newAssignees, 
      updatedAt: serverTimestamp() 
    }).catch(err => {
      const permissionError = new FirestorePermissionError({
        path: phaseRef.path,
        operation: 'update',
        requestResourceData: { assignedTeamMemberIds: newAssignees }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deletePhase = (phaseId: string) => {
    if (!db) return;
    const phaseRef = doc(db, 'projects', id, 'tasks', phaseId);
    deleteDoc(phaseRef);
  };

  const handleGenerateSummary = async () => {
    if (!project) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeProjectStatus({
        description: project.description || 'No description provided',
        tasks: (currentStagePhases || []).map(t => t.name),
        notes: ['Project assets reviewed']
      });
      setAiSummary(result.summary);
      toast({ title: "AI Sync", description: "Intelligence report generated." });
    } catch (err) {
      toast({ title: "Error", description: "Could not generate summary", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'TBD';
    const date = deadline.seconds ? new Date(deadline.seconds * 1000) : new Date(deadline);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleToggleMemberSelection = (uid: string) => {
    setSelectedPhaseTeamMembers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  if (isProjectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 rounded-[3px] border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Accessing Production Assets...</p>
      </div>
    );
  }

  if (projectError || (!project && !isProjectLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ShieldAlert size={48} className="text-rose-500" />
        <h2 className="text-xl font-black text-slate-700">Entity Not Found</h2>
        <Button asChild variant="outline" className="rounded-[3px] h-9 text-xs">
          <Link href="/projects">Return to Pipeline</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-[3px] border bg-white h-9 w-9">
            <Link href="/projects"><ChevronLeft size={18} /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-black tracking-tight text-slate-700">{project.projectName}</h1>
               <Badge className="rounded-[2px] bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                 #{id.slice(0, 6)}
               </Badge>
            </div>
            <p className="text-slate-500 text-[10px] font-bold flex items-center gap-2 mt-0.5">
              <span className="text-primary">{project.client}</span>
              <span className="text-slate-200">•</span>
              <Clock size={10} className="text-slate-400" /> 
              <span>Target: {formatDeadline(project.deadline)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-[3px] font-black text-[9px] uppercase h-8 px-3 gap-1.5" onClick={() => setIsModifyScopeOpen(true)}>
            <Settings2 size={12} /> Scope
          </Button>
          <Button size="sm" className="rounded-[3px] font-black text-[9px] uppercase h-8 px-4 bg-primary shadow-sm shadow-primary/10">
            Execute Release
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b border-slate-50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700">Throughput Analysis</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-[3px] text-primary bg-primary/5 text-[8px] font-black uppercase tracking-widest px-2.5 h-7 gap-1.5"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                >
                  <Sparkles size={10} className={cn(isSummarizing && "animate-spin")} />
                  {isSummarizing ? 'Sync...' : 'AI Intel'}
                </Button>
             </CardHeader>
             <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-[3px] bg-slate-50 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifecycle Phase</p>
                    <Select value={project.stage} onValueChange={handleStageChange}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-sm text-slate-700 focus:ring-0 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[5px] border-none shadow-2xl">
                        {STAGES.map(stage => (
                          <SelectItem key={stage} value={stage} className="font-bold text-[10px]">{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-[3px] bg-slate-50 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Criticality</p>
                    <Select value={project.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-sm text-slate-700 focus:ring-0 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[5px] border-none shadow-2xl">
                        {PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority} className="font-bold text-[10px]">{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-[3px] bg-slate-50 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cap-Ex Budget</p>
                    <p className="text-sm font-black text-slate-700">${(project.budget || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between px-1">
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-700">Optimization Progress</h4>
                    <span className="text-xl font-black text-primary tracking-tighter">
                      {localProgress !== null ? localProgress : project.progress || 0}%
                    </span>
                  </div>
                  <Slider 
                    value={[localProgress !== null ? localProgress : project.progress || 0]} 
                    max={100} 
                    step={1} 
                    onValueChange={handleSliderChange}
                    onValueCommit={handleUpdateProgressCommit}
                    className="cursor-pointer"
                  />
                </div>

                {aiSummary && (
                   <div className="mt-2 p-4 rounded-[3px] bg-slate-900 text-white relative overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-[30px] rounded-full"></div>
                      <div className="flex items-center gap-1.5 mb-2 relative z-10">
                        <Sparkles size={12} className="text-primary" />
                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Executive Summary</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300 italic font-medium">"{aiSummary}"</p>
                   </div>
                )}
             </CardContent>
          </Card>

          <Tabs defaultValue="objectives" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-4 border-b rounded-none w-full justify-start mb-4">
              <TabsTrigger value="objectives" className="rounded-none pb-2 px-0 font-black text-[9px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-slate-700 transition-all">
                <Layers size={12} className="mr-1.5" /> Mission Objectives
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none pb-2 px-0 font-black text-[9px] uppercase tracking-widest text-slate-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-slate-700 transition-all">
                <History size={12} className="mr-1.5" /> Log History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="objectives" className="mt-0 focus-visible:ring-0">
               {allPhasesCompleted && nextStage && (
                 <div className="mb-4 p-4 rounded-[3px] bg-emerald-50 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                          <Trophy size={18} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-slate-700 tracking-tight">Phase Cleared</h3>
                          <p className="text-[10px] text-slate-500 font-medium">All components for <span className="font-bold text-emerald-600">{project.stage}</span> synced.</p>
                       </div>
                    </div>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[8px] uppercase tracking-widest px-4 h-8 rounded-[3px] gap-1.5 shadow-sm"
                      onClick={handleAdvanceStage}
                    >
                      Advance to {nextStage} <ArrowRightCircle size={14} />
                    </Button>
                 </div>
               )}

               <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                 <CardHeader className="py-3 px-5 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Elements</p>
                       <h4 className="text-xs font-black text-slate-700">{project.stage} Objectives</h4>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-none rounded-[2px] text-[8px] font-black uppercase px-1.5 py-0.5">
                       {currentStagePhases?.filter(p => p.completed).length || 0} / {currentStagePhases?.length || 0} SYNCED
                    </Badge>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {isPhasesLoading ? (
                        <div className="p-6 text-center animate-pulse font-black text-[9px] uppercase tracking-widest text-slate-400">Syncing...</div>
                      ) : !currentStagePhases || currentStagePhases.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-bold text-[10px] italic">No objectives defined for {project.stage}.</div>
                      ) : (
                        currentStagePhases.map((phase) => (
                          <div key={phase.id} className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition-all group">
                             <div className="flex items-center gap-3 flex-1">
                                <div 
                                  className={cn(
                                    "w-4 h-4 rounded-[2px] border-2 flex items-center justify-center transition-all cursor-pointer",
                                    phase.completed ? "bg-primary border-primary text-white" : "border-slate-200 group-hover:border-primary/50"
                                  )}
                                  onClick={() => togglePhaseStatus(phase)}
                                >
                                  {phase.completed && <CheckSquare size={10} strokeWidth={3} />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className={cn("text-[12px] font-arial font-black text-slate-700", phase.completed && "line-through text-slate-400 opacity-60")}>{phase.name}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <Clock size={8} /> {phase.dueDate ? formatDeadline(phase.dueDate) : 'No Deadline'}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center -space-x-1">
                                        {phase.assignedTeamMemberIds?.map(uid => {
                                          const member = allTeamMembers?.find(m => m.id === uid);
                                          return (
                                            <div key={uid} className="w-4 h-4 rounded-full border border-white bg-slate-100 overflow-hidden" title={member?.name}>
                                              <img src={member?.photoURL || `https://picsum.photos/seed/${uid}/40/40`} className="w-full h-full object-cover" />
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                                            <UserPlus size={8} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48 rounded-[3px] border-none shadow-2xl" align="start">
                                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-widest text-slate-400">Assignees</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {allTeamMembers?.map(member => (
                                            <DropdownMenuCheckboxItem
                                              key={member.id}
                                              checked={phase.assignedTeamMemberIds?.includes(member.id)}
                                              onCheckedChange={() => handleToggleTaskAssignee(phase.id, member.id, phase.assignedTeamMemberIds || [])}
                                              className="font-bold text-[10px] py-1.5"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-100">
                                                  <img src={member.photoURL || `https://picsum.photos/seed/${member.id}/40/40`} className="w-full h-full object-cover" />
                                                </div>
                                                {member.name}
                                              </div>
                                            </DropdownMenuCheckboxItem>
                                          ))}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-1.5">
                               <Badge className={cn(
                                 "rounded-[2px] text-[7px] font-black uppercase tracking-widest border-none px-1 h-3.5",
                                 phase.completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                               )}>{phase.completed ? 'Success' : 'Active'}</Badge>
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-rose-500" onClick={() => deletePhase(phase.id)}>
                                 <Trash2 size={12} />
                               </Button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-50 flex justify-center">
                       <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
                         <DialogTrigger asChild>
                           <Button variant="ghost" className="text-primary text-[8px] font-black uppercase tracking-widest gap-1.5 hover:bg-primary/5 rounded-[3px] h-8 px-4">
                             <Plus className="h-2.5 w-2.5" strokeWidth={3} /> Define Objective
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm">
                           <DialogHeader>
                             <DialogTitle className="text-lg font-black text-slate-700 tracking-tight">New Objective</DialogTitle>
                           </DialogHeader>
                           <form onSubmit={handleCreatePhase} className="space-y-4 pt-1">
                             <div className="space-y-1">
                               <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Objective Title</Label>
                               <Input 
                                 placeholder="e.g. Master Grade Assembly" 
                                 value={newPhaseName}
                                 onChange={(e) => setNewPhaseName(e.target.value)}
                                 className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-xs"
                                 autoFocus
                               />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1">
                                 <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Deadline</Label>
                                 <Input 
                                   type="date"
                                   value={newPhaseDueDate}
                                   onChange={(e) => setNewPhaseDueDate(e.target.value)}
                                   className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-[10px]"
                                 />
                               </div>
                               <div className="space-y-1">
                                 <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Priority</Label>
                                 <Select defaultValue="Medium">
                                   <SelectTrigger className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-[10px]">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-[3px] border-none shadow-xl">
                                      <SelectItem value="Low" className="font-bold text-[10px]">Low</SelectItem>
                                      <SelectItem value="Medium" className="font-bold text-[10px]">Medium</SelectItem>
                                      <SelectItem value="High" className="font-bold text-[10px]">High</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>
                             </div>

                             <div className="space-y-1.5">
                               <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Assignees</Label>
                               <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1 bg-slate-50/50 p-1.5 rounded-[3px]">
                                 {allTeamMembers?.map(member => (
                                   <div key={member.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-[2px] transition-colors">
                                      <Checkbox 
                                        checked={selectedPhaseTeamMembers.includes(member.id)}
                                        onCheckedChange={() => handleToggleMemberSelection(member.id)}
                                        className="rounded-[2px] border-slate-300 h-3 w-3"
                                      />
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-200">
                                          <img src={member.photoURL || `https://picsum.photos/seed/${member.id}/40/40`} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-700">{member.name}</span>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                             </div>

                             <DialogFooter className="pt-1 gap-2">
                               <Button type="button" variant="ghost" className="rounded-[3px] font-bold text-[10px] h-8" onClick={() => setIsPhaseDialogOpen(false)}>Abort</Button>
                               <Button type="submit" className="rounded-[3px] font-black text-[10px] px-4 h-8 bg-primary" disabled={isCreatingPhase || !newPhaseName.trim()}>
                                 {isCreatingPhase ? 'Syncing...' : 'Deploy'}
                               </Button>
                             </DialogFooter>
                           </form>
                         </DialogContent>
                       </Dialog>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0 focus-visible:ring-0">
               <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                  <CardContent className="p-6 text-center space-y-2">
                     <History size={32} className="mx-auto text-slate-200" />
                     <div>
                        <p className="text-xs font-black text-slate-700">Logs Synchronizing</p>
                        <p className="text-[10px] text-slate-400 font-medium">History tracking is pending initialization.</p>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
           <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
              <CardHeader className="py-3 px-4 border-b border-slate-50">
                <CardTitle className="text-[8px] font-black uppercase tracking-widest text-slate-400">Strategic Talent</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                 {allTeamMembers?.filter(m => project.assignedTeamMemberIds?.includes(m.id)).map((member) => (
                   <div key={member.id} className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-[3px] overflow-hidden border border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
                        <img src={member.photoURL || `https://picsum.photos/seed/${member.id}/80/80`} alt={member.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-700 group-hover:text-primary transition-colors leading-tight">{member.name}</p>
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{member.role}</p>
                      </div>
                   </div>
                 ))}
                 <Button variant="outline" className="w-full rounded-[3px] h-8 mt-1 text-[8px] font-black uppercase tracking-widest border-dashed border-2 hover:bg-slate-50 transition-all">Manage Staff</Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-lg rounded-[5px] bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_5px_rgba(244,63,74,0.5)]"></div>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-[8px] font-black uppercase tracking-widest text-slate-500">Financial Ledger</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                 <div>
                    <p className="text-2xl font-black tracking-tighter text-white">${(project.budget || 0).toLocaleString()}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Deployment Limit</p>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">Allocation</span>
                       <span className="text-primary">45%</span>
                    </div>
                    <Progress value={45} className="h-0.5 bg-slate-800 rounded-full" />
                 </div>
                 <Button className="w-full rounded-[3px] h-8 text-[8px] font-black uppercase tracking-widest bg-white/5 hover:bg-white hover:text-slate-900 border-none transition-all">
                    Generate Billing
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      <Dialog open={isModifyScopeOpen} onOpenChange={setIsModifyScopeOpen}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-700 tracking-tight">Modify Parameters</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateScope} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Identifier</Label>
                <Input 
                  value={scopeData.projectName}
                  onChange={(e) => setScopeData({ ...scopeData, projectName: e.target.value })}
                  className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Strategic Client</Label>
                <Input 
                  value={scopeData.client}
                  onChange={(e) => setScopeData({ ...scopeData, client: e.target.value })}
                  className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Cap-Ex Budget ($)</Label>
              <Input 
                type="number"
                value={scopeData.budget}
                onChange={(e) => setScopeData({ ...scopeData, budget: e.target.value })}
                className="rounded-[3px] h-9 font-bold px-3 bg-slate-50 border-none text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Briefing</Label>
              <Textarea 
                value={scopeData.description}
                onChange={(e) => setScopeData({ ...scopeData, description: e.target.value })}
                className="rounded-[3px] min-h-[80px] font-medium p-3 bg-slate-50 border-none text-xs"
              />
            </div>
            <DialogFooter className="pt-1 gap-2">
              <Button type="button" variant="ghost" className="rounded-[3px] font-bold text-[10px] h-8" onClick={() => setIsModifyScopeOpen(false)}>Discard</Button>
              <Button type="submit" className="rounded-[3px] font-black text-[10px] px-4 h-8 bg-primary" disabled={isUpdatingScope}>
                {isUpdatingScope ? 'Syncing...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
