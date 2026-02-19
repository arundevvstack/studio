
"use client";

import { Users, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { TeamMember } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const db = useFirestore();

  const teamQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'teamMembers'), 
      where('status', '==', 'Authorized'),
      orderBy('name', 'asc')
    );
  }, [db]);

  const { data: members, isLoading } = useCollection<TeamMember>(teamQuery);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Team</h1>
          <p className="text-slate-500 text-lg font-medium opacity-80">Marzelz Lifestyle strategic production talent network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-[5px] animate-pulse bg-white/50" />
          ))
        ) : (
          members?.map((member) => (
            <Card key={member.id} className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="p-8 text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-primary/20 rounded-[5px] blur-2xl group-hover:scale-150 transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative w-24 h-24 rounded-[5px] overflow-hidden border-4 border-white shadow-lg z-10">
                    <img src={member.photoURL || `https://picsum.photos/seed/${member.id}/200/200`} alt={member.name} className="object-cover w-full h-full" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">{member.name}</h3>
                  <Badge className="rounded-[5px] bg-primary/5 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3">
                    {member.role}
                  </Badge>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-4">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[5px] text-slate-400 hover:text-primary hover:bg-primary/5">
                    <Mail size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[5px] text-slate-400 hover:text-primary hover:bg-primary/5">
                    <ExternalLink size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
