'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import { CheckSquare, Plus, Circle, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import type { Task, Project, TaskStatus, TaskPriority } from '@/lib/types';
import { getTasks, createTask, updateTask, deleteTask, getProjects } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
];

export function TasksList() {
  const [tasks, setTasks] = useState<(Task & { project: Project | null })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newProject, setNewProject] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([getTasks(), getProjects()]);
      setTasks(t);
      setProjects(p);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const task = await createTask({
        title: newTitle.trim(),
        description: newDesc,
        priority: newPriority,
        project_id: newProject !== 'none' ? newProject : undefined,
      });
      setTasks((prev) => [{ ...task, project: projects.find((p) => p.id === task.project_id) ?? null }, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setNewProject('none');
      setDialogOpen(false);
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    try {
      const updated = await updateTask(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch {
      toast.error('Failed to update task');
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Tasks"
        description="Your centralized task system. Track everything that needs to get done."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title</Label>
                    <Input id="task-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to be done?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-desc">Description (optional)</Label>
                    <Textarea id="task-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} placeholder="Add details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TaskPriority)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select value={newProject} onValueChange={setNewProject}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No project</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newTitle.trim()}>Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-thin">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              filter === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="mt-4">
        {loading ? <LoadingState /> :
         filtered.length === 0 ? (
           <EmptyState
             icon={CheckSquare}
             title={filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
             description="Create a task to track what needs to get done. You can associate it with a project and set a priority."
             actionLabel="New task"
             onAction={() => setDialogOpen(true)}
           />
         ) : (
           <div className="space-y-2 animate-fade-in">
             {filtered.map((task) => (
               <TaskRow
                 key={task.id}
                 task={task}
                 onStatusChange={handleStatusChange}
                 onDelete={handleDelete}
               />
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

function TaskRow({
  task, onStatusChange, onDelete,
}: {
  task: Task & { project: Project | null };
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      className="orbit-card-hover"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <button
          onClick={() => onStatusChange(task, task.status === 'completed' ? 'todo' : 'completed')}
          className="mt-0.5 shrink-0"
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : task.status === 'in_progress' ? (
            <Clock className="h-5 w-5 text-primary" />
          ) : task.status === 'waiting' ? (
            <AlertCircle className="h-5 w-5 text-warning" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', task.status === 'completed' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.project && (
              <Badge variant="outline" className="text-xs">{task.project.name}</Badge>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex shrink-0 gap-1 animate-fade-in">
            {task.status !== 'completed' && (
              <Select value={task.status} onValueChange={(v) => onStatusChange(task, v as TaskStatus)}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task)}>
              <Plus className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    urgent: { label: 'Urgent', className: 'bg-destructive/15 text-destructive' },
    high: { label: 'High', className: 'bg-warning/15 text-warning' },
    medium: { label: 'Medium', className: 'bg-primary/15 text-primary' },
    low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  };
  const p = map[priority] ?? map.medium;
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.className)}>{p.label}</span>;
}
