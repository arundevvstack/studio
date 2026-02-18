"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, ArrowRight, Sparkles, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { user, loading, signIn, signUp } = useAuth();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      // Error handled in context/toast
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] selection:bg-primary/20 hero-gradient">
      <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <span>MediaFlow</span>
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
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none px-2.5 font-bold">Series B Funded</Badge>
              <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                Trusted by 500+ Studios Globally
              </span>
            </div>

            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Production OS for <br />
                the <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Creative Elite.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
                Automate your workflow, coordinate talent, and scale your production with military precision.
              </p>
            </div>

            <div className="flex items-center gap-10 grayscale opacity-40">
              {['NIKE', 'NETFLIX', 'APPLE'].map((brand) => (
                <span key={brand} className="text-xl font-black tracking-tighter">{brand}</span>
              ))}
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
            <Card className="border-none shadow-2xl premium-shadow rounded-[2.5rem] bg-white/80 backdrop-blur-xl p-4 relative z-10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-indigo-600"></div>
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
                          placeholder="Marcus Aurelius" 
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
                        placeholder="marcus@studio.com" 
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
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Verifying...' : isLogin ? 'Sign In Securely' : 'Create My Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
                
                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    {isLogin ? "Don't have an account yet?" : "Already part of the network?"}
                    <button 
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

        <div className="mt-40 pt-20 border-t border-slate-200/50 text-center space-y-20">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Integrated Enterprise Suite</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: 'Military-Grade Security', desc: 'End-to-end encryption for all your production assets and scripts.' },
              { icon: Zap, title: 'AI-Powered Workflows', desc: 'Automate task generation and project scoping with Genkit integration.' },
              { icon: Sparkles, title: 'Premium Support', desc: '24/7 dedicated success manager for your entire production crew.' }
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center mx-auto text-primary border border-slate-100">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-20 px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Zap size={18} fill="currentColor" />
            </div>
            <span>MediaFlow</span>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            © {currentYear || '...'} MediaFlow Technologies Inc. Built for the Creative Elite.
          </p>
        </div>
      </footer>
    </div>
  );
}