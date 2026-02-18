"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project, ProjectStage, ProjectPriority } from '@/lib/types';
import { getProject, updateProject } from '@/lib/firebase/firestore';
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
  CardTitle,
  CardDescription
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
  DollarSign, 
  FileText, 
  CheckSquare, 
  MessageSquare,
  History,
  AlertCircle
} from 'lucide-react';
import { suggestProjectTasks } from '@/ai/flows/suggest-project-tasks-flow';
import { summarizeProjectStatus } from '@/ai/flows/summarize-project-status';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      const data = await getProject(id);
      setProject(data);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleUpdateProgress = async (val: number[]) => {
    if (!project) return;
    const newProgress = val[0];
    setProject({ ...project, progress: newProgress });
    await updateProject(id, { progress: newProgress });
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
    } catch (err) {
      toast({ title: "Error", description: "Could not generate AI summary", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl border hover:bg-muted">
            <Link href="/projects"><ChevronLeft size={20} /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h1 className="text-3xl font-bold tracking-tight">{project.projectName}</h1>
               <Badge className="rounded-lg bg-primary/10 text-primary border-none text-[10px] font-bold">
                 #{id.slice(0, 5)}
               </Badge>
            </div>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Users size={14} /> {project.client} 
              <span className="mx-2 text-slate-300">•</span>
              <Calendar size={14} /> Due {project.deadline ? new Date(project.deadline.seconds * 1000).toLocaleDateString() : 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-medium border-slate-200">Edit Project</Button>
          <Button className="rounded-xl font-medium shadow-lg shadow-primary/20">Mark as Released</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-none shadow-sm premium-shadow rounded-3xl bg-white/50 backdrop-blur-sm overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Project Health & Progress</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl text-primary bg-primary/5 hover:bg-primary/10 gap-2 border-none"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                >
                  <Sparkles size={16} />
                  {isSummarizing ? 'Analyzing...' : 'AI Summary'}
                </Button>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-white/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Current Stage</p>
                    <p className="text-lg font-bold text-slate-800">{project.stage}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-white/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Priority</p>
                    <Badge className={cn(
                      "rounded-lg",
                      project.priority === 'High' ? "bg-destructive/10 text-destructive border-none" : "bg-primary/10 text-primary border-none"
                    )}>{project.priority}</Badge>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-white/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Budget Spend</p>
                    <p className="text-lg font-bold text-slate-800">${(project.budget || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Overall Completion</h4>
                    <span className="text-2xl font-black text-primary">{project.progress}%</span>
                  </div>
                  <Slider 
                    value={[project.progress]} 
                    max={100} 
                    step={1} 
                    onValueChange={handleUpdateProgress}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-tighter">
                    <span>Kickoff</span>
                    <span>Midpoint</span>
                    <span>Delivery</span>
                  </div>
                </div>

                {aiSummary && (
                   <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={18} className="text-primary" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Intelligence Report</h4>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 italic">"{aiSummary}"</p>
                   </div>
                )}
             </CardContent>
          </Card>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start mb-6">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 font-bold text-muted-foreground data-[state=active]:text-foreground">
                <CheckSquare size={16} className="mr-2" /> Tasks
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 font-bold text-muted-foreground data-[state=active]:text-foreground">
                <History size={16} className="mr-2" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 font-bold text-muted-foreground data-[state=active]:text-foreground">
                <MessageSquare size={16} className="mr-2" /> Notes
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 font-bold text-muted-foreground data-[state=active]:text-foreground">
                <FileText size={16} className="mr-2" /> Assets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-0 focus-visible:ring-0">
               <Card className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm">
                 <CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { title: 'Final Script Approval', status: 'Completed', date: 'Oct 12' },
                        { title: 'Source B-Roll from Archive', status: 'In Progress', date: 'Oct 15' },
                        { title: 'Record Voiceover', status: 'Pending', date: 'Oct 18' },
                        { title: 'Color Grade V1', status: 'Pending', date: 'Oct 22' },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                task.status === 'Completed' ? "bg-primary border-primary text-white" : "border-slate-300"
                              )}>
                                {task.status === 'Completed' && <CheckSquare size={12} />}
                              </div>
                              <div>
                                <p className={cn("text-sm font-bold", task.status === 'Completed' && "line-through text-muted-foreground")}>{task.title}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase">{task.date}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="rounded-lg text-[10px]">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t flex justify-center">
                       <Button variant="ghost" className="text-primary text-xs font-bold gap-2">
                         <Plus className="h-4 w-4" /> Add Task
                       </Button>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
           <Card className="border-none shadow-sm premium-shadow rounded-3xl bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Team Assigned</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { name: 'Marcus J.', role: 'Director', avatar: 'https://picsum.photos/seed/m1/100/100' },
                   { name: 'Sarah L.', role: 'Editor', avatar: 'https://picsum.photos/seed/s2/100/100' },
                   { name: 'James W.', role: 'Audio', avatar: 'https://picsum.photos/seed/j3/100/100' },
                 ].map((member, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden border shadow-sm">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                      </div>
                   </div>
                 ))}
                 <Button variant="outline" className="w-full rounded-xl mt-2 text-xs font-bold border-dashed hover:border-solid">Manage Team</Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm premium-shadow rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-slate-400">Budget Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div>
                    <p className="text-2xl font-black">${(project.budget || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Total Authorized Budget</p>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-slate-400">Spent to date</span>
                       <span className="font-bold text-primary">$4,250</span>
                    </div>
                    <Progress value={45} className="h-1 bg-slate-800" />
                 </div>
                 <Button variant="outline" className="w-full rounded-xl text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900 border-none transition-all">
                    View Invoices
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}