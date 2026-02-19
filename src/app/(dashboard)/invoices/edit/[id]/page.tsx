
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  Calendar,
  CreditCard,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { updateInvoice } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function EditInvoicePage() {
  const { id } = useParams() as { id: string };
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<InvoiceStatus>('Draft');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invoiceRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'invoices', id);
  }, [db, id]);

  const { data: invoice, isLoading } = useDoc<Invoice>(invoiceRef);

  useEffect(() => {
    if (invoice) {
      setStatus(invoice.status);
      setDueDate(invoice.dueDate);
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !id) return;

    setIsSubmitting(true);
    updateInvoice(db, id, {
      status,
      dueDate
    });

    toast({
      title: "Invoice Updated",
      description: `Record for ${invoice?.clientName} has been synchronized.`,
    });
    
    router.push('/invoices');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Accessing Record...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Record Missing</h2>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/invoices">Return to Billing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl border hover:bg-white h-12 w-12 transition-all shadow-sm">
          <Link href="/invoices"><ChevronLeft size={24} /></Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Edit Record</h1>
          <p className="text-muted-foreground text-lg font-medium">Modifying financial entity INV-{id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="pt-10 px-10">
              <CardTitle className="text-2xl font-black tracking-tight">Synthesis Details</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Strategic Client</p>
                  <p className="text-xl font-black text-slate-900">{invoice.clientName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Lifecycle</Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as InvoiceStatus)}>
                    <SelectTrigger className="rounded-2xl border-slate-200 h-14 text-base font-bold px-6 bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl shadow-2xl">
                      <SelectItem value="Draft" className="font-bold">Draft</SelectItem>
                      <SelectItem value="Sent" className="font-bold">Sent</SelectItem>
                      <SelectItem value="Paid" className="font-bold text-emerald-600">Paid</SelectItem>
                      <SelectItem value="Overdue" className="font-bold text-rose-600">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Due Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="pl-12 rounded-2xl border-slate-200 h-14 font-bold bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-none bg-slate-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
             <CardHeader className="pt-8 px-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-primary" />
                  <CardTitle className="text-lg font-black tracking-tight">Commitment</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="p-8 space-y-10">
                <div>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Valuation</p>
                   <p className="text-5xl font-black text-white tracking-tighter">₹{invoice.totalAmount.toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{invoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>GST (18%)</span>
                    <span>₹{(invoice.totalAmount * 0.18).toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 ios-clickable"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Syncing...' : 'Save Changes'}
                  <Save className="ml-2 h-5 w-5" />
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
