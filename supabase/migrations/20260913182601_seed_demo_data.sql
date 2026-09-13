/*
# ORBIT Demo Data — Seed Migration

## Overview
Creates realistic demo data for development: example projects (DELT, ORBIT),
sample tasks, ideas, memories, and notifications. This data is clearly
separated from production data — it only inserts if the tables are empty
and uses a known demo user email pattern.

## Important
This migration inserts demo data only. It does NOT create tables or policies.
All data is user-scoped. The demo data uses the first authenticated user found.
*/

-- Find the first authenticated user to attach demo data to
DO $$
DECLARE
  demo_user uuid;
  proj_delt uuid;
  proj_orbit uuid;
BEGIN
  SELECT id INTO demo_user FROM auth.users ORDER BY created_at LIMIT 1;
  IF demo_user IS NULL THEN
    RAISE NOTICE 'No users found — skipping demo data seed. Data will be created after first signup.';
    RETURN;
  END IF;

  -- Check if demo data already exists
  IF EXISTS (SELECT 1 FROM projects WHERE user_id = demo_user AND name = 'DELT') THEN
    RAISE NOTICE 'Demo data already exists — skipping.';
    RETURN;
  END IF;

  -- Create DELT project
  INSERT INTO projects (user_id, name, description, status, color, goals)
  VALUES (demo_user, 'DELT', 'A decentralized learning platform for connecting students, mentors, and resources in a unified ecosystem.', 'active', 'blue',
    'Build a working MVP by Q1 2026. Validate the concept with 50+ beta users. Establish core team of 3-5 contributors.')
  RETURNING id INTO proj_delt;

  -- Create ORBIT project
  INSERT INTO projects (user_id, name, description, status, color, goals)
  VALUES (demo_user, 'ORBIT', 'A personal AI operating system that manages projects, tasks, research, and productivity through natural language.', 'active', 'cyan',
    'Ship the first working foundation with PWA, auth, command center, and agent architecture. Then connect AI provider and real tools.')
  RETURNING id INTO proj_orbit;

  -- Create tasks for DELT
  INSERT INTO tasks (user_id, project_id, title, description, status, priority) VALUES
  (demo_user, proj_delt, 'Research ORBIT architecture', 'Study existing AI agent architectures and determine the best approach for ORBIT.', 'completed', 'high'),
  (demo_user, proj_delt, 'Build authentication system', 'Set up Supabase auth with email/password and protected routes.', 'completed', 'high'),
  (demo_user, proj_delt, 'Design agent tool system', 'Create the tool registry, permission levels, and execution pipeline.', 'in_progress', 'urgent'),
  (demo_user, proj_delt, 'Validate concept with users', 'Reach out to potential users for feedback on the DELT concept.', 'todo', 'medium'),
  (demo_user, proj_delt, 'Create landing page', 'Design and build a marketing landing page for DELT.', 'todo', 'low');

  -- Create tasks for ORBIT
  INSERT INTO tasks (user_id, project_id, title, description, status, priority) VALUES
  (demo_user, proj_orbit, 'Build PWA manifest and service worker', 'Set up installable PWA with offline support.', 'completed', 'high'),
  (demo_user, proj_orbit, 'Implement command center', 'Build the main ORBIT home screen with natural language input.', 'in_progress', 'high'),
  (demo_user, proj_orbit, 'Connect AI provider', 'Integrate Gemini or another free-tier AI provider through the abstraction layer.', 'todo', 'urgent'),
  (demo_user, proj_orbit, 'Build mobile navigation', 'Create bottom navigation for mobile with proper touch targets.', 'todo', 'medium');

  -- Create a general task (no project)
  INSERT INTO tasks (user_id, title, description, status, priority) VALUES
  (demo_user, 'Plan my week', 'Review all active projects and tasks, then create a weekly plan.', 'todo', 'medium');

  -- Create ideas
  INSERT INTO ideas (user_id, title, description, status) VALUES
  (demo_user, 'Voice command support', 'Add speech-to-text so I can talk to ORBIT instead of typing.', 'new'),
  (demo_user, 'Weekly digest email', 'ORBIT sends a summary every Sunday with what was done and what''s coming.', 'new'),
  (demo_user, 'Calendar integration', 'Connect Google Calendar so ORBIT can see my schedule and plan around it.', 'reviewed'),
  (demo_user, 'Code review tool', 'ORBIT reads a PR and gives improvement suggestions.', 'new');

  -- Create memories
  INSERT INTO memories (user_id, category, title, content, importance) VALUES
  (demo_user, 'preference', 'Prefers dark mode', 'Always uses dark theme. Light mode should be available but dark is default.', 'normal'),
  (demo_user, 'preference', 'Minimal interface', 'Prefers clean, minimal interfaces without clutter. Avoid excessive colors and gradients.', 'high'),
  (demo_user, 'goal', 'Build DELT into a real product', 'Wants DELT to become a real SaaS product with paying customers within 12 months.', 'high'),
  (demo_user, 'context', 'College student', 'Currently studying and working on side projects simultaneously. Time management is critical.', 'normal'),
  (demo_user, 'decision', 'Using Supabase for backend', 'Decided to use Supabase for auth, database, and storage instead of building a custom backend.', 'normal'),
  (demo_user, 'instruction', 'Always ask before deleting', 'ORBIT should never delete data without explicit confirmation, even for low-importance items.', 'critical');

  -- Create notifications
  INSERT INTO notifications (user_id, type, title, message, read) VALUES
  (demo_user, 'agent_completed', 'Research task completed', 'ORBIT finished researching AI agent architectures.', false),
  (demo_user, 'approval_required', 'Approval needed: Create GitHub issue', 'ORBIT wants to create a GitHub issue in the DELT repository.', false),
  (demo_user, 'task_due', 'Task due tomorrow', 'Design agent tool system is due tomorrow.', false),
  (demo_user, 'general', 'Welcome to ORBIT', 'Your personal AI operating system is ready. Start by typing a command on the home screen.', true);

  RAISE NOTICE 'Demo data created successfully for user %', demo_user;
END $$;