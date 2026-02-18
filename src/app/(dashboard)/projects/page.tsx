"use client";

import { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Clock, 
  Users,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { subscribeToProjects } from '@/lib/firebase/firestore';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = subscribeToProjects(setProjects);
    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Released': return 'bg-green-100 text-green-700 border-green-200';
      case 'Discussion': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pre Production': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Production': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Post Production': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDeadline = (deadline: any) => {
    if (!isMounted || !deadline) return 'N/A';
    return new Date(deadline.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all media productions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-xl">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-lg h-8 w-8 p-0"
              onClick={() => setView('table')}
            >
              <List size={18} />
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-lg h-8 w-8 p-0"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} />
            </Button>
          </div>
          <Button className="rounded-xl gap-2 shadow-sm font-medium" asChild>
            <Link href="/projects/new">
              <Plus size={18} />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm premium-shadow">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects by name or client..." 
            className="pl-10 border-none bg-muted/50 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 border-none bg-muted/50 hover:bg-muted">
          <Filter size={18} />
          Filter
        </Button>
      </div>

      {view === 'table' ? (
        <Card className="border-none shadow-sm premium-shadow rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[300px]">Project</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/30 transition-colors border-b last:border-0 group">
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="block">
                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{project.projectName}</div>
                        <div className="text-xs text-muted-foreground">{project.client}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[11px] font-semibold border-none", getStageColor(project.stage))}>
                        {project.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Clock size={14} className="text-primary" />
                        {formatDeadline(project.deadline)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold overflow-hidden ring-1 ring-slate-100">
                             <img src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="Avatar" />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl border p-2">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" asChild>
                             <Link href={`/projects/${project.id}`}><Eye size={14} /> View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer"><Edit2 size={14} /> Edit Project</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg gap-2 text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 size={14} /> Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-none shadow-sm premium-shadow rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group">
              <div className="h-32 bg-slate-200 relative overflow-hidden">
                <img src={`https://picsum.photos/seed/${project.id}/600/400`} alt="Cover" className="object-cover w-full h-full" />
                <div className="absolute top-3 right-3">
                  <Badge className={cn("rounded-lg border-none font-bold shadow-sm", getStageColor(project.stage))}>
                    {project.stage}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <Link href={`/projects/${project.id}`}>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{project.projectName}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4">{project.client}</p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5 rounded-full" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                       <Clock size={14} />
                       {formatDeadline(project.deadline)}
                    </div>
                    <div className="flex -space-x-2">
                      <Users size={14} className="mr-2 text-muted-foreground" />
                      {[1, 2].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold overflow-hidden ring-1 ring-slate-100">
                          <img src={`https://picsum.photos/seed/${i + 20}/100/100`} alt="Avatar" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
