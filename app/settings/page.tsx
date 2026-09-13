'use client';

import { AppShell } from '@/components/layout/app-shell';
import { SettingsView } from '@/components/pages/settings-view';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  );
}
