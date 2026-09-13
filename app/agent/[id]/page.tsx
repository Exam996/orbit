'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AgentDetail } from '@/components/pages/agent-detail';

export default function AgentRunPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <AgentDetail runId={params.id} />
    </AppShell>
  );
}
