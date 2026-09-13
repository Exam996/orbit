'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import {
  ShieldCheck, Check, X, AlertTriangle, Wrench, Clock,
} from 'lucide-react';
import type { Approval, AgentRun } from '@/lib/types';
import { getApprovals, updateApproval, createNotification } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ApprovalsInbox() {
  const [approvals, setApprovals] = useState<(Approval & { agent_run: AgentRun | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = useCallback(async () => {
    try {
      const data = await getApprovals(filter === 'pending' ? 'pending' : undefined);
      setApprovals(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(approval: Approval) {
    try {
      await updateApproval(approval.id, 'approved');
      await createNotification({
        type: 'general',
        title: 'Approval granted',
        message: `Approved: ${approval.title}`,
        link: '/approvals',
      });
      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast.success('Approved');
    } catch {
      toast.error('Failed to approve');
    }
  }

  async function handleReject(approval: Approval) {
    try {
      await updateApproval(approval.id, 'rejected');
      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast.success('Rejected');
    } catch {
      toast.error('Failed to reject');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Approvals"
        description="Whenever ORBIT wants to perform an action requiring permission, it appears here for your review."
      />

      <div className="mt-4 flex gap-1">
        <button
          onClick={() => setFilter('pending')}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-all', filter === 'pending' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-all', filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
        >
          All History
        </button>
      </div>

      <div className="mt-4">
        {loading ? <LoadingState /> :
         approvals.length === 0 ? (
           <EmptyState
             icon={ShieldCheck}
             title={filter === 'pending' ? 'No pending approvals' : 'No approval history'}
             description="When ORBIT wants to perform an action that requires your permission — like modifying a project or creating a GitHub issue — it will show up here with a clear explanation of what it wants to do and why."
           />
         ) : (
           <div className="space-y-3 animate-fade-in">
             {approvals.map((approval) => (
               <Card key={approval.id} className={cn(
                 'border-l-4',
                 approval.permission_level === 'explicit' ? 'border-l-destructive' : 'border-l-warning',
               )}>
                 <CardContent className="p-4">
                   <div className="flex items-start gap-3">
                     <div className={cn(
                       'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                       approval.permission_level === 'explicit' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning',
                     )}>
                       {approval.permission_level === 'explicit' ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold">{approval.title}</p>
                       <p className="mt-1 text-sm text-muted-foreground">{approval.description}</p>

                       {approval.tool_name && (
                         <div className="mt-2 flex items-center gap-1.5">
                           <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                           <span className="text-xs font-mono text-muted-foreground">{approval.tool_name}</span>
                         </div>
                       )}

                       <div className="mt-2 flex items-center gap-2">
                         <Badge variant="outline" className="text-xs capitalize">
                           {approval.permission_level === 'explicit' ? 'Explicit Confirmation' : 'Needs Approval'}
                         </Badge>
                         <span className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Clock className="h-3 w-3" />
                           {new Date(approval.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {approval.status !== 'pending' && (
                           <Badge className={cn('text-xs', approval.status === 'approved' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                             {approval.status}
                           </Badge>
                         )}
                       </div>

                       {approval.status === 'pending' && (
                         <div className="mt-3 flex gap-2">
                           <Button size="sm" onClick={() => handleApprove(approval)}>
                             <Check className="mr-1.5 h-3.5 w-3.5" />
                             Approve
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleReject(approval)}>
                             <X className="mr-1.5 h-3.5 w-3.5" />
                             Reject
                           </Button>
                         </div>
                       )}
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
