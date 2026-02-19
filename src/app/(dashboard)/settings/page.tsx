"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  User, Palette, Bell, ShieldCheck, Globe, Save, RotateCcw, Mail, Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/firebase/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { user, isAdmin, resetPassword, updateDisplayName, updatePhotoURL, loading } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({ name: '', email: '', photoURL: '', studioName: 'Marzelz Lifestyle' });

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
    if (profileData.name !== user?.displayName) await updateDisplayName(profileData.name);
    if (profileData.photoURL !== user?.photoURL) await updatePhotoURL(profileData.photoURL);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, photoURL: reader.result as string }));
      toast({ title: "Thumbnail Synced", description: "Portrait ready for deployment." });
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-700">System Settings</h1>
          <p className="text-slate-500 text-base font-medium opacity-80">Manage workspace parameters and strategic preferences.</p>
        </div>
        <Button className="rounded-[5px] h-10 px-6 shadow-md shadow-primary/10 font-black bg-primary text-white text-xs" onClick={handleSaveProfile} disabled={loading}>
          <Save size={16} className="mr-2" /> {loading ? 'Syncing...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-[5px] border border-white/60 mb-6 h-11">
          <TabsTrigger value="profile" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pt-6 px-6 pb-4 border-b border-slate-50">
                <CardTitle className="text-lg font-black">Executive Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 rounded-[5px] border-2 border-white shadow-xl ring-1 ring-slate-100">
                      <AvatarImage src={profileData.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-2xl uppercase">{profileData.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-[5px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="text-white w-6 h-6 mb-1" /><span className="text-[8px] text-white font-black uppercase tracking-widest">Upload</span>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Display Name</Label>
                      <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="rounded-[5px] border-slate-200 h-11 font-bold bg-slate-50/50 text-sm" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[5px] bg-slate-900 text-white overflow-hidden relative">
              <CardHeader className="pt-6 px-6 pb-4"><CardTitle className="text-base font-black">Security Clearing</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3 p-3.5 rounded-[5px] bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-[5px] bg-primary/20 flex items-center justify-center text-primary"><ShieldCheck size={18} /></div>
                  <div><p className="text-xs font-black">Verified Account</p><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{isAdmin ? 'Full Administrator' : 'Standard User'}</p></div>
                </div>
                <Button variant="outline" className="w-full rounded-[5px] h-11 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/10" onClick={() => resetPassword(user?.email || '')}>Reset Password</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
