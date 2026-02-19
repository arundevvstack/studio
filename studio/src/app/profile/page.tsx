'use client';

import { Topbar } from '@/components/topbar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Briefcase, Link as LinkIcon, Edit2, Check, UserCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    location: '',
    role: '',
    portfolio: '',
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        description: profileData.description || '',
        location: profileData.location || '',
        role: profileData.role || '',
        portfolio: profileData.portfolio || '',
      });
    }
  }, [profileData]);

  const handleUpdateProfile = async () => {
    if (!profileRef || !user) return;
    setIsUpdating(true);

    try {
      const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Update Firestore
      await updateDoc(profileRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });

      // Sync with Auth
      if (updatedName) {
        await updateProfile(user, {
          displayName: updatedName,
        });
      }

      setIsEditing(false);
      toast({ 
        title: 'Profile Synchronized', 
        description: 'Your intelligence dossier has been updated in the studio core.' 
      });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Update Error', 
        description: 'Could not synchronize changes with the studio network.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          setIsUpdating(true);
          // Update Auth portrait
          await updateProfile(user, { photoURL: base64 });
          
          // Update Firestore profile
          if (profileRef) {
            await updateDoc(profileRef, { 
              profileImageUrl: base64,
              updatedAt: new Date().toISOString() 
            });
          }
          toast({ 
            title: 'Visuals Updated', 
            description: 'Your portrait has been synchronized across all nodes.' 
          });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Visual data transmission interrupted.' });
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accessing dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Topbar />
      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="relative mb-24">
          <div className="h-48 w-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg shadow-inner overflow-hidden relative">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl rounded-lg overflow-hidden bg-muted">
                <AvatarImage src={user?.photoURL || ''} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary uppercase">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
              >
                <Camera className="text-white h-8 w-8" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div className="pb-4">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {user?.displayName || 'Studio Executive'}
              </h1>
              <p className="text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                <Briefcase className="h-3 w-3" /> {profileData?.role || 'Lead Producer'}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-12 right-0">
            <Button 
              variant={isEditing ? "default" : "outline"} 
              size="sm" 
              disabled={isUpdating}
              className="rounded-lg h-9 gap-2 shadow-sm font-bold uppercase tracking-widest text-[10px]"
              onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
            >
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
              {isEditing ? 'Save Profile' : 'Modify Dossier'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-sm border rounded-lg overflow-hidden">
              <CardHeader className="p-4 border-b bg-muted/50">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Identity Meta</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Studio Location</label>
                  {isEditing ? (
                    <Input 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      className="h-9 rounded-md text-slate-900" 
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-slate-800 font-bold text-[11px] uppercase tracking-tighter">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {profileData?.location || 'Undisclosed'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Portfolio Node</label>
                  {isEditing ? (
                    <Input 
                      value={formData.portfolio} 
                      onChange={e => setFormData({...formData, portfolio: e.target.value})} 
                      className="h-9 rounded-md text-slate-900" 
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-primary font-bold text-[11px] truncate uppercase tracking-tighter">
                      <LinkIcon className="h-3.5 w-3.5 text-slate-400" /> {profileData?.portfolio || 'Not linked'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Studio Role</label>
                  {isEditing ? (
                    <Input 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})} 
                      className="h-9 rounded-md text-slate-900" 
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-slate-800 font-bold text-[11px] uppercase tracking-tighter">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {profileData?.role || 'Executive'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border rounded-lg overflow-hidden">
              <CardHeader className="p-4 border-b bg-muted/50">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">First Name</label>
                         <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-9" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Last Name</label>
                         <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-9" />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Professional Bio</label>
                      <Textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        placeholder="Describe your strategic contributions to the studio flow..."
                        className="min-h-[120px] rounded-md resize-none text-[11px] leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed italic text-[12px]">
                    {profileData?.description || 'No executive summary provided in the dossier.'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border rounded-lg overflow-hidden">
              <CardHeader className="p-4 border-b bg-muted/50">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Mission Nodes</CardTitle>
              </CardHeader>
              <CardContent className="p-12 text-center space-y-4">
                <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto border shadow-inner">
                  <Briefcase className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">No Production Nodes Assigned</p>
                  <p className="text-[9px] text-muted-foreground/60 italic">Assignments will appear as you are integrated into project campaigns.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}