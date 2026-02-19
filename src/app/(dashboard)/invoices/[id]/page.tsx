"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Printer, 
  Mail, 
  ShieldCheck,
  Building2,
  Phone,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const logo = PlaceHolderImages.find(img => img.id === 'marzelz-logo');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const invoiceRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'invoices', id);
  }, [db, id]);

  const { data: invoice, isLoading, error } = useDoc<Invoice>(invoiceRef);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Financial Records...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500">
          <ShieldCheck size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Record Not Found</h2>
          <p className="text-slate-500 font-medium">This invoice identifier does not exist or has been archived.</p>
        </div>
        <Button onClick={() => router.push('/invoices')} variant="outline" className="rounded-2xl px-8 h-12 font-bold">
          Return to Billing
        </Button>
      </div>
    );
  }

  const subtotal = invoice.totalAmount;
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Invoice Details</h1>
            <p className="text-slate-500 font-medium text-sm">Reviewing financial record INV-{invoice.id.slice(0,8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 gap-2 bg-white" onClick={handlePrint}>
            <Printer size={18} />
            Print / PDF
          </Button>
          <Button className="rounded-2xl h-12 px-8 font-black bg-primary shadow-xl shadow-primary/20 gap-2">
            <Mail size={18} />
            Send to Client
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-none md:rounded-[2.5rem] overflow-hidden bg-white invoice-document-print">
        <CardContent className="p-8 md:p-16 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              {logo && (
                <div className="relative h-24 w-64">
                  <Image 
                    src={logo.imageUrl} 
                    alt={logo.description} 
                    fill 
                    className="object-contain object-left"
                    data-ai-hint={logo.imageHint}
                  />
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Marzelz Lifestyle PVT LTD</h1>
              <p className="text-[10px] font-bold text-slate-500">CIN: U60200KL2023PTC081308</p>
              <p className="text-[10px] font-bold text-slate-500">GSTIN: 32AAQCM8450P1ZQ</p>
              <div className="pt-6">
                <h3 className="text-5xl font-black text-slate-800 tracking-tighter opacity-10">Invoice</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-3">
               <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Project:</span>
                  <span className="text-sm font-black text-slate-900">MRZL_PROJ_{invoice.id.slice(0,6).toUpperCase()}</span>
               </div>
               <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Invoice No:</span>
                  <span className="text-sm font-black text-slate-900">MRZL_{new Date().getFullYear()}_{invoice.id.slice(0,4).toUpperCase()}</span>
               </div>
               <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Invoice Date:</span>
                  <span className="text-sm font-black text-slate-900">{isMounted && invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '---'}</span>
               </div>
               <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Payable To:</span>
                  <span className="text-sm font-black text-slate-900">Marzelz Lifestyle PVT LTD</span>
               </div>
               <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Due Date:</span>
                  <span className="text-sm font-black text-slate-900">{isMounted ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : '---'}</span>
               </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">BILL TO</p>
               <h4 className="text-base font-black text-slate-900 leading-tight">{invoice.clientName}</h4>
               <p className="text-sm font-medium text-slate-500 mt-2 max-w-[250px] leading-relaxed">
                 Strategic Production Partner<br />
                 Corporate Headquarters<br />
                 Business Park, Level 4
               </p>
               <p className="text-xs font-bold text-slate-900 mt-4 uppercase tracking-wider">GSTIN: 32AAFCP2774A1ZU</p>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-3xl">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-primary text-white">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">SL No</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Unit Price</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Quantity</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Line Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {invoice.items.map((item, index) => (
                     <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 text-[12px] font-arial font-bold text-slate-400">{index + 1}</td>
                        <td className="px-6 py-3">
                           <p className="text-[12px] font-arial font-black text-slate-900">{item.description}</p>
                           {item.isRecurringGroup && <Badge variant="secondary" className="mt-1 text-[8px] font-black bg-primary/5 text-primary">RECURRING GROUP</Badge>}
                        </td>
                        <td className="px-6 py-3 text-[12px] font-arial font-bold text-slate-900 text-right">₹{item.amount.toLocaleString()}</td>
                        <td className="px-6 py-3 text-[12px] font-arial font-bold text-slate-900 text-center">1</td>
                        <td className="px-6 py-3 text-[12px] font-arial font-black text-slate-900 text-right">₹{item.amount.toLocaleString()}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-8 relative">
             <div className="flex-1 space-y-8">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Details</h5>
                   <div className="space-y-1.5">
                      <p className="text-sm font-black text-slate-900">Marzelz Lifestyle Private Limited.</p>
                      <p className="text-xs font-bold text-slate-600">Axis Bank - Sasthamangalam</p>
                      <div className="grid grid-cols-[100px_1fr] text-[11px] font-bold mt-2">
                        <span className="text-slate-400">Acc no:</span>
                        <span className="text-slate-900">: 922020014850667</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] text-[11px] font-bold">
                        <span className="text-slate-400">IFSC:</span>
                        <span className="text-slate-900">: UTIB0003042</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] text-[11px] font-bold">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-slate-900">: 9947109143</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] text-[11px] font-bold">
                        <span className="text-slate-400">PAN:</span>
                        <span className="text-slate-900">: AAQCM8450P</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr] text-[11px] font-bold">
                        <span className="text-slate-400">GST:</span>
                        <span className="text-slate-900">: 32AAQCM8450P1ZQ</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full md:w-[400px] space-y-6 relative">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                      <span className="text-sm font-black text-slate-900">₹{subtotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">GST @ 18%</span>
                      <span className="text-sm font-black text-slate-900">₹{gstAmount.toLocaleString()}</span>
                   </div>
                   <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Grand Total</span>
                      <span className="text-xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</span>
                   </div>
                </div>

                <div className="absolute -left-12 bottom-0 w-48 h-48 opacity-80 pointer-events-none select-none print:opacity-100">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full text-[#1A365D] -rotate-12">
                      <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5,2" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      
                      <path d="M70 120 C 70 80, 100 80, 100 100 C 100 80, 130 80, 130 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      <defs>
                        <path id="stampTextPath" d="M 100, 100 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0" />
                      </defs>
                      <text className="text-[11px] font-black uppercase tracking-widest fill-current">
                        <textPath href="#stampTextPath" startOffset="0%">MARZELZ LIFESTYLE PVT. LTD. ★ TRIVANDRUM ★ 695003 ★</textPath>
                      </text>
                      
                      <text x="100" y="145" textAnchor="middle" className="text-[9px] font-black fill-current uppercase tracking-wider">Authorised Signatory</text>
                      
                      <path d="M40 110 Q 70 80, 100 105 T 160 90" fill="none" stroke="#2563EB" strokeWidth="2" className="opacity-70" />
                    </svg>
                  </div>
                </div>
             </div>
          </div>

          <div className="pt-24 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-8 text-slate-400">
             <div className="space-y-4 max-w-sm">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">MARZELZ LIFESTYLE PRIVATE LIMITED</h5>
                <p className="text-[10px] font-bold leading-relaxed">
                  Dotspace Business Center TC 24/3088 Ushasandya Building, Kowdiar - Devasom Board Road, Kowdiar, Trivandrum, Pin : 695003
                </p>
             </div>
             <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">CONTACT US</h5>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold">
                      <Mail size={12} className="text-slate-300" /> info@marzelz.com
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold">
                      <Phone size={12} className="text-slate-300" /> +91 871 400 5550
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold">
                      <Globe size={12} className="text-slate-300" /> www.marzelz.com
                   </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}