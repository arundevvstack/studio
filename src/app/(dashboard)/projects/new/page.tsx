"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/firebase/firestore';
import { ProjectStage, ProjectPriority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ChevronLeft, Sparkles, Wand2, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { generateProjectDescription } from '@/ai/flows/generate-project-description';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    stage: 'Discussion' as ProjectStage,
    priority: 'Medium' as ProjectPriority,
    budget: '',
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStageChange = (val: string) => setFormData({ ...formData, stage: val as ProjectStage });
  const handlePriorityChange = (val: string) => setFormData({ ...formData, priority: val as ProjectPriority });

  const handleGenerateDescription = async () => {
    if (!formData.projectName) {
      toast({ title: "Naming is hard", description: "Give it a name first!", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProjectDescription({ projectIdea: formData.projectName });
      setFormData({ ...formData, description: result.description });
      toast({ title: "AI Magic", description: "Expanded your project idea!" });
    } catch (err) {
      toast({ title: "Error", description: "AI couldn't help this time.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.client) {
      toast({ title: "Missing details", description: "Project name and client are required.", variant: "destructive" });
      return;
    }
    try {
      await createProject({
        ...formData,
        budget: Number(formData.budget),
        deadline: null, // UI for deadline can be added later
      });
      toast({ title: "Success", description: "Project created successfully!" });
      router.push('/projects');
    } catch (err) {
      toast({ title: "Error", description: "Could not create project.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl border hover:bg-muted">
          <Link href="/projects"><ChevronLeft size={20} /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Initiate New Project</h1>
          <p className="text-muted-foreground">Define the scope and resources for your next production.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm premium-shadow rounded-3xl bg-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Name</Label>
                <Input 
                  name="projectName" 
                  value={formData.projectName} 
                  onChange={handleChange} 
                  placeholder="e.g. Nike Summer Campaign" 
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Client</Label>
                <Input 
                  name="client" 
                  value={formData.client} 
                  onChange={handleChange} 
                  placeholder="e.g. Nike Global" 
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stage</Label>
                <Select value={formData.stage} onValueChange={handleStageChange}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white/50 focus:bg-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-xl">
                    <SelectItem value="Discussion">Discussion</SelectItem>
                    <SelectItem value="Pre Production">Pre Production</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Post Production">Post Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                <Select value={formData.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white/50 focus:bg-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-xl">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Initial Budget ($)</Label>
                <Input 
                  name="budget" 
                  type="number" 
                  value={formData.budget} 
                  onChange={handleChange} 
                  placeholder="e.g. 15000" 
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Description</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-[10px] uppercase font-black tracking-tighter hover:bg-primary/5 p-0 h-auto"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  <Wand2 size={12} className="mr-1" /> {isGenerating ? 'Drafting...' : 'Auto-expand with AI'}
                </Button>
              </div>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Brief project goals and creative direction..." 
                className="rounded-2xl border-slate-200 bg-white/50 focus:bg-white min-h-[150px] transition-all"
              />
            </div>

            <div className="pt-6 border-t flex items-center justify-end gap-4">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" className="rounded-xl px-10 h-12 font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
                Launch Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}