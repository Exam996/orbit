'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import {
  ArrowLeft, Bot, Brain, Search, CheckCircle2, AlertCircle,
  ShieldCheck, Loader2, Clock, Wrench, ChevronRight, FileText,
} from 'lucide-react';
import type { AgentRun, AgentStep, AgentAction } from '@/lib/types';
import {
  getAgentRun, getAgentSteps, getAgentActions, updateAgentRun,
} from '@/lib/db/services';
import { getAgentStatusFlow } from '@/lib/agent/orchestrator';
import { cn } from '@/lib/utils';

export function AgentDetail({ runId }: { runId: string }) {
  const router = useRouter();
  const [run, setRun] = useState<AgentRun | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [r, s, a] = await Promise.all([
        getAgentRun(runId),
        getAgentSteps(runId),
        getAgentActions(runId),
      ]);
      setRun(r);
      setSteps(s);
      setActions(a);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => { load(); }, [load]);

  const flow = getAgentStatusFlow();
  const currentStatusIndex = run ? flow.findIndex((f) => f.status === run.status) : -1;

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8"><LoadingState /></div>;
  if (!run) return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
      <EmptyState icon={Bot} title="Run not found" description="This agent run may have been deleted." />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <Link href="/agent" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Agent
      </Link>

      {/* Request */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium">{run.request}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(run.created_at).toLocaleString()}
              </p>
            </div>
            <StatusBadge status={run.status} />
          </div>
        </CardContent>
      </Card>

      {/* Execution pipeline */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Execution Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {flow.map((stage, i) => {
              const isDone = currentStatusIndex > i || run.status === 'completed';
              const isCurrent = currentStatusIndex === i && run.status !== 'completed';
              const isFailed = run.status === 'failed' && isCurrent;
              const isCancelled = run.status === 'cancelled' && isCurrent;

              return (
                <div key={stage.status} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                      isDone && 'border-success bg-success/10 text-success',
                      isCurrent && !isFailed && !isCancelled && 'border-primary bg-primary/10 text-primary',
                      isFailed && 'border-destructive bg-destructive/10 text-destructive',
                      isCancelled && 'border-muted bg-muted text-muted-foreground',
                      !isDone && !isCurrent && 'border-border bg-background text-muted-foreground',
                    )}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> :
                       isCurrent && !isFailed && !isCancelled ? <Loader2 className="h-4 w-4 animate-spin" /> :
                       isFailed ? <AlertCircle className="h-4 w-4" /> :
                       i + 1}
                    </div>
                    {i < flow.length - 1 && (
                      <div className={cn('mt-1 w-0.5 flex-1', isDone ? 'bg-success/30' : 'bg-border')} style={{ minHeight: '24px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className={cn('text-sm font-medium', !isDone && !isCurrent && 'text-muted-foreground')}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      {run.plan && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Brain className="h-4 w-4 text-primary" />
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{run.plan}</p>
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <StepStatusIcon status={step.status} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.title}</p>
                    {step.tool_name && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <Wrench className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">{step.tool_name}</span>
                      </div>
                    )}
                    {step.started_at && step.completed_at && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {Math.round((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000)}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    action.permission_level === 'safe' && 'bg-success/10 text-success',
                    action.permission_level === 'approval' && 'bg-warning/10 text-warning',
                    action.permission_level === 'explicit' && 'bg-destructive/10 text-destructive',
                  )}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.description}</p>
                    {action.tool_name && <p className="text-xs text-muted-foreground font-mono">{action.tool_name}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{action.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {run.result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{run.result}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty steps state */}
      {steps.length === 0 && run.status === 'pending' && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">ORBIT is preparing the execution plan...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepStatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle2 className="h-4 w-4" /></div>;
  if (status === 'failed') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertCircle className="h-4 w-4" /></div>;
  if (status === 'skipped') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><ChevronRight className="h-4 w-4" /></div>;
  if (status === 'running') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Clock className="h-4 w-4" /></div>;
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
  return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', s.className)}>{s.label}</span>;
}
