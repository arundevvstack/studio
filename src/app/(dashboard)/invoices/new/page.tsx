
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ReceiptRussianRuble, 
  Plus, 
  Trash2, 
  Sparkles, 
  RefreshCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Project, InvoiceItem } from '@/lib/types';
import { createInvoice } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewInvoicePage() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [aggregateRecurring, setAggregateRecurring] = useState(false);
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'projects');
  }, [db]);

  const { data: allProjects, isLoading } = useCollection<Project>(projectsQuery);

  const clients = useMemo(() => {
    if (!allProjects) return [];
    return Array.from(new Set(allProjects.map(p => p.client))).filter(Boolean);
  }, [allProjects]);

  const clientProjects = useMemo(() => {
    if (!selectedClient || !allProjects) return [];
    return allProjects.filter(p => p.client === selectedClient);
  }, [selectedClient, allProjects]);

  const invoiceItems = useMemo(() => {
    const selected = clientProjects.filter(p => selectedProjectIds.includes(p.id));
    
    if (aggregateRecurring) {
      const recurring = selected.filter(p => p.isRecurring);
      const nonRecurring = selected.filter(p => !p.isRecurring);
      
      const items: InvoiceItem[] = nonRecurring.map(p => ({
        description: `Production: ${p.projectName}`,
        amount: p.budget || 0,
        projectId: p.id
      }));

      if (recurring.length > 0) {
        items.push({
          description: `Consolidated Monthly Production (${recurring.length} cycles)`,
          amount: recurring.reduce((sum, p) => sum + (p.budget || 0), 0),
          isRecurringGroup: true
        });
      }
      return items;
    } else {
      return selected.map(p => ({
        description: `${p.isRecurring ? '[Recurring] ' : ''}Production: ${p.projectName}`,
        amount: p.budget || 0,
        projectId: p.id
      }));
    }
  }, [clientProjects, selectedProjectIds, aggregateRecurring]);

  const totalAmount = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  }, [invoiceItems]);

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClient || invoiceItems.length === 0) {
      toast({ title: "Validation Error", description: "Select a client and at least one production phase.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    createInvoice(db, user.uid, {
      clientName: selectedClient,
      totalAmount,
      dueDate,
      items: invoiceItems,
      status: 'Draft'
    });

    toast({ title: "Invoice Provisioned", description: `Draft invoice for ${selectedClient} has been successfully initialized.` });
    router.push('/invoices');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl border hover:bg-white h-12 w-12 transition-all">
          <Link href="/invoices"><ChevronLeft size={24} /></Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Revenue Generation</h1>
          <p className="text-muted-foreground text-lg font-medium">Synthesize production assets into a strategic billing document.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="pt-10 px-10">
              <CardTitle className="text-2xl font-black tracking-tight">Client & Project Synthesis</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Strategic Client</Label>
                <Select value={selectedClient} onValueChange={(val) => {
                  setSelectedClient(val);
                  setSelectedProjectIds([]);
                }}>
                  <SelectTrigger className="rounded-2xl border-slate-200 h-14 text-lg font-bold px-6 bg-slate-50/50">
                    <SelectValue placeholder="Identify client for billing..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl shadow-2xl">
                    {clients.map(client => (
                      <SelectItem key={client} value={client} className="font-bold">{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Production Phases</Label>
                    <div className="flex items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Aggregate Recurring</Label>
                      <Checkbox 
                        checked={aggregateRecurring} 
                        onCheckedChange={(val) => setAggregateRecurring(!!val)}
                        className="rounded-lg h-5 w-5 border-primary data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {clientProjects.map(project => (
                      <div 
                        key={project.id} 
                        className={cn(
                          "p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between",
                          selectedProjectIds.includes(project.id) 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                        onClick={() => handleToggleProject(project.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            selectedProjectIds.includes(project.id) ? "bg-primary border-primary text-white" : "border-slate-200"
                          )}>
                            {selectedProjectIds.includes(project.id) && <CheckCircle2 size={14} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{project.projectName}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black">{project.stage}</Badge>
                               {project.isRecurring && (
                                 <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black flex items-center gap-1">
                                   <RefreshCcw size={10} /> RECURRING
                                 </Badge>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">${(project.budget || 0).toLocaleString()}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400">Budgeted</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-none bg-slate-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
             <CardHeader className="pt-8 px-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-1">
                  <ReceiptRussianRuble size={20} className="text-primary" />
                  <CardTitle className="text-lg font-black tracking-tight">Invoice Synthesis</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="p-8 space-y-10">
                <div className="space-y-6">
                   {invoiceItems.length === 0 ? (
                     <div className="text-center py-10 opacity-30 italic font-medium">No assets selected.</div>
                   ) : (
                     <div className="space-y-4">
                        {invoiceItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-start gap-4 animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${i * 50}ms` }}>
                             <div>
                                <p className="text-sm font-bold text-slate-300 leading-snug">{item.description}</p>
                                {item.isRecurringGroup && <Badge className="mt-1.5 bg-primary/20 text-primary border-none text-[8px] font-black">GROUPED CYCLE</Badge>}
                             </div>
                             <p className="font-black text-sm">${item.amount.toLocaleString()}</p>
                          </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                   <div className="flex items-end justify-between">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total Revenue</p>
                      <p className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Payment Due Date</Label>
                   <Input 
                     type="date" 
                     value={dueDate}
                     onChange={(e) => setDueDate(e.target.value)}
                     className="bg-white/5 border-white/10 rounded-2xl h-12 font-bold text-white focus:ring-primary"
                   />
                </div>

                <Button 
                  className="w-full h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 ios-clickable"
                  disabled={isSubmitting || invoiceItems.length === 0}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Syncing Financials...' : 'Deploy Invoice'}
                </Button>
             </CardContent>
          </Card>

          <Card className="glass-card border-none p-2 bg-white/40 border border-white/60">
             <CardContent className="p-6">
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Sparkles size={18} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Auto-Aggregation</p>
                      <p className="text-[10px] font-medium leading-tight">Recurring projects for the same client are grouped for strategic clarity.</p>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
