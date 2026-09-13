'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import { Brain, Plus, Trash2, Settings, Target, Lightbulb, Bookmark, FileText, MessageSquare } from 'lucide-react';
import type { Memory, MemoryCategory, MemoryImportance } from '@/lib/types';
import { getMemories, createMemory, deleteMemory } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES: { value: MemoryCategory; label: string; icon: typeof Brain }[] = [
  { value: 'preference', label: 'Preferences', icon: Settings },
  { value: 'project', label: 'Projects', icon: Target },
  { value: 'goal', label: 'Goals', icon: Bookmark },
  { value: 'decision', label: 'Decisions', icon: FileText },
  { value: 'context', label: 'Important Context', icon: MessageSquare },
  { value: 'instruction', label: 'Instructions', icon: Lightbulb },
];

const IMPORTANCE_LABELS: Record<MemoryImportance, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};

export function MemoryView() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('context');
  const [newImportance, setNewImportance] = useState<MemoryImportance>('normal');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getMemories();
      setMemories(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeCategory === 'all' ? memories : memories.filter((m) => m.category === activeCategory);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const memory = await createMemory({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        importance: newImportance,
      });
      setMemories((prev) => [memory, ...prev]);
      setNewTitle('');
      setNewContent('');
      setNewCategory('context');
      setNewImportance('normal');
      setDialogOpen(false);
      toast.success('Memory saved');
    } catch {
      toast.error('Failed to save memory');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(memory: Memory) {
    try {
      await deleteMemory(memory.id);
      setMemories((prev) => prev.filter((m) => m.id !== memory.id));
      toast.success('Memory deleted');
    } catch {
      toast.error('Failed to delete memory');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Memory"
        description="What ORBIT remembers about you. Manage your long-term context here."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a memory</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Prefers dark mode" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={3} placeholder="The detail ORBIT should remember..." required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newCategory} onValueChange={(v) => setNewCategory(v as MemoryCategory)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Importance</Label>
                      <Select value={newImportance} onValueChange={(v) => setNewImportance(v as MemoryImportance)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>Save Memory</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Category filter */}
      <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          All ({memories.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = memories.filter((m) => m.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {loading ? <LoadingState /> :
         filtered.length === 0 ? (
           <EmptyState
             icon={Brain}
             title="No memories yet"
             description="Add memories to give ORBIT long-term context about your preferences, goals, and decisions. The more ORBIT remembers, the better it can assist you."
             actionLabel="Add your first memory"
             onAction={() => setDialogOpen(true)}
           />
         ) : (
           <div className="grid gap-3 sm:grid-cols-2 animate-fade-in">
             {filtered.map((memory) => {
               const cat = CATEGORIES.find((c) => c.value === memory.category);
               return (
                 <Card key={memory.id} className="orbit-card-hover group">
                   <CardContent className="p-4">
                     <div className="flex items-start gap-3">
                       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         {cat ? <cat.icon className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                       </div>
                       <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{memory.title}</p>
                          <ImportanceBadge importance={memory.importance} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{memory.content}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{cat?.label ?? memory.category}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100" onClick={() => handleDelete(memory)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
         )}
      </div>
    </div>
  );
}

function ImportanceBadge({ importance }: { importance: string }) {
  const map: Record<string, string> = {
    critical: 'bg-destructive/15 text-destructive',
    high: 'bg-warning/15 text-warning',
    normal: 'bg-primary/15 text-primary',
    low: 'bg-muted text-muted-foreground',
  };
  return <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', map[importance] ?? map.normal)}>{IMPORTANCE_LABELS[importance as MemoryImportance] ?? importance}</span>;
}
