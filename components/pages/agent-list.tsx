'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error';
import { Badge } from '@/components/ui/badge';
import { Bot, ChevronRight, Clock, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import type { AgentRun } from '@/lib/types';
import { getAgentRuns } from '@/lib/db/services';
import { cn } from '@/lib/utils';

export function AgentList() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAgentRuns(50);
      setRuns(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Agent"
        description="Current and previous AI runs. Each run shows the full execution timeline."
      />

      <div className="mt-6">
        {loading ? <LoadingState /> :
         error ? <ErrorState onRetry={load} /> :
         runs.length === 0 ? (
           <EmptyState
             icon={Bot}
             title="No agent runs yet"
             description="Go to the Home screen and type a command to start your first agent run. ORBIT will understand, plan, and execute it step by step."
           />
         ) : (
           <div className="space-y-2 animate-fade-in">
             {runs.map((run) => (
               <Link key={run.id} href={`/agent/${run.id}`}>
                 <Card className="cursor-pointer orbit-card-hover">
                   <CardContent className="flex items-center gap-4 p-4">
                     <StatusIcon status={run.status} />
                     <div className="flex-1 min-w-0">
                       <p className="truncate text-sm font-medium">{run.request}</p>
                       <div className="mt-1 flex items-center gap-2">
                         <StatusBadge status={run.status} />
                         <span className="text-xs text-muted-foreground">
                           {new Date(run.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                     </div>
                     <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                   </CardContent>
                 </Card>
               </Link>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle2 className="h-4 w-4" /></div>;
  if (status === 'failed') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertCircle className="h-4 w-4" /></div>;
  if (status === 'awaiting_approval') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning"><ShieldCheck className="h-4 w-4" /></div>;
  if (status === 'cancelled') return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Bot className="h-4 w-4" /></div>;
  return <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Loader2 className="h-4 w-4 animate-spin" /></div>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
    understanding: { label: 'Understanding', className: 'bg-primary/10 text-primary' },
    planning: { label: 'Planning', className: 'bg-primary/10 text-primary' },
    researching: { label: 'Researching', className: 'bg-primary/10 text-primary' },
    awaiting_approval: { label: 'Needs Approval', className: 'bg-warning/15 text-warning' },
    executing: { label: 'Executing', className: 'bg-primary/10 text-primary' },
    completed: { label: 'Completed', className: 'bg-success/15 text-success' },
    failed: { label: 'Failed', className: 'bg-destructive/15 text-destructive' },
    cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  };
  const s = map[status] ?? map.pending;
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.className)}>{s.label}</span>;
}
