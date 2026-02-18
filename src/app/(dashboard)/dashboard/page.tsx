
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ShieldCheck,
  Zap
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Workspace Overview</h1>
            {isAdmin && (
              <Badge className="bg-amber-100 text-amber-700 border-none rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase">
                Admin Mode
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.displayName?.split(' ')[0] || 'Marcus'}. Your production pipeline is 82% optimized.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 px-5 border-slate-200 hover:bg-slate-50 font-semibold gap-2">
            <CalendarIcon size={18} />
            {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
          </Button>
          <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform">
            Share Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
        {/* Stage Distribution Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm premium-shadow rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-md p-4">
          <CardHeader className="pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Pipeline Velocity</CardTitle>
                <CardDescription className="text-base font-medium">Weekly throughput across all production stages.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-xl px-3 py-1 font-bold">Real-time</Badge>
              </div>
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

        {/* Fleet Health Overview */}
        <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-slate-900 text-white p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
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
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <Users className="text-primary mb-3" size={20} />
                <p className="text-2xl font-black">12</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Talent</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <Clock className="text-indigo-400 mb-3" size={20} />
                <p className="text-2xl font-black">4.2d</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg. Turnaround</p>
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
              <Button className="w-full rounded-2xl h-12 bg-white text-slate-900 hover:bg-slate-100 font-bold">
                Open Fleet Manager
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-md p-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Activity Stream</CardTitle>
                <CardDescription className="font-medium">Recent events in your workspace.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary rounded-xl font-bold hover:bg-primary/5">History Log</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 mt-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-5 group items-start">
                    <div className="relative pt-1">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-white">
                        <img 
                          src={`https://picsum.photos/seed/user-${activity.avatar}/100/100`} 
                          alt={activity.user}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">
                          {activity.user} <span className="font-medium text-slate-500">{activity.detail}</span>
                        </p>
                        <span className="text-[11px] font-bold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-lg">{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-lg">
                        <Layers size={12} />
                        {activity.project}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-md p-4">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900">Critical Milestones</CardTitle>
              <CardDescription className="font-medium">Due soon in your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 mt-4">
                {[
                  { name: 'Apple Final Cut', milestone: 'Master Delivery', date: 'Oct 24', urgency: 'High', color: 'bg-rose-50 text-rose-600' },
                  { name: 'Red Bull Extreme', milestone: 'VFX Approval', date: 'Oct 26', urgency: 'Medium', color: 'bg-amber-50 text-amber-600' },
                  { name: 'Coca Cola Ads', milestone: 'Final Sound Mix', date: 'Oct 27', urgency: 'Low', color: 'bg-blue-50 text-blue-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-[1.75rem] bg-white border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg", item.color)}>
                        {item.date.split(' ')[1]}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{item.name}</p>
                        <p className="text-sm font-medium text-muted-foreground">{item.milestone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border-none",
                        item.urgency === 'High' ? "bg-rose-100 text-rose-700" : 
                        item.urgency === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {item.urgency}
                      </Badge>
                      <p className="text-[11px] font-bold text-muted-foreground mt-2">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
