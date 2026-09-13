'use client';

import { AppShell } from '@/components/layout/app-shell';
import { TasksList } from '@/components/pages/tasks-list';

export default function TasksPage() {
  return (
    <AppShell>
      <TasksList />
    </AppShell>
  );
}
