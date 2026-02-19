"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/firebase/firestore';
import { ProjectStage, ProjectPriority } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wand2, Rocket, RefreshCcw, Image as ImageIcon, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    projectName: '', client: '', stage: 'Pitch' as ProjectStage, priority: 'Medium' as ProjectPriority, budget: '', description: '', isRecurring: false, recurringDay: 1, thumbnailUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, thumbnailUrl: reader.result as string }));
      toast({ title: "Visual Initialized", description: "Campaign thumbnail successfully ingested." });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.projectName || !formData.client) return;
    setIsSubmitting(true);
    createProject(db, user.uid, { ...formData, budget: Number(formData.budget) });
    toast({ title: "Production Provisioned", description: `Project "${formData.projectName}" added.` });
    router.push('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-[5px] border h-12 w-12"><Link href="/projects"><ChevronLeft size={24} /></Link></Button>
        <div><h1 className="text-4xl font-black tracking-tight text-slate-900">Initiate Production</h1><p className="text-muted-foreground text-lg font-medium">Deploy a new high-growth media campaign.</p></div>
      </div>

      <Card className="border-none shadow-2xl rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-primary" />
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Project Identifier</Label><Input name="projectName" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} placeholder="e.g. Nike Summer '24" className="rounded-[5px] border-slate-200 h-14 text-lg font-bold px-6" required /></div>
              <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Strategic Client</Label><Input name="client" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} placeholder="e.g. Nike EMEA" className="rounded-[5px] border-slate-200 h-14 text-lg font-bold px-6" required /></div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Project Visuals</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("relative h-40 rounded-[5px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer transition-all", formData.thumbnailUrl && "border-none")} onClick={() => fileInputRef.current?.click()}>
                  {formData.thumbnailUrl ? <><img src={formData.thumbnailUrl} className="w-full h-full object-cover rounded-[5px]" /><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white text-rose-500" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, thumbnailUrl: '' })); }}><X size={16} /></Button></> : <><ImageIcon className="text-slate-300 w-10 h-10 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ingest Campaign Asset</p></>}
                </div>
                <div className="p-6 rounded-[5px] bg-slate-50 border border-slate-100 flex flex-col justify-center gap-2"><p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Guidance</p><p className="text-xs font-medium text-slate-500 leading-relaxed">High-resolution stills or mood-board assets are recommended.</p></div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Executive Brief</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Outline the core creative direction..." className="rounded-[5px] border-slate-200 min-h-[220px] text-base p-6 leading-relaxed" /></div>

            <div className="pt-10 border-t border-slate-100 flex items-center justify-end gap-6">
              <Button type="button" variant="ghost" className="rounded-[5px] font-bold h-14 px-8" onClick={() => router.back()}>Discard</Button>
              <Button type="submit" className="rounded-[5px] px-12 h-14 font-black text-lg bg-primary" disabled={isSubmitting}>{isSubmitting ? 'Provisioning...' : 'Launch Production'}<Rocket className="ml-3 h-5 w-5" /></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
