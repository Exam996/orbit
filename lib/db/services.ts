import { supabase } from '@/lib/supabase/client';
import type {
  Project, Task, Subtask, Idea, Memory, Research,
  AgentRun, AgentStep, AgentAction, Approval, Notification,
  Integration, AuditLog,
  ProjectStatus, TaskStatus, TaskPriority, IdeaStatus,
  MemoryCategory, MemoryImportance, ResearchStatus,
  AgentRunStatus, ApprovalStatus,
} from '@/lib/types';

// ============ Projects ============
export async function getProjects(status?: ProjectStatus) {
  let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function createProject(input: { name: string; description?: string; color?: string; goals?: string }) {
  const { data, error } = await supabase.from('projects').insert(input).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ============ Tasks ============
export async function getTasks(filters?: { status?: TaskStatus; projectId?: string; priority?: TaskPriority }) {
  let q = supabase.from('tasks').select('*, project:projects(*)').order('created_at', { ascending: false });
  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.projectId) q = q.eq('project_id', filters.projectId);
  if (filters?.priority) q = q.eq('priority', filters.priority);
  const { data, error } = await q;
  if (error) throw error;
  return data as (Task & { project: Project | null })[];
}

export async function getTask(id: string) {
  const { data, error } = await supabase.from('tasks').select('*, project:projects(*), subtasks(*)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as (Task & { project: Project | null; subtasks: Subtask[] }) | null;
}

export async function createTask(input: {
  title: string; description?: string; status?: TaskStatus; priority?: TaskPriority;
  project_id?: string; due_date?: string;
}) {
  const { data, error } = await supabase.from('tasks').insert(input).select().single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ============ Subtasks ============
export async function getSubtasks(taskId: string) {
  const { data, error } = await supabase.from('subtasks').select('*').eq('task_id', taskId).order('created_at');
  if (error) throw error;
  return data as Subtask[];
}

export async function createSubtask(taskId: string, title: string) {
  const { data, error } = await supabase.from('subtasks').insert({ task_id: taskId, title }).select().single();
  if (error) throw error;
  return data as Subtask;
}

export async function toggleSubtask(id: string, completed: boolean) {
  const { data, error } = await supabase.from('subtasks').update({ completed }).eq('id', id).select().single();
  if (error) throw error;
  return data as Subtask;
}

// ============ Ideas ============
export async function getIdeas(status?: IdeaStatus) {
  let q = supabase.from('ideas').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as Idea[];
}

export async function createIdea(input: { title: string; description?: string; project_id?: string }) {
  const { data, error } = await supabase.from('ideas').insert(input).select().single();
  if (error) throw error;
  return data as Idea;
}

export async function updateIdea(id: string, updates: Partial<Idea>) {
  const { data, error } = await supabase.from('ideas').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Idea;
}

export async function deleteIdea(id: string) {
  const { error } = await supabase.from('ideas').delete().eq('id', id);
  if (error) throw error;
}

// ============ Memories ============
export async function getMemories(category?: MemoryCategory) {
  let q = supabase.from('memories').select('*').order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data as Memory[];
}

export async function createMemory(input: { title: string; content: string; category?: MemoryCategory; importance?: MemoryImportance }) {
  const { data, error } = await supabase.from('memories').insert(input).select().single();
  if (error) throw error;
  return data as Memory;
}

export async function updateMemory(id: string, updates: Partial<Memory>) {
  const { data, error } = await supabase.from('memories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Memory;
}

export async function deleteMemory(id: string) {
  const { error } = await supabase.from('memories').delete().eq('id', id);
  if (error) throw error;
}

// ============ Research ============
export async function getResearch(projectId?: string) {
  let q = supabase.from('research').select('*, project:projects(*)').order('created_at', { ascending: false });
  if (projectId) q = q.eq('project_id', projectId);
  const { data, error } = await q;
  if (error) throw error;
  return data as (Research & { project: Project | null })[];
}

export async function createResearch(input: { topic: string; query?: string; project_id?: string }) {
  const { data, error } = await supabase.from('research').insert(input).select().single();
  if (error) throw error;
  return data as Research;
}

export async function updateResearch(id: string, updates: Partial<Research>) {
  const { data, error } = await supabase.from('research').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Research;
}

export async function deleteResearch(id: string) {
  const { error } = await supabase.from('research').delete().eq('id', id);
  if (error) throw error;
}

// ============ Agent Runs ============
export async function getAgentRuns(limit?: number) {
  let q = supabase.from('agent_runs').select('*').order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data as AgentRun[];
}

export async function getAgentRun(id: string) {
  const { data, error } = await supabase.from('agent_runs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as AgentRun | null;
}

export async function createAgentRun(request: string) {
  const { data, error } = await supabase.from('agent_runs').insert({ request, status: 'pending' }).select().single();
  if (error) throw error;
  return data as AgentRun;
}

export async function updateAgentRun(id: string, updates: Partial<AgentRun>) {
  const { data, error } = await supabase.from('agent_runs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as AgentRun;
}

// ============ Agent Steps ============
export async function getAgentSteps(runId: string) {
  const { data, error } = await supabase.from('agent_steps').select('*').eq('agent_run_id', runId).order('step_number');
  if (error) throw error;
  return data as AgentStep[];
}

export async function createAgentStep(input: { agent_run_id: string; step_number: number; title: string; tool_name?: string; tool_input?: Record<string, unknown> }) {
  const { data, error } = await supabase.from('agent_steps').insert(input).select().single();
  if (error) throw error;
  return data as AgentStep;
}

export async function updateAgentStep(id: string, updates: Partial<AgentStep>) {
  const { data, error } = await supabase.from('agent_steps').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as AgentStep;
}

// ============ Agent Actions ============
export async function getAgentActions(runId: string) {
  const { data, error } = await supabase.from('agent_actions').select('*').eq('agent_run_id', runId).order('created_at');
  if (error) throw error;
  return data as AgentAction[];
}

// ============ Approvals ============
export async function getApprovals(status?: ApprovalStatus) {
  let q = supabase.from('approvals').select('*, agent_run:agent_runs(*)').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as (Approval & { agent_run: AgentRun | null })[];
}

export async function updateApproval(id: string, status: ApprovalStatus) {
  const { data, error } = await supabase
    .from('approvals')
    .update({ status, decided_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Approval;
}

// ============ Notifications ============
export async function getNotifications(unreadOnly?: boolean) {
  let q = supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (unreadOnly) q = q.eq('read', false);
  const { data, error } = await q;
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
  if (error) throw error;
}

export async function createNotification(input: { type: string; title: string; message?: string; link?: string }) {
  const { data, error } = await supabase.from('notifications').insert(input).select().single();
  if (error) throw error;
  return data as Notification;
}

// ============ Integrations ============
export async function getIntegrations() {
  const { data, error } = await supabase.from('integrations').select('*').order('service');
  if (error) throw error;
  return data as Integration[];
}

export async function updateIntegration(service: string, updates: Partial<Integration>) {
  const { data, error } = await supabase.from('integrations').update(updates).eq('service', service).select().maybeSingle();
  if (error) throw error;
  return data as Integration | null;
}

// ============ Audit Log ============
export async function getAuditLog(limit = 50) {
  const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data as AuditLog[];
}

export async function logAudit(action: string, entityType?: string, entityId?: string, details?: Record<string, unknown>) {
  const { error } = await supabase.from('audit_log').insert({ action, entity_type: entityType, entity_id: entityId, details: details || {} });
  if (error) throw error;
}
