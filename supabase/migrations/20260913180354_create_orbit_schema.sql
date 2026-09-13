/*
# ORBIT Core Schema — Initial Migration

## Overview
Creates the complete database schema for ORBIT, a personal AI operating system.
All tables are user-scoped with Row Level Security policies ensuring each authenticated
user can only access their own data.

## New Tables
1. projects — Larger goals (DELT, ORBIT, college projects, etc.)
2. tasks — Centralized task system with status, priority, due dates
3. subtasks — Sub-items within tasks
4. ideas — Quick idea capture inbox
5. memories — ORBIT's long-term context system
6. research — Research workspace entries
7. agent_runs — Top-level agent execution records
8. agent_steps — Individual steps within an agent run
9. agent_actions — Actions proposed/performed by the agent
10. approvals — Approval requests from the agent
11. notifications — Notification center
12. integrations — External service integration config
13. devices — PWA device registration for push notifications
14. audit_log — Security audit trail

## Security
- RLS enabled on ALL tables
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE) scoped to authenticated users owning the data
- user_id columns default to auth.uid() so client inserts work without passing user_id
- Child tables scope through parent ownership checks
*/

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  color text DEFAULT 'blue',
  goals text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ TASKS ============
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ SUBTASKS ============
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);

DROP POLICY IF EXISTS "select_own_subtasks" ON subtasks;
CREATE POLICY "select_own_subtasks" ON subtasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_subtasks" ON subtasks;
CREATE POLICY "insert_own_subtasks" ON subtasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
DROP POLICY IF EXISTS "update_own_subtasks" ON subtasks;
CREATE POLICY "update_own_subtasks" ON subtasks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
DROP POLICY IF EXISTS "delete_own_subtasks" ON subtasks;
CREATE POLICY "delete_own_subtasks" ON subtasks FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);

-- ============ IDEAS ============
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'converted', 'archived')),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);

DROP POLICY IF EXISTS "select_own_ideas" ON ideas;
CREATE POLICY "select_own_ideas" ON ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ideas" ON ideas;
CREATE POLICY "insert_own_ideas" ON ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ideas" ON ideas;
CREATE POLICY "update_own_ideas" ON ideas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ideas" ON ideas;
CREATE POLICY "delete_own_ideas" ON ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ MEMORIES ============
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'context' CHECK (category IN ('preference', 'project', 'goal', 'decision', 'context', 'instruction')),
  title text NOT NULL,
  content text NOT NULL,
  importance text NOT NULL DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);

DROP POLICY IF EXISTS "select_own_memories" ON memories;
CREATE POLICY "select_own_memories" ON memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_memories" ON memories;
CREATE POLICY "insert_own_memories" ON memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_memories" ON memories;
CREATE POLICY "update_own_memories" ON memories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_memories" ON memories;
CREATE POLICY "delete_own_memories" ON memories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RESEARCH ============
CREATE TABLE IF NOT EXISTS research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  topic text NOT NULL,
  query text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  findings text DEFAULT '',
  sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_research_user_id ON research(user_id);
CREATE INDEX IF NOT EXISTS idx_research_project_id ON research(project_id);
CREATE INDEX IF NOT EXISTS idx_research_status ON research(status);

DROP POLICY IF EXISTS "select_own_research" ON research;
CREATE POLICY "select_own_research" ON research FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_research" ON research;
CREATE POLICY "insert_own_research" ON research FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_research" ON research;
CREATE POLICY "update_own_research" ON research FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_research" ON research;
CREATE POLICY "delete_own_research" ON research FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ AGENT_RUNS ============
CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  request text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'understanding', 'planning', 'researching', 'awaiting_approval', 'executing', 'completed', 'failed', 'cancelled')),
  plan text DEFAULT '',
  result text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

DROP POLICY IF EXISTS "select_own_agent_runs" ON agent_runs;
CREATE POLICY "select_own_agent_runs" ON agent_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_agent_runs" ON agent_runs;
CREATE POLICY "insert_own_agent_runs" ON agent_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_agent_runs" ON agent_runs;
CREATE POLICY "update_own_agent_runs" ON agent_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_agent_runs" ON agent_runs;
CREATE POLICY "delete_own_agent_runs" ON agent_runs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ AGENT_STEPS ============
CREATE TABLE IF NOT EXISTS agent_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  tool_name text,
  tool_input jsonb,
  tool_output jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE agent_steps ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_agent_steps_run_id ON agent_steps(agent_run_id);

