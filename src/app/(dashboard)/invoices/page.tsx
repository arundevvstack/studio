"use client";

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  ShieldAlert,
  FileText,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Invoice } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { deleteInvoice } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const { user, isAdmin } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

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

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteInvoice(db, id);
    toast({
      title: "Invoice Deleted",
      description: "Financial record has been removed from the system.",
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 animate-in fade-in duration-700">
        <div className="p-8 rounded-[5px] bg-rose-50/50 text-rose-600 border border-rose-100">
          <ShieldAlert size={64} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-muted-foreground text-sm font-medium max-w-md">
            Billing and financial intelligence require Administrator-level clearance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-tight">Billing</h1>
          <p className="text-slate-500 text-sm font-medium opacity-80">Managing strategic client accounts and production revenue.</p>
        </div>
        <Button className="glass-pill h-10 px-6 shadow-sm font-black bg-primary text-xs ios-clickable" asChild>
          <Link href="/invoices/new">
            <Plus size={16} className="mr-2" strokeWidth={3} />
            Generate Invoice
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 glass-pill p-3 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search invoice ID or client..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0 h-10 text-sm font-bold placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="glass-pill h-10 px-6 gap-2 border-slate-200 hover:bg-white font-black text-xs ios-clickable">
          <Filter size={16} />
          Refine
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-white/30 h-12">
            <TableRow className="hover:bg-transparent border-b border-slate-200/40">
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400 pl-6">Invoice ID</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Strategic Client</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Total Amount</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Status</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400">Due Date</TableHead>
              <TableHead className="font-black uppercase tracking-widest text-[9px] text-slate-400 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center animate-pulse font-bold text-slate-400 uppercase tracking-widest text-[10px]">Syncing Billing Data...</TableCell></TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic font-medium text-xs">No billing records found.</TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-white/40 transition-all border-b border-slate-200/20 last:border-0 h-14">
                  <TableCell className="pl-6">
                    <Link href={`/invoices/${invoice.id}`} className="group flex flex-col">
                      <div className="font-arial font-black text-slate-900 tracking-tighter text-[12px] group-hover:text-primary transition-colors uppercase">INV-{invoice.id.slice(0, 6)}</div>
                      <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Issued: {invoice.createdAt?.seconds ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString() : '---'}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-arial font-bold text-slate-700 text-[12px]">{invoice.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-arial text-[12px] font-black text-slate-900 tracking-tight">₹{invoice.totalAmount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-none", getStatusColor(invoice.status))}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Clock size={12} className="text-primary opacity-60" />
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 glass-pill hover:bg-white hover:text-primary transition-all ios-clickable" asChild title="Edit Record">
                        <Link href={`/invoices/edit/${invoice.id}`}>
                          <Edit2 size={14} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 glass-pill hover:bg-white hover:text-primary transition-all ios-clickable" asChild title="View Details">
                        <Link href={`/invoices/${invoice.id}`}>
                          <FileText size={14} />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 glass-pill hover:bg-rose-50 hover:text-rose-500 transition-all ios-clickable" title="Delete Record">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[5px] border-none shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Revoke Record?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 text-sm font-medium">
                              Permanently delete the record for <span className="text-slate-900 font-bold">{invoice.clientName}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-2">
                            <AlertDialogCancel className="rounded-[3px] font-bold text-xs h-9">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="rounded-[3px] font-black bg-rose-500 hover:bg-rose-600 text-xs h-9" onClick={() => handleDelete(invoice.id)}>
                              Confirm Deletion
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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