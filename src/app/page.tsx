"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Zap size={20} fill="currentColor" />
            </div>
            <span>MediaFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Enterprise</a>
          </div>
          <Button variant="ghost" className="rounded-xl font-bold px-6 h-11 border border-slate-200" onClick={signInWithGoogle}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center z-10 relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest mb-10 border border-slate-200">
            <Badge className="bg-primary text-white text-[10px] h-4 rounded-full border-none">NEW</Badge>
            v2.4 is now live with AI Studio
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900 leading-[0.9]">
            The production <br />
            OS for <span className="text-primary italic">modern</span> teams.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Beautifully simple project management for elite media studios. 
            Automate workflows, coordinate talent, and release faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button size="lg" className="rounded-[1.5rem] px-10 h-16 text-lg font-black shadow-2xl shadow-primary/30 hover:translate-y-[-4px] active:translate-y-0 transition-all bg-primary" onClick={signInWithGoogle}>
              Start Building Now
              <ArrowRight className="ml-2 h-6 w-6" strokeWidth={3} />
            </Button>
            <Button size="lg" variant="outline" className="rounded-[1.5rem] px-10 h-16 text-lg font-bold bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-slate-50 transition-all gap-2" onClick={signInWithGoogle}>
              <PlayCircle className="h-6 w-6" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-40">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">NIKE</div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">APPLE</div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">NETFLIX</div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">RED BULL</div>
          </div>
        </div>

        <div className="mt-32 w-full max-w-7xl mx-auto px-4 animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <div className="rounded-[3rem] border border-slate-200 bg-white p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative">
             <div className="absolute inset-x-0 -bottom-12 flex justify-center z-20">
                <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Security</p>
                        <p className="text-sm font-bold">Enterprise Grade</p>
                      </div>
                   </div>
                   <div className="w-px h-8 bg-white/10"></div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Uptime</p>
                        <p className="text-sm font-bold">99.99% SLA</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-slate-100">
                <Image 
                  src="https://picsum.photos/seed/mediaflow-v2/1600/1000" 
                  alt="MediaFlow Interface" 
                  fill 
                  className="object-cover"
                  priority
                />
             </div>
           </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 bg-slate-50 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-slate-900">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Zap size={16} fill="currentColor" />
            </div>
            <span>MediaFlow</span>
          </div>
          <p className="text-slate-500 font-bold text-sm">
            © {new Date().getFullYear()} MediaFlow Inc. All rights reserved. Built for the elite.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-primary transition-colors font-bold text-sm">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-primary transition-colors font-bold text-sm">Terms</a>
            <a href="#" className="text-slate-500 hover:text-primary transition-colors font-bold text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-white text-[10px] font-black", className)}>
      {children}
    </span>
  );
}
