"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project, Task, ProjectStage, ProjectPriority } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Settings2
} from 'lucide-react';
import { summarizeProjectStatus } from '@/ai/flows/summarize-project-status';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const STAGES: ProjectStage[] = ['Discussion', 'Pre Production', 'Production', 'Post Production', 'Released'];
const PRIORITIES: ProjectPriority[] = ['Low', 'Medium', 'High'];

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const db = useFirestore();
  const { toast } = useToast();
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Progress Slider State
  const [localProgress, setLocalProgress] = useState<number | null>(null);

  // Phase (formerly Task) Creation State
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
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
    return query(collection(db, 'projects', id, 'tasks'), orderBy('createdAt', 'desc'));
  }, [db, id]);

  const { data: phases, isLoading: isPhasesLoading } = useCollection<Task>(phasesQuery);

  // Sync local progress with project progress when not dragging
  useEffect(() => {
    if (project && localProgress === null) {
      setLocalProgress(project.progress || 0);
    }
  }, [project, localProgress]);

  // Sync scope data when project loads
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
    updateProject(db, id, { stage: val as ProjectStage });
    toast({ title: "Lifecycle Updated", description: `Production stage shifted to ${val}.` });
  };

  const handlePriorityChange = (val: string) => {
    if (!project || !db) return;
    updateProject(db, id, { priority: val as ProjectPriority });
    toast({ title: "Priority Shifted", description: `Project criticality updated to ${val}.` });
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !project || !newPhaseName.trim()) return;

    setIsCreatingPhase(true);
    const newPhaseRef = doc(collection(db, 'projects', id, 'tasks'));
    const phaseData: Partial<Task> = {
      id: newPhaseRef.id,
      projectId: id,
      name: newPhaseName,
      completed: false,
      priority: 'Medium',
      projectAssignedTeamMemberIds: project.assignedTeamMemberIds || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDoc(newPhaseRef, phaseData)
      .then(() => {
        toast({ title: "Phase Deployed", description: "New production phase added to pipeline." });
        setNewPhaseName('');
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
      toast({ title: "Scope Modified", description: "Project parameters updated successfully." });
      setIsModifyScopeOpen(false);
    } catch (err) {
      toast({ title: "Update Failed", description: "Could not sync scope changes.", variant: "destructive" });
    } finally {
      setIsUpdatingScope(false);
    }
  };

  const togglePhaseStatus = (phase: Task) => {
    if (!db) return;
    const phaseRef = doc(db, 'projects', id, 'tasks', phase.id);
    updateDoc(phaseRef, { 
      completed: !phase.completed,
      updatedAt: serverTimestamp()
    }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: phaseRef.path,
        operation: 'update',
        requestResourceData: { completed: !phase.completed }
      }));
    });
  };

  const deletePhase = (phaseId: string) => {
    if (!db) return;
    const phaseRef = doc(db, 'projects', id, 'tasks', phaseId);
    deleteDoc(phaseRef).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: phaseRef.path,
        operation: 'delete'
      }));
    });
  };

  const handleGenerateSummary = async () => {
    if (!project) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeProjectStatus({
        description: project.description || 'No description provided',
        tasks: (phases || []).map(t => t.name),
        notes: ['Project assets reviewed', 'Initial pipeline established']
      });
      setAiSummary(result.summary);
      toast({ title: "AI Sync", description: "Project intelligence updated." });
    } catch (err) {
      toast({ title: "Error", description: "Could not generate AI summary", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'TBD';
    if (deadline?.seconds) return new Date(deadline.seconds * 1000).toLocaleDateString();
    return new Date(deadline).toLocaleDateString();
  };

  if (isProjectLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Production Data...</p>
      </div>
    );
  }

  if (projectError || (!project && !isProjectLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black">Production Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This project identifier does not exist or you lack sufficient clearance to access its assets.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/projects">Return to Portfolio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl border hover:bg-white shadow-sm h-12 w-12 transition-all">
            <Link href="/projects"><ChevronLeft size={24} /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black tracking-tighter text-slate-900">{project.projectName}</h1>
               <Badge className="rounded-lg bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-2.5">
                 Entity #{id.slice(0, 8)}
               </Badge>
            </div>
            <p className="text-muted-foreground text-sm font-bold flex items-center gap-2">
              <span className="text-primary font-black">{project.client}</span>
              <span className="text-slate-300">•</span>
              <Calendar size={14} className="text-slate-400" /> 
              <span>Target Delivery: {formatDeadline(project.deadline)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isModifyScopeOpen} onOpenChange={setIsModifyScopeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl font-bold border-slate-200 h-11 px-6 hover:bg-slate-50 gap-2">
                <Settings2 size={16} />
                Modify Scope
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl premium-shadow max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Modify Production Scope</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateScope} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Identifier</Label>
                    <Input 
                      value={scopeData.projectName}
                      onChange={(e) => setScopeData({ ...scopeData, projectName: e.target.value })}
                      className="rounded-2xl h-12 font-bold px-5 bg-slate-50 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Strategic Client</Label>
                    <Input 
                      value={scopeData.client}
                      onChange={(e) => setScopeData({ ...scopeData, client: e.target.value })}
                      className="rounded-2xl h-12 font-bold px-5 bg-slate-50 border-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cap-Ex Budget ($)</Label>
                  <Input 
                    type="number"
                    value={scopeData.budget}
                    onChange={(e) => setScopeData({ ...scopeData, budget: e.target.value })}
                    className="rounded-2xl h-12 font-bold px-5 bg-slate-50 border-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Executive Brief</Label>
                  <Textarea 
                    value={scopeData.description}
                    onChange={(e) => setScopeData({ ...scopeData, description: e.target.value })}
                    className="rounded-2xl min-h-[120px] font-medium p-5 bg-slate-50 border-none"
                  />
                </div>
                <DialogFooter className="pt-4 gap-3">
                  <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsModifyScopeOpen(false)}>Discard</Button>
                  <Button type="submit" className="rounded-xl font-black px-8 bg-primary shadow-lg shadow-primary/20" disabled={isUpdatingScope}>
                    {isUpdatingScope ? 'Syncing...' : 'Update Parameters'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button className="rounded-2xl font-black shadow-xl shadow-primary/20 h-11 px-8 bg-primary hover:scale-[1.02] transition-all">
            Execute Release
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-xl overflow-hidden p-2">
             <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-8">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Production Intelligence</CardTitle>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time throughput metrics</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-2xl text-primary bg-primary/5 hover:bg-primary/10 gap-2 border-none font-bold px-4 h-10"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                >
                  <Sparkles size={16} className={cn(isSummarizing && "animate-spin")} />
                  {isSummarizing ? 'Synthesizing...' : 'AI Summary'}
                </Button>
             </CardHeader>
             <CardContent className="space-y-8 px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-3xl bg-slate-50 border border-white/50 group hover:bg-white transition-all">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Phase</p>
                    <Select value={project.stage} onValueChange={handleStageChange}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-lg text-slate-800 focus:ring-0 shadow-none ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {STAGES.map(stage => (
                          <SelectItem key={stage} value={stage} className="rounded-xl font-bold py-2.5">{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-white/50 group hover:bg-white transition-all">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Priority</p>
                    <Select value={project.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0 shadow-none ring-offset-0">
                        <Badge className={cn(
                          "rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest cursor-pointer",
                          project.priority === 'High' ? "bg-rose-50 text-rose-600 border-none" : "bg-indigo-50 text-indigo-600 border-none"
                        )}>{project.priority} Matrix</Badge>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority} className="rounded-xl font-bold py-2.5">{priority} Priority</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-white/50 group hover:bg-white transition-all">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Cap-Ex Spend</p>
                    <p className="text-lg font-black text-slate-800">${(project.budget || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h4 className="font-black text-slate-900">Optimization Progress</h4>
                      <p className="text-xs font-medium text-muted-foreground">Adjust production completion slider</p>
                    </div>
                    <span className="text-4xl font-black text-primary tracking-tighter">
                      {localProgress !== null ? localProgress : project.progress || 0}%
                    </span>
                  </div>
                  <Slider 
                    value={[localProgress !== null ? localProgress : project.progress || 0]} 
                    max={100} 
                    step={1} 
                    onValueChange={handleSliderChange}
                    onValueCommit={handleUpdateProgressCommit}
                    className="py-4 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">
                    <span>Kickoff</span>
                    <span>Midpoint</span>
                    <span>Market Ready</span>
                  </div>
                </div>

                {aiSummary && (
                   <div className="mt-8 p-8 rounded-[2rem] bg-slate-900 text-white border border-white/10 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full"></div>
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <Sparkles size={20} className="text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Executive Intelligence Report</h4>
                      </div>
                      <p className="text-base leading-relaxed text-slate-300 italic relative z-10 font-medium font-serif">"{aiSummary}"</p>
                   </div>
                )}
             </CardContent>
          </Card>

          <Tabs defaultValue="phases" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b rounded-none w-full justify-start mb-8">
              <TabsTrigger value="phases" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none pb-5 px-0 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-slate-900 transition-all">
                <Layers size={16} className="mr-2" /> Phases
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none pb-5 px-0 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-slate-900 transition-all">
                <History size={16} className="mr-2" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none pb-5 px-0 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-slate-900 transition-all">
                <MessageSquare size={16} className="mr-2" /> Notes
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none pb-5 px-0 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-slate-900 transition-all">
                <FileText size={16} className="mr-2" /> Digital Assets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="phases" className="mt-0 focus-visible:ring-0">
               <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-xl">
                 <CardContent className="p-4">
                    <div className="divide-y divide-slate-100">
                      {isPhasesLoading ? (
                        <div className="p-10 text-center text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">
                          Synchronizing Production Phases...
                        </div>
                      ) : !phases || phases.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground font-medium italic">
                          No phases have been deployed for this mission.
                        </div>
                      ) : (
                        phases.map((phase) => (
                          <div key={phase.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all rounded-2xl group cursor-pointer">
                             <div className="flex items-center gap-5" onClick={() => togglePhaseStatus(phase)}>
                                <div className={cn(
                                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                  phase.completed ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "border-slate-200 group-hover:border-primary/50"
                                )}>
                                  {phase.completed && <CheckSquare size={14} strokeWidth={3} />}
                                </div>
                                <div>
                                  <p className={cn("text-base font-bold text-slate-900 transition-all", phase.completed && "line-through text-slate-400")}>{phase.name}</p>
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                    <Clock size={10} /> {formatDeadline(phase.createdAt)}
                                  </p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                               <Badge variant="outline" className={cn(
                                 "rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none",
                                 phase.completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                               )}>{phase.completed ? 'Completed' : 'Pending'}</Badge>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-500 rounded-lg" onClick={() => deletePhase(phase.id)}>
                                 <Trash2 size={14} />
                               </Button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-6 border-t border-slate-50 flex justify-center">
                       <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
                         <DialogTrigger asChild>
                           <Button variant="ghost" className="text-primary text-xs font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 rounded-xl h-12 px-8">
                             <Plus className="h-4 w-4" strokeWidth={3} /> Add Production Phase
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="rounded-[2rem] border-none shadow-2xl premium-shadow">
                           <DialogHeader>
                             <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Deploy New Phase</DialogTitle>
                           </DialogHeader>
                           <form onSubmit={handleCreatePhase} className="space-y-6 pt-4">
                             <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phase Name</Label>
                               <Input 
                                 placeholder="e.g. Master Color Grading" 
                                 value={newPhaseName}
                                 onChange={(e) => setNewPhaseName(e.target.value)}
                                 className="rounded-2xl h-14 font-bold px-6 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary"
                                 autoFocus
                               />
                             </div>
                             <DialogFooter className="pt-4 gap-3">
                               <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsPhaseDialogOpen(false)}>Abort</Button>
                               <Button type="submit" className="rounded-xl font-black px-8 bg-primary shadow-lg shadow-primary/20" disabled={isCreatingPhase || !newPhaseName.trim()}>
                                 {isCreatingPhase ? 'Deploying...' : 'Confirm Phase'}
                               </Button>
                             </DialogFooter>
                           </form>
                         </DialogContent>
                       </Dialog>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
           <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-xl p-2">
              <CardHeader className="pt-6 px-6">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Assigned Talent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 px-6 pb-6">
                 {[
                   { name: 'Marcus Jordan', role: 'Executive Director', avatar: 'https://picsum.photos/seed/m1/100/100' },
                   { name: 'Sarah Lyons', role: 'Creative Lead', avatar: 'https://picsum.photos/seed/s2/100/100' },
                   { name: 'James Wilson', role: 'Strategic Producer', avatar: 'https://picsum.photos/seed/j3/100/100' },
                 ].map((member, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-primary/20 transition-all">
                        <img src={member.avatar} alt={member.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{member.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{member.role}</p>
                      </div>
                   </div>
                 ))}
                 <Button variant="outline" className="w-full rounded-2xl h-12 mt-4 text-xs font-black uppercase tracking-widest border-dashed border-2 hover:border-solid hover:bg-slate-50 transition-all">Manage Personnel</Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"></div>
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-10">
                 <div>
                    <p className="text-4xl font-black tracking-tighter text-white">${(project.budget || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Authorized Deployment</p>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                       <span className="text-slate-500">Resource Consumption</span>
                       <span className="text-primary">45%</span>
                    </div>
                    <Progress value={45} className="h-2.5 bg-slate-800 rounded-full" />
                 </div>
                 <Button className="w-full rounded-2xl h-14 text-xs font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white hover:text-slate-900 border-none transition-all shadow-xl">
                    Generate Financials
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
