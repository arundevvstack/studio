"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project } from '@/lib/types';
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
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  Users, 
  CheckSquare, 
  MessageSquare,
  History,
  FileText,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { summarizeProjectStatus } from '@/ai/flows/summarize-project-status';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const db = useFirestore();
  const { toast } = useToast();
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'projects', id);
  }, [db, id]);

  const { data: project, isLoading, error } = useDoc<Project>(projectRef);

  const handleUpdateProgress = (val: number[]) => {
    if (!project || !db) return;
    const newProgress = val[0];
    updateProject(db, id, { progress: newProgress });
  };

  const handleGenerateSummary = async () => {
    if (!project) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeProjectStatus({
        description: project.description || 'No description provided',
        tasks: ['Complete initial shoot', 'Audio sync', 'Color grading'],
        notes: ['Client requested more contrast', 'Music track licensed']
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Production Data...</p>
      </div>
    );
  }

  if (error || (!project && !isLoading)) {
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
          <Button variant="outline" className="rounded-2xl font-bold border-slate-200 h-11 px-6 hover:bg-slate-50">
            Modify Scope
          </Button>
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
                    <p className="text-lg font-black text-slate-800">{project.stage}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-white/50 group hover:bg-white transition-all">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Priority</p>
                    <Badge className={cn(
                      "rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                      project.priority === 'High' ? "bg-rose-50 text-rose-600 border-none" : "bg-indigo-50 text-indigo-600 border-none"
                    )}>{project.priority} Matrix</Badge>
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
                    <span className="text-4xl font-black text-primary tracking-tighter">{project.progress}%</span>
                  </div>
                  <Slider 
                    value={[project.progress || 0]} 
                    max={100} 
                    step={1} 
                    onValueChange={handleUpdateProgress}
                    className="py-4"
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

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b rounded-none w-full justify-start mb-8">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none pb-5 px-0 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-slate-900 transition-all">
                <CheckSquare size={16} className="mr-2" /> Tasks
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
            
            <TabsContent value="tasks" className="mt-0 focus-visible:ring-0">
               <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-xl">
                 <CardContent className="p-4">
                    <div className="divide-y divide-slate-100">
                      {[
                        { title: 'Executive Brief Approval', status: 'Completed', date: 'Feb 12' },
                        { title: 'Asset Localization V1', status: 'In Progress', date: 'Feb 15' },
                        { title: 'Final Master Rendering', status: 'Pending', date: 'Feb 18' },
                        { title: 'Global CDN Deployment', status: 'Pending', date: 'Feb 22' },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all rounded-2xl group cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                task.status === 'Completed' ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "border-slate-200 group-hover:border-primary/50"
                              )}>
                                {task.status === 'Completed' && <CheckSquare size={14} strokeWidth={3} />}
                              </div>
                              <div>
                                <p className={cn("text-base font-bold text-slate-900 transition-all", task.status === 'Completed' && "line-through text-slate-400")}>{task.title}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{task.date}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className={cn(
                             "rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none",
                             task.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                           )}>{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 border-t border-slate-50 flex justify-center">
                       <Button variant="ghost" className="text-primary text-xs font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 rounded-xl h-12 px-8">
                         <Plus className="h-4 w-4" strokeWidth={3} /> Add Mission Task
                       </Button>
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
