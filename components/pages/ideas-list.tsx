'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import { Lightbulb, Plus, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import type { Idea, IdeaStatus } from '@/lib/types';
import { getIdeas, createIdea, updateIdea, deleteIdea } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<IdeaStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  converted: 'Converted',
  archived: 'Archived',
};

export function IdeasList() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getIdeas();
      setIdeas(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const idea = await createIdea({ title: newTitle.trim(), description: newDesc });
      setIdeas((prev) => [idea, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setDialogOpen(false);
      toast.success('Idea captured');
    } catch {
      toast.error('Failed to capture idea');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(idea: Idea, status: IdeaStatus) {
    try {
      const updated = await updateIdea(idea.id, { status });
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? updated : i)));
    } catch {
      toast.error('Failed to update idea');
    }
  }

  async function handleDelete(idea: Idea) {
    try {
      await deleteIdea(idea.id);
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
      toast.success('Idea deleted');
    } catch {
      toast.error('Failed to delete idea');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Ideas"
        description="A fast inbox for capturing ideas. Decide what they become later."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Capture Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Capture an idea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's the idea?" required autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} placeholder="Add more detail (optional)..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newTitle.trim()}>Capture</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        {loading ? <LoadingState /> :
         ideas.length === 0 ? (
           <EmptyState
             icon={Lightbulb}
             title="No ideas captured yet"
             description="Quickly capture any idea without deciding what it becomes. You can convert ideas into tasks, projects, or research later."
             actionLabel="Capture your first idea"
             onAction={() => setDialogOpen(true)}
           />
         ) : (
           <div className="space-y-2 animate-fade-in">
             {ideas.map((idea) => (
               <Card key={idea.id} className="orbit-card-hover group">
                 <CardContent className="p-4">
                   <div className="flex items-start gap-3">
                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                       <Lightbulb className="h-4 w-4" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium">{idea.title}</p>
                       {idea.description && <p className="mt-0.5 text-xs text-muted-foreground">{idea.description}</p>}
                       <div className="mt-2 flex items-center gap-2">
                         <Badge variant="outline" className="text-xs">{STATUS_LABELS[idea.status]}</Badge>
                         <span className="text-xs text-muted-foreground">
                           {new Date(idea.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </span>
                       </div>
                     </div>
                     <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                       {idea.status === 'new' && (
                         <Button variant="ghost" size="sm" onClick={() => handleStatusChange(idea, 'reviewed')}>
                           <Sparkles className="mr-1 h-3 w-3" />
                           Review
                         </Button>
                       )}
                       {(idea.status === 'new' || idea.status === 'reviewed') && (
                         <Button variant="ghost" size="sm" onClick={() => handleStatusChange(idea, 'converted')}>
                           <ArrowRight className="mr-1 h-3 w-3" />
                           Convert
                         </Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(idea)}>
                         <Trash2 className="h-3.5 w-3.5" />
                       </Button>
                     </div>
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
