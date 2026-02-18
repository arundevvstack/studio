"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-context';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    
    if (!isAdmin) {
      return query(
        collection(db, 'projects'),
        where('assignedTeamMemberIds', 'array-contains', user.uid),
        orderBy('deadline', 'asc')
      );
    }
    
    return query(collection(db, 'projects'), orderBy('deadline', 'asc'));
  }, [db, user, isAdmin]);

  const { data: projects, isLoading, error } = useCollection<Project>(projectsQuery);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getProjectsForDay = (day: Date) => {
    return (projects || []).filter(project => {
      if (!project.deadline) return false;
      const deadlineDate = project.deadline.seconds 
        ? new Date(project.deadline.seconds * 1000) 
        : new Date(project.deadline);
      return isSameDay(day, deadlineDate);
    });
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Released': return 'bg-emerald-500 text-white';
      case 'Discussion': return 'bg-blue-500 text-white';
      case 'Pre Production': return 'bg-indigo-500 text-white';
      case 'Production': return 'bg-amber-500 text-white';
      case 'Post Production': return 'bg-rose-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Production schedule visibility is restricted based on project assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Production Schedule</h1>
          <p className="text-muted-foreground text-lg">Visualizing delivery milestones across the timeline.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl p-1.5 rounded-2xl border shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl h-10 w-10">
            <ChevronLeft size={20} />
          </Button>
          <div className="px-4 font-black text-sm uppercase tracking-widest min-w-[140px] text-center">
            {isMounted ? format(currentDate, 'MMMM yyyy') : 'Loading...'}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl h-10 w-10">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div className="border-none shadow-2xl premium-shadow rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayProjects = getProjectsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "min-h-[160px] p-4 border-r border-b last:border-r-0 transition-colors group relative",
                  !isCurrentMonth ? "bg-slate-50/30 opacity-40" : "bg-white/40 hover:bg-white/80",
                  isToday(day) && "ring-2 ring-primary ring-inset z-10"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-sm font-black transition-all",
                    isToday(day) ? "text-primary" : "text-slate-400 group-hover:text-slate-900"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isToday(day) && <Badge className="rounded-lg h-5 px-2 bg-primary text-[9px] font-black uppercase tracking-widest border-none">Today</Badge>}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                  {dayProjects.map((project) => (
                    <Link 
                      key={project.id} 
                      href={`/projects/${project.id}`}
                      className="block group/item"
                    >
                      <div className={cn(
                        "rounded-lg p-2 text-[10px] font-bold truncate transition-all flex items-center gap-1.5",
                        getStageColor(project.stage),
                        "hover:scale-[1.02] shadow-sm hover:shadow-md"
                      )}>
                        <Layers size={10} strokeWidth={3} />
                        {project.projectName}
                      </div>
                    </Link>
                  ))}
                  {dayProjects.length === 0 && isCurrentMonth && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" className="w-full h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-primary gap-1" asChild>
                         <Link href="/projects/new">
                           Schedule <ArrowRight size={10} />
                         </Link>
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
