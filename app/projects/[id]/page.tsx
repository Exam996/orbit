'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ProjectDetail } from '@/components/pages/project-detail';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <ProjectDetail projectId={params.id} />
    </AppShell>
  );
}
