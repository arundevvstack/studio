'use client';

import { Topbar } from '@/components/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { BarChart3, Users, Briefcase, Activity, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'projects'), orderBy('updatedAt', 'desc'), limit(5));
  }, [db]);

  const { data: recentProjects, isLoading: isProjectsLoading } = useCollection(projectsQuery);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Authenticating nodes...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Active Campaigns', value: '12', icon: Briefcase, color: 'text-blue-500' },
    { label: 'Studio Personnel', value: '08', icon: Users, color: 'text-emerald-500' },
    { label: 'Growth Efficiency', value: '94%', icon: BarChart3, color: 'text-amber-500' },
    { label: 'Real-time Nodes', value: '1,204', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Topbar />
      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Studio Overview</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Welcome back, {user?.displayName?.split(' ')[0] || 'Producer'}.</p>
          </div>
          <Button className="h-9 rounded-lg gap-2 font-bold uppercase tracking-widest text-[10px] shadow-sm">
            <Plus className="h-3 w-3" /> New Campaign
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold tracking-tighter">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg bg-muted/50 ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">High-Priority Productions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentProjects && recentProjects.length > 0 ? (
                <div className="divide-y">
                  {recentProjects.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{p.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{p.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <div className="w-24 bg-muted rounded-full h-1 overflow-hidden mb-1">
                              <div className="bg-primary h-full" style={{ width: `${p.progress}%` }} />
                           </div>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{p.progress}% COMPLETE</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-widest border border-blue-100">
                          {p.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isProjectsLoading ? (
                <div className="p-16 text-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Querying project registry...</p>
                </div>
              ) : (
                <div className="p-16 text-center space-y-3">
                  <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto">
                    <Briefcase className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground italic text-[11px] uppercase tracking-widest font-bold">No active production nodes detected.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Production Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregate Progress</span>
                    <span className="text-sm font-bold tracking-tighter text-primary">72%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden border">
                    <div className="bg-primary h-full w-[72%] transition-all" />
                  </div>
               </div>
               <div className="space-y-4 pt-6 border-t">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">AI Strategy Insights</p>
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg space-y-2">
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                      3 Team Invitations pending synthesis. Recruitment engine ready for deployment.
                    </p>
                    <Link href="/profile" className="text-[9px] font-bold text-amber-700 uppercase tracking-widest hover:underline flex items-center gap-1">
                      Review Dossier →
                    </Link>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}