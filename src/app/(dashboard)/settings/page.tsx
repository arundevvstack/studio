"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  User, ShieldCheck, Save, Camera, Lock, Bell, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/firebase/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user, isAdmin, resetPassword, updateDisplayName, updatePhotoURL, loading } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({ 
    name: '', 
    email: '', 
    photoURL: '', 
    studioName: 'Marzelz Lifestyle' 
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setProfileData({
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        studioName: 'Marzelz Lifestyle'
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.name !== user?.displayName) {
      await updateDisplayName(profileData.name);
    }
    if (profileData.photoURL !== user?.photoURL) {
      await updatePhotoURL(profileData.photoURL);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, photoURL: reader.result as string }));
      toast({ title: "Visual Initialized", description: "Portrait ready for synchronization." });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-700">System Parameters</h1>
          <p className="text-slate-500 text-base font-medium opacity-80">Manage workspace environment and strategic preferences.</p>
        </div>
        <Button 
          className="rounded-[5px] h-10 px-6 shadow-md shadow-primary/10 font-black bg-primary text-white text-xs" 
          onClick={handleSaveProfile} 
          disabled={loading}
        >
          <Save size={16} className="mr-2" /> {loading ? 'Syncing...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-[5px] border border-white/60 mb-6 h-11">
          <TabsTrigger value="profile" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2">
            <User size={12} /> Executive Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2">
            <ShieldCheck size={12} /> Security Clearing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2">
            <Bell size={12} /> Alert Nodes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pt-6 px-6 pb-4 border-b border-slate-50">
                <CardTitle className="text-lg font-black">Executive Identity</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Public profile metadata within the studio network.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 rounded-[5px] border-2 border-white shadow-xl ring-1 ring-slate-100">
                      <AvatarImage src={profileData.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-2xl uppercase">
                        {profileData.name?.[0] || user?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute inset-0 bg-black/40 rounded-[5px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white w-6 h-6 mb-1" />
                      <span className="text-[8px] text-white font-black uppercase tracking-widest">Update</span>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Display Name</Label>
                      <Input 
                        value={profileData.name} 
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                        className="rounded-[5px] border-slate-200 h-11 font-bold bg-slate-50/50 text-sm" 
                        placeholder="e.g. Sarah Chen"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Studio Node (Email)</Label>
                      <Input 
                        value={user?.email || ''} 
                        disabled 
                        className="rounded-[5px] border-slate-200 h-11 font-bold bg-slate-100/50 text-sm opacity-60 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[5px] bg-slate-50 border border-slate-100 overflow-hidden">
              <CardHeader className="pt-6 px-6 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Brief</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clearance Level</p>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "rounded-[3px] border-none font-black text-[9px] uppercase px-2 h-5",
                      isAdmin ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                    )}>
                      {isAdmin ? 'Root Administrator' : 'Authorized Personnel'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Session</p>
                  <p className="text-xs font-bold text-slate-700">{user?.emailVerified ? 'Encrypted & Validated' : 'Encryption Pending'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-[5px] bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
              <CardHeader className="pt-8 px-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                    <Lock size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Access Protocol</CardTitle>
                    <CardDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Manage your studio ingress credentials.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="p-4 rounded-[5px] bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Password Authentication</p>
                        <p className="text-[10px] font-bold text-slate-500">Secure link required for modification.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-[3px] h-9 px-4 font-black text-[9px] uppercase border-white/10 hover:bg-white text-white hover:text-slate-900 transition-all"
                      onClick={handlePasswordReset}
                      disabled={loading}
                    >
                      {loading ? 'Transmitting...' : 'Initiate Reset'}
                    </Button>
                  </div>

                  <div className="p-4 rounded-[5px] bg-white/5 border border-white/10 opacity-40 grayscale flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <Lock size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Multi-Factor Auth</p>
                        <p className="text-[10px] font-bold text-slate-500">Legacy support disabled by admin.</p>
                      </div>
                    </div>
                    <Badge className="bg-slate-800 text-slate-500 border-none text-[8px] font-black uppercase px-2 h-5">RESTRICTED</Badge>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Security Briefing</p>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    "Password reset requests trigger a secure validation link sent to your primary studio node. Links are active for 60 minutes for high-performance security."
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                <CardHeader className="pt-6 px-6">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Sessions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between p-3 rounded-[5px] bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20"></div>
                      <div>
                        <p className="text-xs font-black text-slate-700">Current Workstation</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active • Trivandrum Node</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50/50">Primary</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[5px] bg-rose-50 border border-rose-100 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-xs font-black text-rose-700">Dossier Revocation</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-rose-600/70">Permanently purge your professional identity from the studio core.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <Button variant="outline" className="w-full rounded-[3px] border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-black text-[10px] uppercase h-10">Delete Dossier</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
            <CardHeader className="p-10 text-center space-y-4">
              <Bell className="w-12 h-12 text-slate-200 mx-auto" />
              <div className="space-y-1">
                <CardTitle className="text-xl font-black text-slate-700">Alert Synchronization</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">Configure real-time intelligence feeds for your workstation.</CardDescription>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="rounded-[3px] font-bold text-xs px-8">Coming Soon to Core</Button>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
