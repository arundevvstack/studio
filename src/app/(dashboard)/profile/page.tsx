"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, Mail, MapPin, Link as LinkIcon, ShieldCheck, Calendar, Edit3, Save, X, Target, Layers, ArrowUpRight, TrendingUp, Clock, Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/firebase/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Project } from '@/lib/types';
import { updateTeamMemberProfile } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, teamMember, updatePhotoURL } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ bio: '', location: '', portfolioUrl: '', photoURL: '' });

  useEffect(() => {
    if (teamMember) {
      setFormData({
        bio: teamMember.bio || '',
        location: teamMember.location || '',
        portfolioUrl: teamMember.portfolioUrl || '',
        photoURL: teamMember.photoURL || '',
      });
    }
  }, [teamMember]);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'projects'), where('assignedTeamMemberIds', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
  }, [db, user?.uid]);

  const { data: assignments, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const stats = useMemo(() => {
    if (!assignments) return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 };
    const total = assignments.length;
    const completed = assignments.filter(p => p.stage === 'Released').length;
    const avgProgress = total > 0 ? Math.round(assignments.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;
    return { total, completed, inProgress: total - completed, avgProgress };
  }, [assignments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSubmitting(true);
    try {
      if (formData.photoURL !== teamMember?.photoURL) {
        await updatePhotoURL(formData.photoURL);
      }
      await updateTeamMemberProfile(db, user.uid, {
        bio: formData.bio,
        location: formData.location,
        portfolioUrl: formData.portfolioUrl
      });
      toast({ title: "Profile Synchronized", description: "Your professional metadata has been updated." });
      setIsEditing(false);
    } catch (err) {
      toast({ title: "Sync Error", description: "Could not update profile fields.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      toast({ title: "Visual Captured", description: "Save profile to deploy changes." });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <div className="relative h-48 md:h-64 rounded-[5px] overflow-hidden bg-slate-900 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-900/40 mix-blend-overlay"></div>
        <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1600" alt="Studio" className="w-full h-full object-cover opacity-40" />
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-[5px] border-4 border-white shadow-2xl">
                <AvatarImage src={isEditing ? formData.photoURL : (teamMember?.photoURL || '')} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-4xl uppercase">{user?.displayName?.[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-[5px] flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="text-white w-8 h-8 mb-1" />
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Replace</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="space-y-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{user?.displayName}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-[3px] bg-white/10 text-white border-none font-black text-[9px] uppercase tracking-widest px-2 h-5">{teamMember?.role || 'Personnel'}</Badge>
                <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  <MapPin size={12} className="text-primary" /> {formData.location || 'Trivandrum Node'}
                </div>
              </div>
            </div>
          </div>
          <div className="pb-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="rounded-[5px] h-10 px-6 font-black bg-white text-slate-900 hover:bg-slate-100 gap-2 shadow-xl shadow-black/20">
                <Edit3 size={16} /> Modify Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-[5px] h-10 px-4 font-black border-white/20 text-white"><X size={16} /></Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-[5px] h-10 px-6 font-black bg-primary text-white">
                  <Save size={16} className="mr-2" /> {isSaving ? 'Syncing...' : 'Synchronize'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
            <CardHeader className="py-5 px-6 border-b border-slate-50"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Dossier</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location Node</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-[5px] border-slate-200 h-10 font-bold text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Portfolio Access</Label>
                    <Input value={formData.portfolioUrl} onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} className="rounded-[5px] border-slate-200 h-10 font-bold text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Executive Brief</Label>
                    <Textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="rounded-[5px] border-slate-200 min-h-[120px] font-medium text-xs leading-relaxed" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">"{teamMember?.bio || 'Professional brief pending initialization.'}"</p>
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3"><Mail size={14} className="text-slate-400" /><span className="text-[11px] font-bold text-slate-700">{user?.email}</span></div>
                    {teamMember?.portfolioUrl && (
                      <div className="flex items-center gap-3"><LinkIcon size={14} className="text-slate-400" /><a href={teamMember.portfolioUrl} target="_blank" className="text-[11px] font-bold text-primary">{teamMember.portfolioUrl.replace('https://', '')}</a></div>
                    )}
                    <div className="flex items-center gap-3"><Calendar size={14} className="text-slate-400" /><span className="text-[11px] font-bold text-slate-700">Personnel Since {teamMember?.createdAt?.seconds ? new Date(teamMember.createdAt.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '...'}</span></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div><CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Node Assignments</CardTitle></div>
              <Badge className="rounded-[2px] bg-primary/5 text-primary border-none font-black text-[8px] uppercase tracking-widest h-5 px-2">{stats.inProgress} ACTIVE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {assignments?.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                    <div className="p-5 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-[3px] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all overflow-hidden">
                          {project.thumbnailUrl ? <img src={project.thumbnailUrl} className="w-full h-full object-cover" /> : <Layers size={18} />}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-arial font-black text-slate-700 group-hover:text-primary transition-colors tracking-tight">{project.projectName}</h4>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.client} • {project.stage}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-32">
                        <div className="w-full space-y-1">
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400"><span>Sync</span><span className="text-primary">{project.progress}%</span></div>
                          <Progress value={project.progress} className="h-0.5 rounded-full bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
