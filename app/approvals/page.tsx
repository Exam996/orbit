'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ApprovalsInbox } from '@/components/pages/approvals-inbox';

export default function ApprovalsPage() {
  return (
    <AppShell>
      <ApprovalsInbox />
    </AppShell>
  );
}
