'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { FolderKanban, Plus, ChevronRight } from 'lucide-react';
import type { Project } from '@/lib/types';
import { getProjects, createProject } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PROJECT_COLORS = ['blue', 'green', 'orange', 'cyan', 'teal', 'amber', 'rose', 'violet'];

export function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const project = await createProject({ name: name.trim(), description, color });
      setProjects((prev) => [project, ...prev]);
      setName('');
      setDescription('');
      setColor('blue');
      setDialogOpen(false);
      toast.success('Project created');
      router.push(`/projects/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Projects"
        description="Larger goals you're working toward — DELT, ORBIT, college projects, and more."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project name</Label>
                    <Input
                      id="project-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. DELT, ORBIT, Thesis..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-desc">Description (optional)</Label>
                    <Textarea
                      id="project-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this project about?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={cn(
                            'h-8 w-8 rounded-lg border-2 transition-all',
                            colorClass(c),
                            color === c ? 'border-foreground scale-110' : 'border-transparent',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !name.trim()}>
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        {loading ? <LoadingState /> :
         projects.length === 0 ? (
           <EmptyState
             icon={FolderKanban}
             title="No projects yet"
             description="Create your first project to organize tasks, research, and ideas around a larger goal."
             actionLabel="Create project"
             onAction={() => setDialogOpen(true)}
           />
         ) : (
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
             {projects.map((project) => (
               <Card
                 key={project.id}
                 className="cursor-pointer orbit-card-hover"
                 onClick={() => router.push(`/projects/${project.id}`)}
               >
                 <CardContent className="p-5">
                   <div className="flex items-start justify-between">
                     <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold', colorClass(project.color))}>
                       {project.name[0]?.toUpperCase()}
                     </div>
                     <StatusPill status={project.status} />
                   </div>
                   <h3 className="mt-3 font-semibold">{project.name}</h3>
                   <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                     {project.description || 'No description yet.'}
                   </p>
                   <div className="mt-4 flex items-center text-xs text-muted-foreground">
                     {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     <ChevronRight className="ml-auto h-4 w-4" />
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    paused: 'bg-warning/15 text-warning',
    completed: 'bg-primary/15 text-primary',
    archived: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', map[status] ?? map.active)}>
      {status}
    </span>
  );
}

function colorClass(color: string): string {
  const map: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  };
  return map[color] ?? map.blue;
}
