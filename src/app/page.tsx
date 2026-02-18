"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { FolderKanban, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>

        <div className="z-10 text-center max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground premium-shadow">
              <FolderKanban size={28} />
            </div>
            <span className="text-3xl font-bold tracking-tight text-foreground">MediaFlow</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900 leading-tight">
            Media production <br />
            <span className="text-primary-foreground bg-primary px-4 py-1 rounded-2xl shadow-sm">refined</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            The premium workspace for creative teams. Manage your media projects from idea to release with elegant simplicity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-2xl px-8 h-12 text-lg shadow-xl hover:translate-y-[-2px] transition-all" onClick={signInWithGoogle}>
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-8 h-12 text-lg bg-white/50 backdrop-blur-sm border-white/50" onClick={signInWithGoogle}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl px-4 animate-in fade-in zoom-in duration-1000 delay-500">
           <div className="rounded-3xl border bg-card/50 backdrop-blur-xl p-4 shadow-2xl premium-shadow">
             <div className="relative aspect-video rounded-2xl overflow-hidden border">
                <Image 
                  src="https://picsum.photos/seed/mediaflow-dashboard/1200/800" 
                  alt="MediaFlow Dashboard Preview" 
                  fill 
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
             </div>
           </div>
        </div>
      </main>

      <footer className="py-8 px-4 border-t text-center text-muted-foreground text-sm bg-white/30 backdrop-blur-sm">
        © {new Date().getFullYear()} MediaFlow Inc. Built for creative perfection.
      </footer>
    </div>
  );
}