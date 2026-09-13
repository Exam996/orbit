// ============ Database Row Types ============

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type IdeaStatus = 'new' | 'reviewed' | 'converted' | 'archived';
export type MemoryCategory = 'preference' | 'project' | 'goal' | 'decision' | 'context' | 'instruction';
export type MemoryImportance = 'low' | 'normal' | 'high' | 'critical';
export type ResearchStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type AgentRunStatus = 'pending' | 'understanding' | 'planning' | 'researching' | 'awaiting_approval' | 'executing' | 'completed' | 'failed' | 'cancelled';
export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type AgentActionStatus = 'proposed' | 'approved' | 'rejected' | 'executed' | 'failed';
export type PermissionLevel = 'safe' | 'approval' | 'explicit';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type NotificationType = 'agent_completed' | 'approval_required' | 'task_due' | 'research_completed' | 'project_update' | 'general';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  goals: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  importance: MemoryImportance;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: string;
  user_id: string;
  project_id: string | null;
  topic: string;
  query: string;
  status: ResearchStatus;
  findings: string;
  sources: ResearchSource[];
  created_at: string;
  updated_at: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  summary?: string;
}

export interface AgentRun {
  id: string;
  user_id: string;
  request: string;
  status: AgentRunStatus;
  plan: string;
  result: string;
  created_at: string;
  updated_at: string;
}

export interface AgentStep {
  id: string;
  agent_run_id: string;
  step_number: number;
  title: string;
  status: AgentStepStatus;
  tool_name: string | null;
  tool_input: Record<string, unknown> | null;
  tool_output: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agent_run_id: string;
  agent_step_id: string | null;
  action_type: string;
  description: string;
  tool_name: string | null;
  parameters: Record<string, unknown>;
  permission_level: PermissionLevel;
  status: AgentActionStatus;
  created_at: string;
}

export interface Approval {
  id: string;
  user_id: string;
  agent_run_id: string | null;
  action_id: string | null;
  title: string;
  description: string;
  tool_name: string | null;
  parameters: Record<string, unknown>;
  permission_level: 'approval' | 'explicit';
  status: ApprovalStatus;
  decided_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  service: string;
  status: IntegrationStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  platform: string;
  subscription: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// ============ Agent Architecture Types ============

export interface ToolDefinition {
  name: string;
  description: string;
  permissionLevel: PermissionLevel;
  parameters: ToolParameter[];
  category: 'research' | 'task' | 'project' | 'integration' | 'system' | 'code';
  implemented: boolean;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  requiresApproval?: boolean;
}