DROP POLICY IF EXISTS "select_own_agent_steps" ON agent_steps;
CREATE POLICY "select_own_agent_steps" ON agent_steps FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_steps.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_agent_steps" ON agent_steps;
CREATE POLICY "insert_own_agent_steps" ON agent_steps FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_steps.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "update_own_agent_steps" ON agent_steps;
CREATE POLICY "update_own_agent_steps" ON agent_steps FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_steps.agent_run_id AND agent_runs.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_steps.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "delete_own_agent_steps" ON agent_steps;
CREATE POLICY "delete_own_agent_steps" ON agent_steps FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_steps.agent_run_id AND agent_runs.user_id = auth.uid())
);

-- ============ AGENT_ACTIONS ============
CREATE TABLE IF NOT EXISTS agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_step_id uuid REFERENCES agent_steps(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  description text NOT NULL,
  tool_name text,
  parameters jsonb DEFAULT '{}'::jsonb,
  permission_level text NOT NULL DEFAULT 'safe' CHECK (permission_level IN ('safe', 'approval', 'explicit')),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'rejected', 'executed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_agent_actions_run_id ON agent_actions(agent_run_id);

DROP POLICY IF EXISTS "select_own_agent_actions" ON agent_actions;
CREATE POLICY "select_own_agent_actions" ON agent_actions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_actions.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_agent_actions" ON agent_actions;
CREATE POLICY "insert_own_agent_actions" ON agent_actions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_actions.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "update_own_agent_actions" ON agent_actions;
CREATE POLICY "update_own_agent_actions" ON agent_actions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_actions.agent_run_id AND agent_runs.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_actions.agent_run_id AND agent_runs.user_id = auth.uid())
);
DROP POLICY IF EXISTS "delete_own_agent_actions" ON agent_actions;
CREATE POLICY "delete_own_agent_actions" ON agent_actions FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM agent_runs WHERE agent_runs.id = agent_actions.agent_run_id AND agent_runs.user_id = auth.uid())
);

-- ============ APPROVALS ============
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_run_id uuid REFERENCES agent_runs(id) ON DELETE CASCADE,
  action_id uuid REFERENCES agent_actions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  tool_name text,
  parameters jsonb DEFAULT '{}'::jsonb,
  permission_level text NOT NULL DEFAULT 'approval' CHECK (permission_level IN ('approval', 'explicit')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_approvals_user_id ON approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

DROP POLICY IF EXISTS "select_own_approvals" ON approvals;
CREATE POLICY "select_own_approvals" ON approvals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_approvals" ON approvals;
CREATE POLICY "insert_own_approvals" ON approvals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_approvals" ON approvals;
CREATE POLICY "update_own_approvals" ON approvals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_approvals" ON approvals;
CREATE POLICY "delete_own_approvals" ON approvals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('agent_completed', 'approval_required', 'task_due', 'research_completed', 'project_update', 'general')),
  title text NOT NULL,
  message text DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ INTEGRATIONS ============
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, service)
);
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);

DROP POLICY IF EXISTS "select_own_integrations" ON integrations;
CREATE POLICY "select_own_integrations" ON integrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_integrations" ON integrations;
CREATE POLICY "insert_own_integrations" ON integrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_integrations" ON integrations;
CREATE POLICY "update_own_integrations" ON integrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_integrations" ON integrations;
CREATE POLICY "delete_own_integrations" ON integrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ DEVICES ============
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text DEFAULT '',
  platform text DEFAULT '',
  subscription jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

DROP POLICY IF EXISTS "select_own_devices" ON devices;
CREATE POLICY "select_own_devices" ON devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_devices" ON devices;
CREATE POLICY "insert_own_devices" ON devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_devices" ON devices;
CREATE POLICY "update_own_devices" ON devices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_devices" ON devices;
CREATE POLICY "delete_own_devices" ON devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ AUDIT_LOG ============
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

DROP POLICY IF EXISTS "select_own_audit_log" ON audit_log;
CREATE POLICY "select_own_audit_log" ON audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_audit_log" ON audit_log;
CREATE POLICY "insert_own_audit_log" ON audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ updated_at trigger function ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['projects','tasks','ideas','memories','research','agent_runs','integrations','devices']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;