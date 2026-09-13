'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ProjectsList } from '@/components/pages/projects-list';

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectsList />
    </AppShell>
  );
}
