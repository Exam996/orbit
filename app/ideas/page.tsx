'use client';

import { AppShell } from '@/components/layout/app-shell';
import { IdeasList } from '@/components/pages/ideas-list';

export default function IdeasPage() {
  return (
    <AppShell>
      <IdeasList />
    </AppShell>
  );
}
