'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/empty-state';
import {
  ArrowUp, Sparkles, Bot, FolderKanban, CheckSquare, Lightbulb,
  ShieldCheck, Clock, TrendingUp, Zap, ChevronRight, Loader2,
} from 'lucide-react';
import type { AgentRun, Task, Project, Approval, Notification } from '@/lib/types';
import {
  getAgentRuns, getTasks, getProjects, getApprovals, getNotifications,
  createAgentRun, updateAgentRun, createNotification,
} from '@/lib/db/services';
import { generatePlan, getAgentStatusFlow } from '@/lib/agent/orchestrator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const QUICK_COMMANDS = [
  'What should I work on today?',
  'Review my pending tasks',
  'Plan my week',
  'Research a topic',
];

export function OrbitHome() {
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [runs, tasks, projs, approvals, notifs] = await Promise.all([
        getAgentRuns(5),
        getTasks({ status: 'todo' }),
        getProjects('active'),
        getApprovals('pending'),
        getNotifications(false),
      ]);
      setRecentRuns(runs);
      setPriorityTasks(tasks.slice(0, 5));
      setProjects(projs.slice(0, 4));
      setPendingApprovals(approvals.slice(0, 3));
      setRecentNotifications(notifs.slice(0, 5));
    } catch {
      // silently fail — data will show empty states
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim() || submitting) return;
    setSubmitting(true);
    try {
      const run = await createAgentRun(command.trim());
      const plan = generatePlan(command.trim());

      // Simulate the agent execution pipeline with status updates
      const flow = getAgentStatusFlow();
      await updateAgentRun(run.id, { status: 'understanding', plan: plan.summary });
      setCommand('');

      // Create notification
      await createNotification({
        type: 'agent_completed',
        title: 'Agent run started',
        message: command.trim(),
        link: `/agent/${run.id}`,
      });

      toast.success('ORBIT is processing your request');
      router.push(`/agent/${run.id}`);
    } catch {
      toast.error('Failed to start agent run');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Command Center */}
      <div className="mb-8 animate-fade-in">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">What do you want ORBIT to do?</h1>
            <p className="text-sm text-muted-foreground">Type a command in natural language.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. Research whether this feature makes sense for DELT..."
              className="h-14 w-full rounded-xl border border-border bg-card pl-5 pr-14 text-base shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!command.trim() || submitting}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => setCommand(cmd)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent agent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Agent Activity</CardTitle>
            <Link href="/agent" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : recentRuns.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No agent runs yet"
                description="Submit a command above and ORBIT will start working on it."
              />
            ) : (
              <div className="space-y-2">
                {recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/agent/${run.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    <AgentStatusIcon status={run.status} />
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium">{run.request}</p>
                      <p className="text-xs text-muted-foreground">
                        {AgentStatusLabel(run.status)} · {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="h-4 w-4 text-warning" />
              Approvals
            </CardTitle>
            {pendingApprovals.length > 0 && (
              <Link href="/approvals" className="text-xs text-primary hover:underline">
                View all
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            ) : pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.map((a) => (
                  <Link
                    key={a.id}
                    href="/approvals"
                    className="block rounded-lg border border-warning/20 bg-warning/5 p-3 transition-all hover:bg-warning/10"
                  >
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Priority Tasks
            </CardTitle>
            <Link href="/tasks" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : priorityTasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No pending tasks"
                description="Create a task to get organized, or ask ORBIT to create one for you."
                actionLabel="Add a task"
                onAction={() => router.push('/tasks')}
              />
            ) : (
              <div className="space-y-1.5">
                {priorityTasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-muted/50"
                  >
                    <div className={cn(
                      'flex h-2 w-2 shrink-0 rounded-full',
                      task.priority === 'urgent' && 'bg-destructive',
                      task.priority === 'high' && 'bg-warning',
                      task.priority === 'medium' && 'bg-primary',
                      task.priority === 'low' && 'bg-muted-foreground',
                    )} />
                    <p className="flex-1 truncate text-sm">{task.title}</p>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderKanban className="h-4 w-4 text-primary" />
              Projects
            </CardTitle>
            <Link href="/projects" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create your first project to start organizing your work."
                actionLabel="New project"
                onAction={() => router.push('/projects')}
              />
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-muted/50"
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold', projectColorBg(p.color))}>
                      {p.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent notifications */}
      {recentNotifications.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <Link href="/notifications" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {recentNotifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg p-2.5">
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    n.type === 'approval_required' ? 'bg-warning/10 text-warning' :
                    n.type === 'agent_completed' ? 'bg-success/10 text-success' :
                    'bg-primary/10 text-primary'
                  )}>
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AgentStatusIcon({ status }: { status: string }) {
  const iconClass = 'h-4 w-4';
  if (status === 'completed') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><CheckSquare className={iconClass} /></div>;
  if (status === 'failed') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><Bot className={iconClass} /></div>;
  if (status === 'awaiting_approval') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><ShieldCheck className={iconClass} /></div>;
  if (status === 'cancelled') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Bot className={iconClass} /></div>;
  return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Loader2 className={cn(iconClass, 'animate-spin')} /></div>;
}

function AgentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    understanding: 'Understanding',
    planning: 'Planning',
    researching: 'Researching',
    awaiting_approval: 'Waiting for approval',
    executing: 'Executing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

function projectColorBg(color: string): string {
  const map: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  yellow: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  pink: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  gray: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  lime: 'bg-lime-500/15 text-lime-600 dark:text-lime-400',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  default: 'bg-primary/15 text-primary',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  neutral: 'bg-muted text-muted-foreground',
  muted: 'bg-muted text-muted-foreground',
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/15 text-success',
    destructive: 'bg-destructive/15 text-destructive',
    info: 'bg-info/15 text-info',
  error: 'bg-destructive/15 text-destructive',
  chart: 'bg-chart-1/15 text-chart-1',
    ring: 'bg-ring/15 text-ring',
  border: 'bg-muted text-muted-foreground',
    card: 'bg-muted text-muted-foreground',
    popover: 'bg-muted text-muted-foreground',
    background: 'bg-muted text-muted-foreground',
    foreground: 'bg-muted text-muted-foreground',
    input: 'bg-muted text-muted-foreground',
  };
  return map[color] ?? map.default;
}
