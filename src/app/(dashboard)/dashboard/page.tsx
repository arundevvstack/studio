"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Layers, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  MoreHorizontal, 
  ArrowUpRight, 
  Calendar as CalendarIcon, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';

const kpis = [
  { title: 'Total Projects', value: '24', icon: Layers, trend: '+3 this month', trendType: 'up', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Active Studio', value: '18', icon: TrendingUp, trend: '85% active', trendType: 'up', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'At Risk', value: '2', icon: AlertCircle, trend: '-1 from last week', trendType: 'down', color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Monthly Delivery', value: '6', icon: CheckCircle2, trend: '+20% vs target', trendType: 'up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const activityData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1000 },
];

const recentActivity = [
  { id: 1, type: 'status', project: 'Nike Summer Campaign', user: 'Alex Rivera', detail: 'moved to Post Production', time: '2 hours ago', avatar: '1' },
  { id: 2, type: 'note', project: 'Spotify Brand Refresh', user: 'Emma Chen', detail: 'added a new production brief', time: '4 hours ago', avatar: '2' },
  { id: 3, type: 'release', project: 'Netflix Series S2', user: 'System', detail: 'was officially released', time: 'Yesterday', avatar: '3' },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Workspace Overview</h1>
            {isAdmin && (
              <Badge className="bg-amber-100 text-amber-700 border-none rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase flex items-center gap-1.5">
                <ShieldCheck size={12} /> Root Admin
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.displayName?.split(' ')[0] || 'Member'}. Your pipeline is fully optimized.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 px-5 border-slate-200 hover:bg-slate-50 font-semibold gap-2">
            <CalendarIcon size={18} />
            {currentTime}
          </Button>
          <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-all">
            Share Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md hover:translate-y-[-4px] transition-all duration-500 group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform duration-500`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground">
                <MoreHorizontal size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{kpi.title}</p>
              <div className="text-4xl font-black mb-2 text-slate-900">{kpi.value}</div>
              <div className={cn(
                "text-xs font-bold flex items-center gap-1",
                kpi.trendType === 'up' ? "text-emerald-600" : "text-orange-600"
              )}>
                {kpi.trendType === 'up' ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm premium-shadow rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-md p-4">
          <CardHeader className="pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Pipeline Velocity</CardTitle>
                <CardDescription className="text-base font-medium">Weekly throughput across all production stages.</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-none rounded-xl px-3 py-1 font-bold">Real-time Analytics</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-slate-900 text-white p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full"></div>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold">Studio Performance</CardTitle>
            <CardDescription className="text-slate-400 font-medium">System-wide health metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">Project Delivery Rate</span>
                <span className="font-black text-primary">94%</span>
              </div>
              <Progress value={94} className="h-2 rounded-full bg-slate-800" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Users className="text-primary mb-3" size={20} />
                <p className="text-2xl font-black">12</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Talent</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Clock className="text-indigo-400 mb-3" size={20} />
                <p className="text-2xl font-black">4.2d</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Turnaround</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">18 Assets Verified</p>
                  <p className="text-xs text-slate-400">Ready for master delivery</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
