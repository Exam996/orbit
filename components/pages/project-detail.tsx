'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import {
  ArrowLeft, FolderKanban, CheckSquare, Lightbulb, Search,
  Plus, Target, Calendar, Edit3, Save, Trash2,
} from 'lucide-react';
import type { Project, Task, Idea, Research } from '@/lib/types';
import {
  getProject, updateProject, deleteProject,
  getTasks, getResearch,
} from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editGoals, setEditGoals] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, t, r] = await Promise.all([
        getProject(projectId),
        getTasks({ projectId }),
        getResearch(projectId),
      ]);
      setProject(p);
      setTasks(t);
      setResearch(r);
      setEditDesc(p?.description ?? '');
      setEditGoals(p?.goals ?? '');
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!project) return;
    try {
      await updateProject(project.id, { description: editDesc, goals: editGoals });
      setProject({ ...project, description: editDesc, goals: editGoals });
      setEditing(false);
      toast.success('Project updated');
    } catch {
      toast.error('Failed to update project');
    }
  }

  async function handleDelete() {
    if (!project) return;
    try {
      await deleteProject(project.id);
      toast.success('Project deleted');
      router.push('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8"><LoadingState /></div>;
  if (!project) return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
      <EmptyState icon={FolderKanban} title="Project not found" description="This project may have been deleted." />
    </div>
  );

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Project header */}
      <div className="flex items-start gap-4">
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold', colorClass(project.color))}>
          {project.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="capitalize">{project.status}</Badge>
          </div>
          {project.description && !editing && (
            <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button variant="outline" size="icon" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit mode */}
      {editing && (
        <div className="mt-4 space-y-3 animate-slide-up">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="mt-1" placeholder="Project description..." />
          </div>
          <div>
            <label className="text-sm font-medium">Goals</label>
            <Textarea value={editGoals} onChange={(e) => setEditGoals(e.target.value)} rows={3} className="mt-1" placeholder="What are the goals of this project?" />
          </div>
        </div>
      )}

      {/* Goals */}
      {project.goals && !editing && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{project.goals}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="mt-6">
        <TabsList>
          <TabsTrigger value="tasks">
            <CheckSquare className="mr-2 h-4 w-4" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="research">
            <Search className="mr-2 h-4 w-4" />
            Research ({research.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this project"
              description="Create tasks from the Tasks page and associate them with this project."
              actionLabel="Go to Tasks"
              onAction={() => router.push('/tasks')}
            />
          ) : (
            <div className="space-y-2">
              {activeTasks.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
                  {activeTasks.map((task) => (
                    <Link key={task.id} href="/tasks" className="block rounded-lg border border-border p-3 transition-all hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-2 w-2 rounded-full', priorityColor(task.priority))} />
                        <p className="flex-1 text-sm">{task.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{task.status.replace('_', ' ')}</Badge>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {completedTasks.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                  {completedTasks.map((task) => (
                    <Link key={task.id} href="/tasks" className="block rounded-lg border border-border p-3 opacity-60 transition-all hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-success" />
                        <p className="flex-1 text-sm line-through">{task.title}</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="research" className="mt-4">
          {research.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No research yet"
              description="Research associated with this project will appear here. Start a research request from the Home command center."
              actionLabel="Go to Research"
              onAction={() => router.push('/research')}
            />
          ) : (
            <div className="space-y-2">
              {research.map((r) => (
                <Link key={r.id} href="/research" className="block rounded-lg border border-border p-3 transition-all hover:bg-muted/50">
                  <p className="text-sm font-medium">{r.topic}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{r.status}</p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'bg-destructive',
    high: 'bg-warning',
    medium: 'bg-primary',
    low: 'bg-muted-foreground',
  };
  return map[priority] ?? map.medium;
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
