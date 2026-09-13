'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { AppShell } from '@/components/layout/app-shell';
import { OrbitHome } from '@/components/pages/orbit-home';
import { Loader2, Orbit } from 'lucide-react';

export default function Home() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Orbit className="h-7 w-7 animate-spin-slow" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // AppShell handles redirect
  }

  return (
    <AppShell>
      <OrbitHome />
    </AppShell>
  );
}
