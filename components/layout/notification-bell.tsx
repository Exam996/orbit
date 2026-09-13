'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { getNotifications } from '@/lib/db/services';
import type { Notification } from '@/lib/types';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getNotifications(true).then((n: Notification[]) => setUnread(n.length)).catch(() => {});
    const interval = setInterval(() => {
      getNotifications(true).then((n: Notification[]) => setUnread(n.length)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </Button>
    </Link>
  );
}
