
"use client";

import { useState } from 'react';
import { 
  User, 
  Palette, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  Save,
  RotateCcw,
  Sparkles,
  Mail,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/firebase/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    studioName: 'Marzelz Lifestyle',
  });

  const [notifications, setNotifications] = useState({
    milestones: true,
    billing: true,
    team: false,
    security: true,
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    // Simulate sync delay
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Profile Synchronized",
        description: "Your executive identity has been updated across the network.",
      });
    }, 1000);
  };

  const handleColorChange = (color: string) => {
    toast({
      title: "UI Logic Updated",
      description: `Highlight spectrum shifted to ${color}. Global variables synchronized.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">System Settings</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Manage your production workspace and strategic preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-lg h-11 px-6 border-slate-200 font-bold gap-2 bg-white">
            <RotateCcw size={18} />
            Reset Defaults
          </Button>
          <Button className="rounded-lg h-11 px-8 shadow-xl shadow-primary/20 font-black bg-primary text-white" onClick={handleSaveProfile} disabled={isSyncing}>
            <Save size={18} className="mr-2" />
            {isSyncing ? 'Syncing...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/60 mb-8 h-12">
          <TabsTrigger value="profile" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
            <User size={14} /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
            <Palette size={14} /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
            <Bell size={14} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="workspace" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:text-primary">
            <Globe size={14} /> Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-lg bg-white/70 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-xl font-black">Executive Identity</CardTitle>
                <CardDescription className="text-sm font-medium">Update your public presence in the production network.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="pl-12 rounded-lg border-slate-200 h-12 font-bold bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profileData.email}
                        disabled
                        className="pl-12 rounded-lg border-slate-200 h-12 font-bold bg-slate-100/50 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Bio / Status</Label>
                  <Input 
                    placeholder="e.g. Lead Producer at Marzelz Lifestyle"
                    className="rounded-lg border-slate-200 h-12 font-bold bg-slate-50/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-lg bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full group-hover:scale-150 transition-all duration-1000"></div>
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-lg font-black">Security Clearing</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Verified Account</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isAdmin ? 'Full Administrator' : 'Standard User'}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-lg h-12 text-xs font-black uppercase tracking-widest border-white/10 hover:bg-white/10 hover:text-white transition-all">
                  Request Password Reset
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="border-none shadow-sm rounded-lg bg-white/70 backdrop-blur-xl">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl font-black">UI Optimization</CardTitle>
              <CardDescription className="text-sm font-medium">Fine-tune the visual experience of your production OS.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Highlight Spectrum</Label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Production Red', hex: '#f43f4a' },
                    { name: 'Indigo Velocity', hex: '#6366f1' },
                    { name: 'Emerald Release', hex: '#10b981' },
                    { name: 'Amber Pitch', hex: '#f59e0b' },
                    { name: 'Deep Slate', hex: '#1e293b' },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex)}
                      className={cn(
                        "group relative flex items-center gap-3 p-3 pr-6 rounded-lg border transition-all hover:scale-105",
                        color.hex === '#f43f4a' ? "border-primary bg-primary/5" : "border-slate-100 bg-white"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-900">{color.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{color.hex}</p>
                      </div>
                      {color.hex === '#f43f4a' && <CheckCircle2 size={16} className="text-primary absolute -top-2 -right-2 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex items-center justify-between p-6 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-sm font-black">Compact Mode</p>
                    <p className="text-xs font-medium text-slate-500">Reduce overall padding and margins by 20%.</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between p-6 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-sm font-black">Glassmorphism Blur</p>
                    <p className="text-xs font-medium text-slate-500">Enable advanced iOS-style backdrop effects.</p>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="border-none shadow-sm rounded-lg bg-white/70 backdrop-blur-xl">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl font-black">Communication Center</CardTitle>
              <CardDescription className="text-sm font-medium">Configure real-time production alerts.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[
                { id: 'milestones', title: 'Production Milestones', desc: 'Alert when a project shifts lifecycle stages.', icon: Sparkles },
                { id: 'billing', title: 'Billing & Financials', desc: 'Notifications for invoice generation and payments.', icon: Building2 },
                { id: 'team', title: 'Collaborative Activity', desc: 'Alerts when team members are assigned to phases.', icon: User },
                { id: 'security', title: 'Security Intelligence', desc: 'Critical alerts regarding access and system health.', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 rounded-lg hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.title}</p>
                      <p className="text-xs font-medium text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications[item.id as keyof typeof notifications]}
                    onCheckedChange={(val) => setNotifications({...notifications, [item.id]: val})}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="border-none shadow-sm rounded-lg bg-white/70 backdrop-blur-xl">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl font-black">Workspace Parameters</CardTitle>
              <CardDescription className="text-sm font-medium">Strategic configuration for Marzelz Lifestyle assets.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Studio Identifier</Label>
                  <Input 
                    value={profileData.studioName}
                    onChange={(e) => setProfileData({...profileData, studioName: e.target.value})}
                    className="rounded-lg border-slate-200 h-12 font-bold bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default Currency</Label>
                  <Input 
                    value="INR (₹)"
                    disabled
                    className="rounded-lg border-slate-200 h-12 font-bold bg-slate-100/50 text-slate-400"
                  />
                </div>
              </div>
              <div className="p-6 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Sparkles size={18} />
                 </div>
                 <div>
                    <p className="text-sm font-black text-amber-900">Strategic Tip</p>
                    <p className="text-xs font-medium text-amber-700 leading-relaxed">
                      Your Studio Identifier is used to generate official project codes and billing documents. Changes to this name will synchronize across all future assets.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
