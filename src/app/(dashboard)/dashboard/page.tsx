"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Users, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const kpis = [
  { title: 'Total Projects', value: '24', icon: Layers, trend: '+3 this month', color: 'text-primary' },
  { title: 'In Progress', value: '18', icon: TrendingUp, trend: '85% active', color: 'text-accent-foreground' },
  { title: 'Overdue', value: '2', icon: AlertCircle, trend: '-1 from last week', color: 'text-destructive' },
  { title: 'Released (Mo)', value: '6', icon: CheckCircle2, trend: '+20% vs target', color: 'text-green-500' },
];

const stageData = [
  { name: 'Discussion', count: 4, color: '#A0D2EB' },
  { name: 'Pre-Prod', count: 6, color: '#C1E1C1' },
  { name: 'Production', count: 8, color: '#7EB5D6' },
  { name: 'Post-Prod', count: 4, color: '#B2D6C5' },
  { name: 'Released', count: 2, color: '#D1E8F7' },
];

const recentActivity = [
  { id: 1, type: 'status', project: 'Nike Summer Campaign', user: 'Alex Rivera', detail: 'moved to Post Production', time: '2 hours ago' },
  { id: 2, type: 'note', project: 'Spotify Brand Refresh', user: 'Emma Chen', detail: 'added a new production brief', time: '4 hours ago' },
  { id: 3, type: 'release', project: 'Netflix Series S2', user: 'System', detail: 'was officially released', time: 'Yesterday' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's a snapshot of your media pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-lg px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Last updated 5m ago
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-xl bg-muted/50 ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                {kpi.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stage Distribution Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm premium-shadow rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
            <CardDescription>Projects currently active across all production stages.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Health / Progress Summary */}
        <Card className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
            <CardDescription>Overall fleet performance and status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Production Completion</span>
                <span className="text-muted-foreground">72%</span>
              </div>
              <Progress value={72} className="h-2 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Budget Utilization</span>
                <span className="text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2 rounded-full bg-slate-100" />
            </div>
            
            <div className="pt-4 space-y-4 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-accent-foreground">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">12 Projects On Track</p>
                  <p className="text-xs text-muted-foreground">Proceeding as planned</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">2 Blocked Projects</p>
                  <p className="text-xs text-muted-foreground">Awaiting client approval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
         <Card className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates across your project portfolio.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary rounded-xl hover:bg-primary/10">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 relative group">
                    <div className="relative z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-[0_0_10px_rgba(160,210,235,0.8)]"></div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <p className="text-sm font-medium leading-none">
                          <span className="font-bold">{activity.user}</span> {activity.detail}
                        </p>
                        <span className="text-[11px] text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Layers size={10} />
                        {activity.project}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Major milestones due in the next 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Apple Final Cut', milestone: 'Master Delivery', date: 'Oct 24', urgency: 'High' },
                  { name: 'Red Bull Extreme', milestone: 'VFX Approval', date: 'Oct 26', urgency: 'Medium' },
                  { name: 'Coca Cola Ads', milestone: 'Final Sound Mix', date: 'Oct 27', urgency: 'Low' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border text-muted-foreground">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.milestone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.date}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-4 px-1.5 rounded-md",
                        item.urgency === 'High' ? "text-destructive border-destructive/20 bg-destructive/5" : "text-muted-foreground"
                      )}>
                        {item.urgency}
                      </Badge>
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