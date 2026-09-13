'use client';

import { AppShell } from '@/components/layout/app-shell';
import { MemoryView } from '@/components/pages/memory-view';

export default function MemoryPage() {
  return (
    <AppShell>
      <MemoryView />
    </AppShell>
  );
}
