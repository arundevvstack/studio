"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, PlayCircle, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

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
          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
              <a key={item} href="#" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="rounded-2xl font-bold px-6 h-11" onClick={signInWithGoogle}>
              Sign In
            </Button>
            <Button className="rounded-2xl font-bold px-8 h-11 shadow-xl shadow-primary/25" onClick={signInWithGoogle}>
              Start Free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-48 pb-32 px-8 relative">
        <div className="max-w-6xl mx-auto text-center z-10 relative space-y-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none px-2.5 font-bold">New</Badge>
            <span className="text-xs font-bold text-slate-600 tracking-tight flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              AI-Powered Production Workflows are here
            </span>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-7xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Production OS for <br />
              the <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Creative Elite.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Beautifully simple project management for modern studios. 
              Automate your workflow, coordinate talent, and release faster.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button size="lg" className="rounded-[2rem] px-12 h-20 text-xl font-black shadow-2xl shadow-primary/40 hover:translate-y-[-4px] transition-all bg-primary" onClick={signInWithGoogle}>
              Get Started Free
              <ArrowRight className="ml-3 h-6 w-6" strokeWidth={3} />
            </Button>
            <Button size="lg" variant="outline" className="rounded-[2rem] px-12 h-20 text-xl font-bold bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white transition-all gap-3" onClick={signInWithGoogle}>
              <PlayCircle className="h-6 w-6" />
              Book a Demo
            </Button>
          </div>

          <div className="pt-24 w-full max-w-7xl mx-auto px-4">
            <div className="rounded-[3.5rem] border border-slate-200/50 bg-white/40 p-5 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] backdrop-blur-xl relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner">
                <Image 
                  src="https://picsum.photos/seed/mediaflow-v2/1600/1000" 
                  alt="MediaFlow Platform" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="pt-40 space-y-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Trusted by modern production giants</p>
            <div className="flex flex-wrap items-center justify-center gap-16 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {['NIKE', 'APPLE', 'NETFLIX', 'RED BULL', 'ADIDAS'].map((brand) => (
                <div key={brand} className="text-2xl font-black tracking-tighter text-slate-900">{brand}</div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <Zap size={18} fill="currentColor" />
              </div>
              <span>MediaFlow</span>
            </div>
            <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
              The only platform built specifically for high-velocity media production teams.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">Product</h4>
            <ul className="space-y-4 text-sm font-semibold text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900">Legal</h4>
            <ul className="space-y-4 text-sm font-semibold text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            © {currentYear || '...'} MediaFlow Technologies Inc.
          </p>
          <div className="flex gap-8">
            <div className="w-6 h-6 rounded-full bg-slate-100"></div>
            <div className="w-6 h-6 rounded-full bg-slate-100"></div>
            <div className="w-6 h-6 rounded-full bg-slate-100"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}