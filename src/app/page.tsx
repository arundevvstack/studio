
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { user, loading, signIn, signUp, signInWithGoogle, isAuthorized } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  const logo = PlaceHolderImages.find(img => img.id === 'marzelz-logo');

  useEffect(() => {
    if (!loading && user && isAuthorized) {
      router.push('/dashboard');
    }
  }, [user, loading, router, isAuthorized]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] selection:bg-primary/20 hero-gradient">
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && (
              <div className="relative h-12 w-48">
                <Image src={logo.imageUrl} alt={logo.description} fill className="object-contain object-left" data-ai-hint={logo.imageHint} />
              </div>
            )}
          </div>
          <Button variant="ghost" className="rounded-[5px] font-bold px-6 h-11" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create Account' : 'Sign In'}
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-48 pb-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 text-left animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none px-2.5 font-bold">Premium OS</Badge>
              <span className="text-xs font-bold text-slate-600">Empowering Creative Production</span>
            </div>
            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Production OS for <br /> the <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">Creative Elite.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
                The refined workflow automation engine designed specifically for Marzelz Lifestyle.
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
            {user && !isAuthorized ? (
              <Card className="border-none shadow-2xl rounded-[5px] bg-white/80 backdrop-blur-xl p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-50 rounded-[5px] flex items-center justify-center text-amber-500 mx-auto">
                  <Lock size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Awaiting Authorization</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Your executive profile has been initialized. An administrator must authorize your clearance level before dashboard access is granted.
                </p>
                <Button variant="outline" className="w-full h-14 rounded-[5px] font-black" onClick={() => window.location.reload()}>Check Status</Button>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl rounded-[5px] bg-white/80 backdrop-blur-xl p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                <CardHeader className="pt-10 pb-6 text-center">
                  <CardTitle className="text-3xl font-black text-slate-900">{isLogin ? 'Welcome Back' : 'Get Started'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                        <Input placeholder="Your Name" className="h-14 rounded-[5px] font-medium" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                      <Input type="email" placeholder="email@studio.com" className="h-14 rounded-[5px] font-medium" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</Label>
                      <Input type="password" placeholder="••••••••" className="h-14 rounded-[5px] font-medium" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-[5px] font-black bg-primary" disabled={authLoading}>
                      {authLoading ? 'Authenticating...' : isLogin ? 'Sign In Securely' : 'Create My Account'}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-2 text-slate-400">Or Continue With</span></div>
                  </div>

                  <Button variant="outline" className="w-full h-14 rounded-[5px] font-black border-slate-200 gap-3" onClick={signInWithGoogle} disabled={authLoading}>
                    <Chrome size={20} /> Google Login
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
