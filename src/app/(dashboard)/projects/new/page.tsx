
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/firebase/firestore';
import { ProjectStage, ProjectPriority } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wand2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { generateProjectDescription } from '@/ai/flows/generate-project-description';
import { useFirestore, useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    stage: 'Pitch' as ProjectStage,
    priority: 'Medium' as ProjectPriority,
    budget: '',
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStageChange = (val: string) => setFormData({ ...formData, stage: val as ProjectStage });
  const handlePriorityChange = (val: string) => setFormData({ ...formData, priority: val as ProjectPriority });

  const handleGenerateDescription = async () => {
    if (!formData.projectName) {
      toast({ title: "Naming required", description: "Please provide a project name first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProjectDescription({ projectIdea: formData.projectName });
      setFormData({ ...formData, description: result.description });
      toast({ title: "AI Generation Success", description: "Created an expanded brief based on your idea." });
    } catch (err) {
      toast({ title: "AI Generation Error", description: "Could not generate description at this time.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Auth Error", description: "You must be signed in to create a project.", variant: "destructive" });
      return;
    }
    if (!formData.projectName || !formData.client) {
      toast({ title: "Validation Error", description: "Project identifier and client are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    // Non-blocking mutation call
    createProject(db, user.uid, formData);
    
    toast({ 
      title: "Production Provisioned", 
      description: `Project "${formData.projectName}" has been successfully added to the portfolio.` 
    });
    
    // Navigate immediately (Optimistic UI)
    router.push('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl border hover:bg-white/50 h-12 w-12 transition-all">
          <Link href="/projects"><ChevronLeft size={24} /></Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Initiate Production</h1>
          <p className="text-muted-foreground text-lg font-medium">Deploy a new high-growth media campaign to the studio pipeline.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-indigo-600" />
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Identifier</Label>
                <Input 
                  name="projectName" 
                  value={formData.projectName} 
                  onChange={handleChange} 
                  placeholder="e.g. Nike Summer '24" 
                  className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white h-14 text-lg font-bold px-6 transition-all"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Strategic Client</Label>
                <Input 
                  name="client" 
                  value={formData.client} 
                  onChange={handleChange} 
                  placeholder="e.g. Nike EMEA" 
                  className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white h-14 text-lg font-bold px-6 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pipeline Stage</Label>
                <Select value={formData.stage} onValueChange={handleStageChange}>
                  <SelectTrigger className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white h-14 text-base font-bold px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl shadow-2xl border-slate-100">
                    <SelectItem value="Pitch" className="font-bold">Pitch</SelectItem>
                    <SelectItem value="Discussion" className="font-bold">Discussion</SelectItem>
                    <SelectItem value="Pre Production" className="font-bold">Pre Production</SelectItem>
                    <SelectItem value="Production" className="font-bold">Production</SelectItem>
                    <SelectItem value="Post Production" className="font-bold">Post Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Priority Matrix</Label>
                <Select value={formData.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white h-14 text-base font-bold px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl shadow-2xl border-slate-100">
                    <SelectItem value="Low" className="font-bold">Low Priority</SelectItem>
                    <SelectItem value="Medium" className="font-bold">Medium Priority</SelectItem>
                    <SelectItem value="High" className="font-bold">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cap-Ex Budget ($)</Label>
                <Input 
                  name="budget" 
                  type="number" 
                  value={formData.budget} 
                  onChange={handleChange} 
                  placeholder="e.g. 50000" 
                  className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white h-14 text-lg font-bold px-6 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Executive Brief</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-[11px] font-black uppercase tracking-widest hover:bg-primary/5 px-4 h-9 rounded-full transition-all border border-primary/10"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  <Wand2 size={14} className={cn("mr-2", isGenerating && "animate-spin")} /> 
                  {isGenerating ? 'Synthesizing...' : 'AI Brief Generation'}
                </Button>
              </div>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Outline the core creative direction and strategic goals of this production..." 
                className="rounded-3xl border-slate-200 bg-white/50 focus:bg-white min-h-[220px] text-base p-6 transition-all leading-relaxed"
              />
            </div>

            <div className="pt-10 border-t border-slate-100 flex items-center justify-end gap-6">
              <Button type="button" variant="ghost" className="rounded-2xl font-bold h-14 px-8" onClick={() => router.back()}>Discard</Button>
              <Button 
                type="submit" 
                className="rounded-2xl px-12 h-14 font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Provisioning...' : 'Launch Production'}
                <Rocket className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    