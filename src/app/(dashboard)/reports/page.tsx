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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Target, 
  Download, 
  Filter, 
  Calendar,
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Project } from '@/lib/types';
import { useAuth } from '@/lib/firebase/auth-context';

const COLORS = ['#A0D2EB', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    
    // Admins can see the whole studio, members only see their assigned ones.
    if (!isAdmin) {
      return query(
        collection(db, 'projects'),
        where('assignedTeamMemberIds', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );
    }
    
    return query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  }, [db, user, isAdmin]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  // Aggregate data for charts
  const stageData = projects ? Object.entries(
    projects.reduce((acc, p) => {
      acc[p.stage] = (acc[p.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })) : [];

  const clientBudgetData = projects ? Object.entries(
    projects.reduce((acc, p) => {
      acc[p.client] = (acc[p.client] || 0) + (Number(p.budget) || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, budget]) => ({ name, budget })) : [];

  const totalBudget = projects?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;
  const avgProgress = projects?.length ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0;
  const activeProjects = projects?.filter(p => p.stage !== 'Released').length || 0;

  if (!isMounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Intelligence Reports</h1>
          <p className="text-muted-foreground text-lg">Visualizing studio performance and financial throughput.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 font-bold gap-2">
            <Download size={18} /> Export Data
          </Button>
          <Button className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 font-black bg-primary">
            Schedule Auto-Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black uppercase">Healthy</Badge>
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Portfolio Value</p>
            <div className="text-3xl font-black text-slate-900">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-none rounded-lg text-[10px] font-black uppercase">On Track</Badge>
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Completion</p>
            <div className="text-3xl font-black text-slate-900">{avgProgress}%</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-none rounded-lg text-[10px] font-black uppercase">High Volume</Badge>
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Active Pipeline</p>
            <div className="text-3xl font-black text-slate-900">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm premium-shadow rounded-[2rem] bg-white/70 backdrop-blur-md">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none rounded-lg text-[10px] font-black uppercase">Live</Badge>
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Entities</p>
            <div className="text-3xl font-black text-slate-900">{projects?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-xl overflow-hidden p-2">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Stage Distribution</CardTitle>
                <CardDescription className="text-sm font-medium">Breakdown of projects by production lifecycle phase.</CardDescription>
              </div>
              <PieChartIcon className="text-slate-400" size={24} />
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-white/70 backdrop-blur-xl overflow-hidden p-2">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Budget Allocation</CardTitle>
                <CardDescription className="text-sm font-medium">Strategic spend across primary clients.</CardDescription>
              </div>
              <BarChart3 className="text-slate-400" size={24} />
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientBudgetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Budget']}
                />
                <Bar 
                  dataKey="budget" 
                  fill="hsl(var(--primary))" 
                  radius={[12, 12, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm premium-shadow rounded-[2.5rem] bg-slate-900 text-white p-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full"></div>
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-black">Strategic Pipeline Forecast</CardTitle>
          <CardDescription className="text-slate-400 font-medium">Projected delivery velocity based on current phase distribution.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] px-8">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projects ? projects.slice(0, 7).reverse().map((p, i) => ({ name: `P${i+1}`, progress: p.progress })) : []}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="progress" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" />
              </AreaChart>
           </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}