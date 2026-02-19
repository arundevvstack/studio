"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal, 
  ArrowUpRight, 
  Calendar as CalendarIcon, 
  Users,
  Clock,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user || authLoading) return null;
    const projectsRef = collection(db, 'projects');
    if (isAdmin) return query(projectsRef, orderBy('createdAt', 'desc'));
    return query(projectsRef, where('assignedTeamMemberIds', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user?.uid, isAdmin, authLoading]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const stats = useMemo(() => {
    if (!projects) return { total: 0, active: 0, atRisk: 0, delivered: 0, avgProgress: 0 };
    const total = projects.length;
    const active = projects.filter(p => p.stage !== 'Released').length;
    const atRisk = projects.filter(p => p.priority === 'High' && p.stage !== 'Released').length;
    const delivered = projects.filter(p => p.stage === 'Released').length;
    const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;
    return { total, active, atRisk, delivered, avgProgress };
  }, [projects]);

  const kpis = [
    { title: 'Portfolio', value: stats.total.toString(), icon: Layers, trend: 'Volume', trendType: 'up', color: 'text-blue-500', bg: 'bg-blue-50/50' },
    { title: 'Active', value: stats.active.toString(), icon: TrendingUp, trend: 'Production', trendType: 'up', color: 'text-indigo-500', bg: 'bg-indigo-50/50' },
    { title: 'Priority', value: stats.atRisk.toString(), icon: AlertCircle, trend: 'High Risk', trendType: 'down', color: 'text-rose-500', bg: 'bg-rose-50/50' },
    { title: 'Delivered', value: stats.delivered.toString(), icon: CheckCircle2, trend: 'Finalized', trendType: 'up', color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
  ];

  const activityData = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 6).reverse().map((p, i) => ({
      name: `Cycle ${i + 1}`,
      value: p.progress || 0
    }));
  }, [projects]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Workspace</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Hello, {user?.displayName?.split(' ')[0] || 'User'}. Projects overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="glass-pill h-12 px-6 font-bold gap-2 ios-clickable" asChild>
            <Link href="/calendar">
              <CalendarIcon size={18} />
              {currentTime}
            </Link>
          </Button>
          <Button className="glass-pill h-12 px-8 shadow-xl shadow-primary/20 font-black bg-primary ios-clickable">
            <Download size={18} className="mr-2" />
            Synthesis Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="glass-card border-none ios-card-hover group">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8">
              <div className={`p-3.5 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-all duration-500`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-40">
                <MoreHorizontal size={18} />
              </Button>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.title}</p>
              <div className="text-4xl font-black mb-2 text-slate-900 tracking-tighter">{kpi.value}</div>
              <div className={cn(
                "text-[10px] font-black flex items-center gap-1 uppercase tracking-widest",
                kpi.trendType === 'up' ? "text-emerald-600" : "text-rose-600"
              )}>
                {kpi.trendType === 'up' ? <ArrowUpRight size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card border-none ios-card-hover overflow-hidden">
          <CardHeader className="pb-8 pt-10 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Production Velocity</CardTitle>
                <CardDescription className="text-base font-medium text-slate-500">Global throughput across active cycles.</CardDescription>
              </div>
              <Badge className="bg-primary/5 text-primary border-none rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest">Analytics</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] px-8 pb-10">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-50/50 rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2}}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', padding: '16px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-slate-900 text-white relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] rounded-full group-hover:scale-150 transition-all duration-1000"></div>
          <CardHeader className="pb-8 pt-10 px-8">
            <CardTitle className="text-xl font-black tracking-tight">System Health</CardTitle>
            <CardDescription className="text-slate-400 text-sm font-medium">Core optimization metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 px-8 pb-10">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-slate-500">Avg. Completion</span>
                <span className="text-primary">{stats.avgProgress}%</span>
              </div>
              <Progress value={stats.avgProgress} className="h-2 rounded-full bg-white/10" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/5 ios-card-hover">
                <Users className="text-primary mb-3" size={20} />
                <p className="text-3xl font-black tracking-tighter">{stats.total}</p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Assets</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/5 ios-card-hover">
                <Clock className="text-indigo-400 mb-3" size={20} />
                <p className="text-3xl font-black tracking-tighter">{stats.delivered}</p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Released</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-base font-black tracking-tight">System Stabilized</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stats.delivered} milestones reached</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
