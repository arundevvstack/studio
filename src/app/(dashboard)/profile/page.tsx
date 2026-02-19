"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Target,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Camera,
  Upload
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
import { Project, TeamMember } from '@/lib/types';
import { updateTeamMemberProfile } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, teamMember, isAdmin, updatePhotoURL } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    portfolioUrl: '',
    photoURL: '',
  });

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
    return query(
      collection(db, 'projects'),
      where('assignedTeamMemberIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: assignments, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const stats = useMemo(() => {
    if (!assignments) return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 };
    const total = assignments.length;
    const completed = assignments.filter(p => p.stage === 'Released').length;
    const inProgress = total - completed;
    const avgProgress = total > 0 ? Math.round(assignments.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;
    return { total, completed, inProgress, avgProgress };
  }, [assignments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setIsSubmitting(true);
    try {
      // Synchronize Photo URL if changed via upload
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

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Asset Size Exceeded", description: "Portrait must be under 2MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      toast({ title: "Visual Captured", description: "New portrait selected. Save profile to deploy changes." });
    };
    reader.readAsDataURL(file);
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Pitch': return 'bg-purple-50 text-purple-700';
      case 'Released': return 'bg-emerald-50 text-emerald-700';
      case 'Production': return 'bg-amber-50 text-amber-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Hero Header Section */}
      <div className="relative h-48 md:h-64 rounded-[5px] overflow-hidden bg-slate-900 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-900/40 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1600" 
          alt="Studio Background" 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
          data-ai-hint="cinematic background"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-[5px] border-4 border-white dark:border-slate-900 shadow-2xl ring-1 ring-slate-200">
                <AvatarImage src={isEditing ? formData.photoURL : (teamMember?.photoURL || '')} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-4xl uppercase">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black/40 rounded-[5px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/60"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="text-white w-8 h-8 mb-1" />
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Replace</span>
                </div>
              )}
              {!isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="space-y-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{user?.displayName}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-[3px] bg-white/10 text-white border-none font-black text-[9px] uppercase tracking-widest px-2 h-5 backdrop-blur-md">
                  {teamMember?.role || 'Personnel'}
                </Badge>
                <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  <MapPin size={12} className="text-primary" />
                  {formData.location || 'Trivandrum Node'}
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
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-[5px] h-10 px-4 font-black border-white/20 text-white hover:bg-white/10">
                  <X size={16} />
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-[5px] h-10 px-6 font-black bg-primary text-white shadow-xl shadow-primary/30">
                  <Save size={16} className="mr-2" /> {isSaving ? 'Syncing...' : 'Synchronize'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Intelligence & Bio */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardHeader className="py-5 px-6 border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Dossier</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location Node</Label>
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="rounded-[5px] border-slate-200 h-10 font-bold text-xs"
                      placeholder="e.g. Remote Node / HQ"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Portfolio Access</Label>
                    <Input 
                      value={formData.portfolioUrl} 
                      onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                      className="rounded-[5px] border-slate-200 h-10 font-bold text-xs"
                      placeholder="https://behance.net/username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Executive Brief (Bio)</Label>
                    <Textarea 
                      value={formData.bio} 
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="rounded-[5px] border-slate-200 min-h-[120px] font-medium text-xs leading-relaxed"
                      placeholder="Outline your strategic expertise..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{teamMember?.bio || 'Professional brief pending initialization. Use the modify toggle to update your strategic identity.'}"
                    </p>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-[3px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Strategic Email</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{user?.email}</p>
                      </div>
                    </div>
                    {teamMember?.portfolioUrl && (
                      <div className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-[3px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                          <LinkIcon size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Portfolio</p>
                          <a href={teamMember.portfolioUrl} target="_blank" className="text-[11px] font-bold text-primary hover:underline">{teamMember.portfolioUrl.replace('https://', '')}</a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-[3px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                        <Calendar size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Personnel Since</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          {teamMember?.createdAt?.seconds ? new Date(teamMember.createdAt.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Syncing...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance KPIs */}
          <Card className="border-none shadow-sm rounded-[5px] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
            <CardHeader className="py-5 px-6 border-b border-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Performance Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Throughput Efficiency</span>
                  <span className="text-primary">{stats.avgProgress}%</span>
                </div>
                <Progress value={stats.avgProgress} className="h-1 bg-white/5 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-[3px] bg-white/5 border border-white/5">
                  <div className="text-2xl font-black tracking-tighter">{stats.total}</div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Nodes Managed</p>
                </div>
                <div className="p-4 rounded-[3px] bg-white/5 border border-white/5">
                  <div className="text-2xl font-black tracking-tighter text-emerald-400">{stats.completed}</div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Mission Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Assignments & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Node Assignments</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-500">High-growth campaigns under your strategic management.</CardDescription>
              </div>
              <Badge className="rounded-[2px] bg-primary/5 text-primary border-none font-black text-[8px] uppercase tracking-widest h-5 px-2">
                {stats.inProgress} ACTIVE
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {projectsLoading ? (
                  <div className="p-12 text-center animate-pulse font-black text-[10px] uppercase tracking-widest text-slate-400">Synchronizing Assignments...</div>
                ) : !assignments || assignments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic text-[12px] font-medium">No active node assignments detected in your clearance level.</div>
                ) : (
                  assignments.slice(0, 5).map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                      <div className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-[3px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner overflow-hidden">
                            {project.thumbnailUrl ? (
                              <img src={project.thumbnailUrl} className="w-full h-full object-cover" />
                            ) : (
                              <Layers size={18} />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[13px] font-arial font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors tracking-tight">{project.projectName}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.client}</span>
                              <Badge className={cn("rounded-[2px] text-[7px] font-black uppercase tracking-widest border-none px-1 h-3.5", getStageColor(project.stage))}>
                                {project.stage}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-32">
                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                              <span>Sync</span>
                              <span className="text-primary">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-0.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                          </div>
                          <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              {assignments && assignments.length > 5 && (
                <div className="p-4 border-t border-slate-50 dark:border-slate-800 text-center">
                  <Button variant="ghost" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary h-8" asChild>
                    <Link href="/projects">View All Assignments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity/History section */}
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardHeader className="py-5 px-6 border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800"></div>
                
                {[
                  { title: 'Assignment Synchronized', desc: 'Added to strategic node Nike Summer 24.', time: '2h ago', icon: Target, color: 'text-blue-500' },
                  { title: 'Mission Objective Cleared', desc: 'Finalized "Master Grade Assembly" for Adidas Global.', time: '5h ago', icon: CheckCircle2, color: 'text-emerald-500' },
                  { title: 'Status Escalated', desc: 'Project "Pepsi Rebrand" shifted to Post Production.', time: 'Yesterday', icon: TrendingUp, color: 'text-primary' },
                  { title: 'Strategic Deployment', desc: 'Initialized new production pipeline: Marzelz Lifestyle.', time: '3 days ago', icon: Clock, color: 'text-slate-400' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-6 relative z-10 group">
                    <div className={cn("w-8 h-8 rounded-[3px] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0 ring-1 ring-slate-100 dark:ring-slate-800", activity.color)}>
                      <activity.icon size={14} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1 pt-1 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <h5 className="text-[12px] font-black text-slate-700 dark:text-slate-200 tracking-tight">{activity.title}</h5>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{activity.time}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
