'use client';

import { AppShell } from '@/components/layout/app-shell';
import { NotificationsCenter } from '@/components/pages/notifications-center';

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsCenter />
    </AppShell>
  );
}
