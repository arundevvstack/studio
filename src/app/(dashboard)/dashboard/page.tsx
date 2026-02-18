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
  ShieldCheck,
  Users,
  Clock
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

export default function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user || authLoading) return null;
    
    const projectsRef = collection(db, 'projects');
    if (isAdmin) {
      return query(projectsRef, orderBy('createdAt', 'desc'));
    }
    
    return query(
      projectsRef,
      where('assignedTeamMemberIds', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid, isAdmin, authLoading]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const stats = useMemo(() => {
    if (!projects) return { total: 0, active: 0, atRisk: 0, delivered: 0, avgProgress: 0 };
    
    const total = projects.length;
    const active = projects.filter(p => p.stage !== 'Released').length;
    const atRisk = projects.filter(p => p.priority === 'High' && p.stage !== 'Released').length;
    const delivered = projects.filter(p => p.stage === 'Released').length;
    const avgProgress = total > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total) 
      : 0;

    return { total, active, atRisk, delivered, avgProgress };
  }, [projects]);

  const kpis = [
    { title: 'Portfolio', value: stats.total.toString(), icon: Layers, trend: 'Total Volume', trendType: 'up', color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Active', value: stats.active.toString(), icon: TrendingUp, trend: 'Production', trendType: 'up', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Priority', value: stats.atRisk.toString(), icon: AlertCircle, trend: 'High Risk', trendType: 'down', color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Delivered', value: stats.delivered.toString(), icon: CheckCircle2, trend: 'Finalized', trendType: 'up', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const activityData = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 7).reverse().map((p, i) => ({
      name: `P${i + 1}`,
      value: p.progress || 0
    }));
  }, [projects]);

  if (!mounted) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">Dashboard</h1>
            {isAdmin && (
              <Badge className="bg-amber-100 text-amber-700 border-none rounded-xl px-2.5 py-1 font-bold text-[10px] uppercase">
                System Administrator
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-xl font-medium">Hello, {user?.displayName?.split(' ')[0] || 'User'}. Here's your studio overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 bg-white/50 backdrop-blur-xl font-bold gap-2">
            <CalendarIcon size={18} />
            {currentTime}
          </Button>
          <Button className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/25 font-black bg-primary hover:scale-[1.02] transition-all">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="ios-card group border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8">
              <div className={`p-4 rounded-[1.5rem] ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform duration-500`}>
                <kpi.icon size={24} strokeWidth={2.5} />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <MoreHorizontal size={20} />
              </Button>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.title}</p>
              <div className="text-5xl font-black mb-3 text-slate-900 tracking-tighter">{kpi.value}</div>
              <div className={cn(
                "text-sm font-bold flex items-center gap-1.5",
                kpi.trendType === 'up' ? "text-emerald-600" : "text-orange-600"
              )}>
                {kpi.trendType === 'up' ? <ArrowUpRight size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <Card className="lg:col-span-2 ios-card border-none">
          <CardHeader className="pb-10 pt-10 px-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Production Velocity</CardTitle>
                <CardDescription className="text-lg font-medium text-slate-500">Pipeline completion metrics for latest cycles.</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-none rounded-xl px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">Global Analytics</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] px-10 pb-10">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-50 rounded-[2.5rem]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2}}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '16px 20px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="ios-card border-none bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
          <CardHeader className="pb-10 pt-10 px-10">
            <CardTitle className="text-2xl font-black tracking-tight">System Health</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Core performance indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 px-10 pb-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300 uppercase tracking-widest text-[11px]">System Completion Rate</span>
                <span className="font-black text-primary text-lg">{stats.avgProgress}%</span>
              </div>
              <Progress value={stats.avgProgress} className="h-3 rounded-full bg-white/10" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-all">
                <Users className="text-primary mb-4" size={24} />
                <p className="text-3xl font-black tracking-tighter">{stats.total}</p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Total Assets</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-all">
                <Clock className="text-indigo-400 mb-4" size={24} />
                <p className="text-3xl font-black tracking-tighter">{stats.delivered}</p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Released</p>
              </div>
            </div>

            <div className="pt-10 border-t border-white/10">
              <div className="flex items-center gap-5 p-4 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="text-lg font-black">{stats.delivered} Successes</p>
                  <p className="text-sm text-slate-400 font-medium">All assets provisioned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}