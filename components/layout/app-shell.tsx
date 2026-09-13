'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ServiceWorkerProvider } from '@/components/providers/sw-provider';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Orbit, Home, Bot, FolderKanban, CheckSquare, Lightbulb,
  Search, Brain, ShieldCheck, Bell, Settings, Menu, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/research', label: 'Research', icon: Search },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/approvals', label: 'Approvals', icon: ShieldCheck },
];

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace('/auth');
  }, [session, loading, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Orbit className="h-7 w-7 animate-spin-slow" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <ServiceWorkerProvider />
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Orbit className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ORBIT</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('orbit-sidebar-item', active && 'orbit-sidebar-item-active')}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {item.href === '/approvals' && <ApprovalBadge />}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-sidebar-border p-3">
            <Link href="/notifications" className={cn('orbit-sidebar-item', pathname === '/notifications' && 'orbit-sidebar-item-active')}>
              <Bell className="h-4 w-4 shrink-0" />
              Notifications
            </Link>
            <Link href="/settings" className={cn('orbit-sidebar-item', pathname === '/settings' && 'orbit-sidebar-item-active')}>
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
          </div>

          <div className="flex items-center gap-3 border-t border-sidebar-border p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Orbit className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">ORBIT</span>
                </div>
                <nav className="space-y-1 p-3" onClick={() => setSheetOpen(false)}>
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} className={cn('orbit-sidebar-item', active && 'orbit-sidebar-item-active')}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <Link href="/notifications" className={cn('orbit-sidebar-item', pathname === '/notifications' && 'orbit-sidebar-item-active')}>
                    <Bell className="h-4 w-4 shrink-0" />
                    Notifications
                  </Link>
                  <Link href="/settings" className={cn('orbit-sidebar-item', pathname === '/settings' && 'orbit-sidebar-item-active')}>
                    <Settings className="h-4 w-4 shrink-0" />
                    Settings
                  </Link>
                  <button onClick={() => signOut()} className="orbit-sidebar-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Orbit className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight">ORBIT</span>
            </Link>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </header>

          {/* Desktop top bar */}
          <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md lg:flex">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {NAV_ITEMS.find((n) => pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href)))?.label ?? 'ORBIT'}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-0">
            {children}
          </main>

          {/* Mobile bottom nav */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
            {MOBILE_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('orbit-mobile-nav-item h-full flex-1', active && 'orbit-mobile-nav-item-active')}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

function ApprovalBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    import('@/lib/db/services').then(({ getApprovals }) => {
      getApprovals('pending').then((a) => setCount(a.length)).catch(() => {});
    });
  }, []);
  if (count === 0) return null;
  return (
    <span className="ml-auto rounded-full bg-warning/20 px-1.5 py-0.5 text-xs font-semibold text-warning">
      {count}
    </span>
  );
}
