'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/providers/auth-provider';
import {
  User, Palette, Bot, Bell, Mic, Plug, Lock, Database,
  Sun, Moon, Monitor, LogOut, Check, X, Github, FileText,
  Webhook, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const INTEGRATIONS = [
  { service: 'github', label: 'GitHub', icon: Github, description: 'Search repos, read files, create issues', available: false },
  { service: 'notion', label: 'Notion', icon: FileText, description: 'Search workspace, create and update tasks', available: false },
  { service: 'webhook', label: 'Webhooks', icon: Webhook, description: 'Connect external services via webhooks', available: false },
];

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Settings" description="Manage your account, appearance, AI provider, and integrations." />

      <Tabs defaultValue="account" className="mt-6">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="account" className="flex-1"><User className="mr-2 h-4 w-4" />Account</TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1"><Bot className="mr-2 h-4 w-4" />AI Provider</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1"><Plug className="mr-2 h-4 w-4" />Integrations</TabsTrigger>
          <TabsTrigger value="security" className="flex-1"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-bold">
                  {user?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Signed in with email</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Future authentication options (Google sign-in, passwordless) will be available here. Currently using Supabase email/password auth.
                </p>
              </div>
              <Button variant="outline" onClick={() => signOut()} className="text-destructive hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                      mounted && theme === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
                    )}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Provider */}
        <TabsContent value="ai" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI Provider</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Provider architecture</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ORBIT uses a provider abstraction layer. The current provider is set via the AI_PROVIDER environment variable.
                      API keys are stored server-side and never exposed to the browser.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Active provider</Label>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium capitalize">Gemini (default)</span>
                  <Badge variant="outline" className="text-xs">Configured via env</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Voice settings</Label>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Voice input</p>
                    <p className="text-xs text-muted-foreground">Speak commands to ORBIT</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                To configure a different AI provider, set the AI_PROVIDER and AI_API_KEY environment variables on your server.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Agent completed', desc: 'When an agent run finishes' },
                { label: 'Approval required', desc: 'When ORBIT needs your approval' },
                { label: 'Task due', desc: 'When a task deadline is approaching' },
                { label: 'Research completed', desc: 'When research finishes' },
                { label: 'Project updates', desc: 'Important changes to projects' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Push notifications are ready to be configured. The PWA service worker already handles push events. Register your device in the Devices section to enable web push.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {INTEGRATIONS.map((int) => (
                <div key={int.service} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <int.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{int.label}</p>
                      <p className="text-xs text-muted-foreground">{int.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {int.available ? (
                        <><Check className="mr-1 h-3 w-3 text-success" />Available</>
                      ) : (
                        <><AlertCircle className="mr-1 h-3 w-3" />Coming soon</>
                      )}
                    </Badge>
                    <Button variant="outline" size="sm" disabled>
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Security & Data</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium">Row Level Security</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  All data is protected by Supabase RLS policies. You can only access your own data.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Data & Memory</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Your data is stored in a secure Supabase PostgreSQL database. Memories and audit logs track ORBIT's actions.
                </p>
              </div>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Data deletion and export controls will be available in a future update. To delete your account, sign out and contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
