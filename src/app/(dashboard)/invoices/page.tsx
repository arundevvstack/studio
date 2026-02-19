
"use client";

import { useState, useMemo } from 'react';
import { 
  ReceiptRussianRuble, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Invoice } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const { user, isAdmin } = useUser();
  const db = useFirestore();

  const invoicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: invoices, isLoading, error } = useCollection<Invoice>(invoicesQuery);

  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter(inv => 
      inv.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600';
      case 'Sent': return 'bg-blue-50 text-blue-600';
      case 'Overdue': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 animate-in fade-in duration-700">
        <div className="p-8 rounded-[2.5rem] bg-rose-50/50 text-rose-600 border border-rose-100">
          <ShieldAlert size={64} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-muted-foreground text-lg font-medium max-w-md">
            Billing and financial intelligence require Administrator-level clearance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Billing</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Managing strategic client accounts and production revenue.</p>
        </div>
        <Button className="glass-pill h-14 px-8 shadow-2xl shadow-primary/25 font-black bg-primary ios-clickable" asChild>
          <Link href="/invoices/new">
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Generate Invoice
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-6 glass-pill p-5 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search invoice ID or client..." 
            className="pl-14 border-none bg-transparent focus-visible:ring-0 h-12 text-lg font-bold placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="glass-pill h-12 px-8 gap-2 border-slate-200 hover:bg-white font-black ios-clickable">
          <Filter size={20} />
          Refine
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-white/30 h-16">
            <TableRow className="hover:bg-transparent border-b border-slate-200/40">
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 pl-10">Invoice ID</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Strategic Client</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Total Amount</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Status</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400">Due Date</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 text-right pr-10">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-64 text-center animate-pulse font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Billing Data...</TableCell></TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-slate-400 italic font-medium">No billing records found.</TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-white/40 transition-all border-b border-slate-200/20 last:border-0 h-24">
                  <TableCell className="pl-10">
                    <div className="font-black text-slate-900 tracking-tighter">INV-{invoice.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Issued: {new Date(invoice.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-700">{invoice.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-lg font-black text-slate-900 tracking-tight">${invoice.totalAmount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none", getStatusColor(invoice.status))}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                      <Clock size={14} className="text-primary opacity-60" />
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <Button variant="ghost" size="icon" className="h-11 w-11 glass-pill hover:bg-white hover:text-primary transition-all ios-clickable">
                      <ChevronRight size={22} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
