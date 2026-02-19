'use client';

import { Topbar } from '@/components/topbar';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Check, Shield, User, Bell, Monitor } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { updateProfile } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleUpdateAccount = async () => {
    if (!user || !db) return;
    setIsUpdating(true);

    try {
      // Update Auth Display Name (CRITICAL FIX)
      await updateProfile(user, { displayName });

      // Update Firestore User Profile
      const profileRef = doc(db, 'userProfiles', user.uid);
      await updateDoc(profileRef, {
        firstName: displayName.split(' ')[0] || '',
        lastName: displayName.split(' ').slice(1).join(' ') || '',
        updatedAt: new Date().toISOString()
      });

      toast({ 
        title: 'Settings Synchronized', 
        description: 'Your studio identity has been updated across all active nodes.' 
      });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Sync Error', 
        description: 'Failed to update studio credentials.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Topbar />
      <main className="max-w-4xl mx-auto py-8 px-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Studio Parameters</h1>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Adjust your operational environment settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start gap-3 rounded-lg text-[10px] uppercase font-bold tracking-widest bg-white border shadow-sm">
              <User className="h-3.5 w-3.5" /> Identity
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-[10px] uppercase font-bold tracking-widest opacity-60">
              <Shield className="h-3.5 w-3.5" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-[10px] uppercase font-bold tracking-widest opacity-60">
              <Bell className="h-3.5 w-3.5" /> Alerts
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-[10px] uppercase font-bold tracking-widest opacity-60">
              <Monitor className="h-3.5 w-3.5" /> Interface
            </Button>
          </nav>

          <div className="md:col-span-3 space-y-6">
            <Card className="shadow-sm border rounded-lg">
              <CardHeader className="p-6 border-b bg-muted/10">
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Identity Parameters</CardTitle>
                <CardDescription className="text-[10px]">Update your professional name and primary email node.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Display Name</Label>
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 rounded-md" 
                    placeholder="Enter professional name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Primary Intelligence Node (Email)</Label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="h-10 rounded-md bg-muted/50 cursor-not-allowed opacity-60" 
                  />
                  <p className="text-[9px] text-muted-foreground italic">Email nodes must be managed through the central auth provider.</p>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleUpdateAccount} 
                    disabled={isUpdating}
                    className="rounded-lg h-9 gap-2 font-bold uppercase tracking-widest text-[10px]"
                  >
                    {isUpdating ? 'Synchronizing...' : <><Check className="h-3 w-3" /> Save Identity</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border rounded-lg opacity-60">
              <CardHeader className="p-6 border-b bg-muted/10">
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Interface Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">Theme and typography nodes are currently locked to Studio Standard (Arial 12px).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
