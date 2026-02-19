
"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  Palette, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Save,
  RotateCcw,
  Sparkles,
  Mail,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  Laptop
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
import { useAuth } from '@/lib/firebase/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { user, isAdmin, resetPassword } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Profile Synchronized",
        description: "Your executive identity has been updated across the network.",
      });
    }, 1000);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSyncing(true);
    try {
      await resetPassword(user.email);
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setIsSyncing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">System Settings</h1>
          <p className="text-slate-500 text-base font-medium opacity-80">Manage workspace parameters and strategic preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[5px] h-10 px-5 border-slate-200 dark:border-slate-800 font-bold gap-2 bg-white dark:bg-slate-900 text-xs">
            <RotateCcw size={16} />
            Reset Defaults
          </Button>
          <Button className="rounded-[5px] h-10 px-6 shadow-md shadow-primary/10 font-black bg-primary text-white text-xs" onClick={handleSaveProfile} disabled={isSyncing}>
            <Save size={16} className="mr-2" />
            {isSyncing ? 'Syncing...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-1 rounded-[5px] border border-white/60 dark:border-white/5 mb-6 h-11">
          <TabsTrigger value="profile" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary">
            <User size={12} /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary">
            <Palette size={12} /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary">
            <Bell size={12} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="workspace" className="rounded-[3px] px-5 font-bold text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary">
            <Globe size={12} /> Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pt-6 px-6 pb-4">
                <CardTitle className="text-lg font-black">Executive Identity</CardTitle>
                <CardDescription className="text-xs font-medium">Update public presence in the production network.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="pl-10 rounded-[5px] border-slate-200 dark:border-slate-800 h-11 font-bold bg-slate-50/50 dark:bg-slate-800/50 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Strategic Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profileData.email}
                        disabled
                        className="pl-10 rounded-[5px] border-slate-200 dark:border-slate-800 h-11 font-bold bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Short Bio / Status</Label>
                  <Input 
                    placeholder="e.g. Lead Producer at Marzelz Lifestyle"
                    className="rounded-[5px] border-slate-200 dark:border-slate-800 h-11 font-bold bg-slate-50/50 dark:bg-slate-800/50 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[5px] bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[50px] rounded-full group-hover:scale-150 transition-all duration-1000"></div>
              <CardHeader className="pt-6 px-6 pb-4">
                <CardTitle className="text-base font-black">Security Clearing</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3 p-3.5 rounded-[5px] bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-[5px] bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Verified Account</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{isAdmin ? 'Full Administrator' : 'Standard User'}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full rounded-[5px] h-11 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/10 hover:text-white transition-all"
                  onClick={handlePasswordReset}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Request Password Reset'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardHeader className="pt-6 px-6 pb-4">
              <CardTitle className="text-lg font-black">UI Optimization</CardTitle>
              <CardDescription className="text-xs font-medium">Fine-tune the visual experience of your production OS.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-10">
              <div className="space-y-4">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Interface Theme</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', name: 'Studio Light', icon: Sun },
                    { id: 'dark', name: 'Production Dark', icon: Moon },
                    { id: 'system', name: 'System Sync', icon: Laptop },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-[5px] border transition-all",
                        theme === t.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <t.icon size={24} className={theme === t.id ? "text-primary" : "text-slate-400"} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", theme === t.id ? "text-primary" : "text-slate-500")}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Highlight Spectrum</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Production Red', hex: '#f43f4a' },
                    { name: 'Indigo Velocity', hex: '#6366f1' },
                    { name: 'Emerald Release', hex: '#10b981' },
                    { name: 'Amber Pitch', hex: '#f59e0b' },
                    { name: 'Deep Slate', hex: '#1e293b' },
                  ].map((color) => (
                    <div
                      key={color.hex}
                      className={cn(
                        "group relative flex items-center gap-2.5 p-2 pr-4 rounded-[5px] border transition-all",
                        color.hex === '#f43f4a' ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                      )}
                    >
                      <div className="w-7 h-7 rounded-[3px] shadow-inner" style={{ backgroundColor: color.hex }} />
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-900 dark:text-slate-100">{color.name}</p>
                        <p className="text-[8px] font-bold text-slate-400">{color.hex}</p>
                      </div>
                      {color.hex === '#f43f4a' && <CheckCircle2 size={14} className="text-primary absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-900 rounded-full shadow-sm" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardHeader className="pt-6 px-6 pb-4">
              <CardTitle className="text-lg font-black">Communication Center</CardTitle>
              <CardDescription className="text-xs font-medium">Configure real-time production alerts.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              {[
                { id: 'milestones', title: 'Production Milestones', desc: 'Alert when a project shifts stages.', icon: Sparkles },
                { id: 'billing', title: 'Billing & Financials', desc: 'Notifications for invoice activity.', icon: Building2 },
                { id: 'team', title: 'Collaborative Activity', desc: 'Alerts for personnel assignment.', icon: User },
                { id: 'security', title: 'Security Intelligence', desc: 'Critical alerts for access health.', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 rounded-[5px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[5px] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-[10px] font-medium text-slate-500">{item.desc}</p>
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

        <TabsContent value="workspace" className="animate-in fade-in slide-in-from-top-1 duration-500">
          <Card className="border-none shadow-sm rounded-[5px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardHeader className="pt-6 px-6 pb-4">
              <CardTitle className="text-lg font-black">Workspace Parameters</CardTitle>
              <CardDescription className="text-xs font-medium">Strategic configuration for Marzelz Lifestyle assets.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Studio Identifier</Label>
                  <Input 
                    value={profileData.studioName}
                    onChange={(e) => setProfileData({...profileData, studioName: e.target.value})}
                    className="rounded-[5px] border-slate-200 dark:border-slate-800 h-11 font-bold bg-slate-50/50 dark:bg-slate-800/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Default Currency</Label>
                  <Input 
                    value="INR (₹)"
                    disabled
                    className="rounded-[5px] border-slate-200 dark:border-slate-800 h-11 font-bold bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 text-sm"
                  />
                </div>
              </div>
              <div className="p-4 rounded-[5px] bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3.5">
                 <div className="w-9 h-9 rounded-[5px] bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Sparkles size={16} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-amber-900 dark:text-amber-100">Strategic Tip</p>
                    <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
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
