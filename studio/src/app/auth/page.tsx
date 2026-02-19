'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, ShieldCheck, UserPlus, LogIn, Fingerprint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const syncUserProfile = async (user: any, name?: string) => {
    const profileRef = doc(db, 'userProfiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      const displayName = name || user.displayName || 'Studio Executive';
      await setDoc(profileRef, {
        id: user.uid,
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' ') || '',
        email: user.email || 'anonymous@studio.internal',
        role: 'Producer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (name) {
        await updateProfile(user, { displayName: name });
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Authentication Successful', description: 'Accessing studio core nodes...' });
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserProfile(user, fullName);
        toast({ title: 'Identity Created', description: 'Welcome to the MediaFlow network.' });
      }
      router.push('/');
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Auth Failure', 
        description: error.message || 'Credentials rejected by network.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      const { user } = await signInAnonymously(auth);
      await syncUserProfile(user);
      toast({ title: 'Guest Access Granted', description: 'Entering with restricted intelligence permissions.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Network Error', description: 'Could not establish anonymous link.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">MediaFlow OS</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Studio Management Interface</p>
        </div>

        <Card className="border shadow-xl rounded-lg overflow-hidden glass-card">
          <CardHeader className="p-6 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              {isLogin ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {isLogin ? 'Establish Session' : 'Create Identity'}
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">
              {isLogin ? 'Enter your studio credentials to proceed.' : 'Register your dossier in the studio network.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g., Sarah Chen" 
                    className="h-10 rounded-md" 
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Studio Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.com" 
                  className="h-10 rounded-md" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Secret Key</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-10 rounded-md" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-10 rounded-md font-bold uppercase tracking-widest text-[10px] gap-2" disabled={isLoading}>
                {isLoading ? 'Processing...' : isLogin ? 'Authorize Access' : 'Synthesize Profile'}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold">
                <span className="bg-background px-2 text-muted-foreground">Or bypass security</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleAnonymous} 
              className="w-full h-10 rounded-md font-bold uppercase tracking-widest text-[10px] gap-2 border-dashed"
              disabled={isLoading}
            >
              <Fingerprint className="h-3.5 w-3.5" /> Anonymous Ingress
            </Button>

            <div className="text-center pt-2">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] uppercase font-bold text-primary hover:underline"
              >
                {isLogin ? 'No dossier? Request initialization' : 'Already registered? Sync credentials'}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[9px] text-muted-foreground uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 opacity-60">
          <ShieldCheck className="h-3 w-3" /> Encrypted via Studio Core Security Protocol
        </p>
      </div>
    </div>
  );
}