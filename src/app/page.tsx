
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, ArrowRight, Sparkles, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  const logo = PlaceHolderImages.find(img => img.id === 'marzelz-logo');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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
      // Error is handled in AuthContext
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
              <div className="relative h-12 w-40">
                <Image 
                  src={logo.imageUrl} 
                  alt={logo.description} 
                  fill 
                  className="object-contain"
                  data-ai-hint={logo.imageHint}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="rounded-2xl font-bold px-6 h-11" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-48 pb-32 px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 text-left animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none px-2.5 font-bold">Premium OS</Badge>
              <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                Empowering Creative Production
              </span>
            </div>

            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Production OS for <br />
                the <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">Creative Elite.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
                The refined workflow automation engine designed specifically for Marzelz Lifestyle and high-growth media studios.
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
            <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] bg-white/80 backdrop-blur-xl p-4 relative z-10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
              <CardHeader className="pt-10 pb-6 text-center">
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  {isLogin ? 'Enter your credentials to access your workspace.' : 'Join the elite community of media producers.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-6">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Your Name" 
                          className="pl-12 h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="email"
                        placeholder="email@studio.com" 
                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Key</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Authenticating...' : isLogin ? 'Sign In Securely' : 'Create My Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
                
                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    {isLogin ? "Don't have an account?" : "Already part of the network?"}
                    <button 
                      type="button"
                      onClick={() => setIsLogin(!isLogin)} 
                      className="ml-2 text-primary font-bold hover:underline"
                    >
                      {isLogin ? 'Sign up free' : 'Log in here'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
