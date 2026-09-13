// Agent Orchestrator — coordinates the agent execution pipeline
// User request → Intent → Context → Planning → Permission Check → Tool Execution → Result → Memory Update

import type { AgentRunStatus, PermissionLevel } from '@/lib/types';
import { getPermissionLevelForTool } from './tools';

export interface AgentPlanStep {
  step: number;
  title: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  permissionLevel: PermissionLevel;
}

export interface AgentPlan {
  steps: AgentPlanStep[];
  summary: string;
}

// Parse a natural language request and produce a plan.
// In production, this would call the AI provider to understand intent and generate a plan.
// For now, it produces a structured plan based on keyword matching.
export function generatePlan(request: string): AgentPlan {
  const lower = request.toLowerCase();
  const steps: AgentPlanStep[] = [];

  if (lower.includes('research') || lower.includes('investigate') || lower.includes('explore')) {
    steps.push({
      step: 1,
      title: 'Understanding your research request',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 2,
      title: 'Searching for relevant sources',
      toolName: 'research_web',
      toolInput: { query: request },
      permissionLevel: 'safe',
    });
    steps.push({
      step: 3,
      title: 'Summarizing findings',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 4,
      title: 'Saving research to your workspace',
      permissionLevel: 'safe',
    });
  } else if (lower.includes('create task') || lower.includes('add task') || lower.includes('remind me')) {
    steps.push({
      step: 1,
      title: 'Understanding the task details',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 2,
      title: 'Creating the task',
      toolName: 'create_task',
      toolInput: { title: request },
      permissionLevel: 'safe',
    });
  } else if (lower.includes('create project') || lower.includes('new project')) {
    steps.push({
      step: 1,
      title: 'Understanding the project requirements',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 2,
      title: 'Creating the project',
      toolName: 'create_project',
      toolInput: { name: request },
      permissionLevel: 'approval',
    });
  } else if (lower.includes('review') || lower.includes('what should i') || lower.includes('plan my')) {
    steps.push({
      step: 1,
      title: 'Reviewing your current tasks and projects',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 2,
      title: 'Analyzing priorities and deadlines',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 3,
      title: 'Generating recommendations',
      permissionLevel: 'safe',
    });
  } else {
    steps.push({
      step: 1,
      title: 'Understanding your request',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 2,
      title: 'Determining the best approach',
      permissionLevel: 'safe',
    });
    steps.push({
      step: 3,
      title: 'Preparing a response',
      permissionLevel: 'safe',
    });
  }

  return {
    steps,
    summary: steps.map((s) => s.title).join(' → '),
  };
}

export function getAgentStatusFlow(): { status: AgentRunStatus; label: string; description: string }[] {
  return [
    { status: 'understanding', label: 'Understanding', description: 'ORBIT is analyzing your request' },
    { status: 'planning', label: 'Planning', description: 'Creating an execution plan' },
    { status: 'researching', label: 'Researching', description: 'Gathering relevant information' },
    { status: 'awaiting_approval', label: 'Waiting for Approval', description: 'ORBIT needs your approval to continue' },
    { status: 'executing', label: 'Executing', description: 'Running the planned actions' },
    { status: 'completed', label: 'Completed', description: 'Task finished successfully' },
  ];
}
