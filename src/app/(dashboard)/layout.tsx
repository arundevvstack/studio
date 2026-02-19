
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (!loading && user && !isAuthorized) {
      router.push('/');
    }
  }, [user, loading, router, isAuthorized]);

  if (loading || !user || !isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-10 h-10 rounded-lg border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden selection:bg-primary/20">
      <div className="ambient-blob blob-primary"></div>
      <div className="ambient-blob blob-indigo"></div>
      
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10 ml-72 mr-4">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 pt-2 scroll-smooth scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
