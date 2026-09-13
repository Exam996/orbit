'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Search, Plus, ExternalLink, FileText, Clock, CheckCircle2,
  AlertCircle, Loader2, Wrench,
} from 'lucide-react';
import type { Research, Project } from '@/lib/types';
import { getResearch, createResearch, getProjects } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ResearchWorkspace() {
  const [research, setResearch] = useState<(Research & { project: Project | null })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([getResearch(), getProjects()]);
      setResearch(r);
      setProjects(p);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setSubmitting(true);
    try {
      const item = await createResearch({
        topic: topic.trim(),
        query,
        project_id: selectedProject !== 'none' ? selectedProject : undefined,
      });
      setResearch((prev) => [{ ...item, project: projects.find((p) => p.id === item.project_id) ?? null }, ...prev]);
      setTopic('');
      setQuery('');
      setSelectedProject('none');
      setDialogOpen(false);
      toast.success('Research request created');
    } catch {
      toast.error('Failed to create research request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Research"
        description="A workspace for ORBIT to research topics, collect sources, and summarize findings."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Research
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a research request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Research topic..." required />
                  </div>
                  <div className="space-y-2">
                    <Textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3} placeholder="Specific questions or scope for this research..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Associate with project (optional)</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="none">No project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !topic.trim()}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Info banner */}
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wrench className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">Research tools are ready to connect</p>
          <p className="text-xs text-muted-foreground">
            The research architecture is in place. Web research tools will be connected in a future update to enable autonomous research with real sources.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? <LoadingState /> :
         research.length === 0 ? (
           <EmptyState
             icon={Search}
             title="No research yet"
             description="Create a research request and ORBIT will research the topic, collect sources, and summarize findings. You can associate research with any of your projects."
             actionLabel="Start research"
             onAction={() => setDialogOpen(true)}
           />
         ) : (
           <div className="space-y-3 animate-fade-in">
             {research.map((item) => (
               <Card key={item.id} className="orbit-card-hover">
                 <CardContent className="p-4">
                   <div className="flex items-start gap-3">
                     <ResearchStatusIcon status={item.status} />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium">{item.topic}</p>
                       {item.query && <p className="mt-0.5 text-xs text-muted-foreground">{item.query}</p>}
                       {item.findings && (
                         <div className="mt-3 rounded-lg bg-muted/50 p-3">
                           <p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.findings}</p>
                         </div>
                       )}
                       {item.sources && item.sources.length > 0 && (
                         <div className="mt-2 space-y-1">
                           {item.sources.map((src, i) => (
                             <a
                               key={i}
                               href={src.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                             >
                               <ExternalLink className="h-3 w-3" />
                               {src.title}
                             </a>
                           ))}
                         </div>
                       )}
                       <div className="mt-2 flex items-center gap-2">
                         <Badge variant="outline" className="text-xs capitalize">{item.status.replace('_', ' ')}</Badge>
                         {item.project && <Badge variant="outline" className="text-xs">{item.project.name}</Badge>}
                         <span className="text-xs text-muted-foreground">
                           {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </span>
                       </div>
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

function ResearchStatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle2 className="h-4 w-4" /></div>;
  if (status === 'failed') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertCircle className="h-4 w-4" /></div>;
  if (status === 'in_progress') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Clock className="h-4 w-4" /></div>;
}
