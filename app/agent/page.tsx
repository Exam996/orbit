'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AgentList } from '@/components/pages/agent-list';

export default function AgentPage() {
  return (
    <AppShell>
      <AgentList />
    </AppShell>
  );
}
