'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ResearchWorkspace } from '@/components/pages/research-workspace';

export default function ResearchPage() {
  return (
    <AppShell>
      <ResearchWorkspace />
    </AppShell>
  );
}
