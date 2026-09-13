'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading';
import {
  Bell, CheckCheck, Bot, ShieldCheck, Calendar, Search,
  FolderKanban, Zap, Clock,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/types';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/db/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  agent_completed: Bot,
  approval_required: ShieldCheck,
  task_due: Calendar,
  research_completed: Search,
  project_update: FolderKanban,
  general: Zap,
};

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = useCallback(async () => {
    try {
      const data = await getNotifications(filter === 'unread');
      setNotifications(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleMarkRead(notif: Notification) {
    try {
      await markNotificationRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    } catch {
      toast.error('Failed to mark as read');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Notifications"
        description="Stay informed about agent completions, pending approvals, task deadlines, and more."
        action={
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={notifications.every((n) => n.read)}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mt-4 flex gap-1">
        <button
          onClick={() => setFilter('all')}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-all', filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-all', filter === 'unread' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
        >
          Unread
        </button>
      </div>

      <div className="mt-4">
        {loading ? <LoadingState /> :
         notifications.length === 0 ? (
           <EmptyState
             icon={Bell}
             title="No notifications"
             description="You're all caught up. Notifications about agent completions, pending approvals, task deadlines, and research results will appear here."
           />
         ) : (
           <div className="space-y-2 animate-fade-in">
             {notifications.map((notif) => {
               const Icon = TYPE_ICONS[notif.type] ?? Zap;
               return (
                 <Card
                   key={notif.id}
                   className={cn('orbit-card-hover', !notif.read && 'border-primary/30 bg-primary/5')}
                 >
                   <CardContent className="flex items-start gap-3 p-4">
                     <div className={cn(
                       'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                       notif.type === 'approval_required' ? 'bg-warning/10 text-warning' :
                       notif.type === 'agent_completed' ? 'bg-success/10 text-success' :
                       'bg-primary/10 text-primary',
                     )}>
                       <Icon className="h-4 w-4" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className={cn('text-sm', !notif.read ? 'font-semibold' : 'font-medium')}>{notif.title}</p>
                       {notif.message && <p className="mt-0.5 text-xs text-muted-foreground">{notif.message}</p>}
                       <div className="mt-2 flex items-center gap-2">
                         <span className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Clock className="h-3 w-3" />
                           {new Date(notif.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {!notif.read && <Badge className="bg-primary/15 text-primary text-[10px]">New</Badge>}
                       </div>
                     </div>
                     {!notif.read && (
                       <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => handleMarkRead(notif)}>
                         Mark read
                       </Button>
                     )}
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
