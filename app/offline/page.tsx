'use client';

import { Orbit } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Orbit className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">You're offline</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ORBIT can't reach the server right now. Your data will sync when you're back online.
      </p>
    </div>
  );
}
