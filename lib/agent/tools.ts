import type { ToolDefinition } from '@/lib/types';

export const TOOL_REGISTRY: ToolDefinition[] = [
  // Research tools
  {
    name: 'research_web',
    description: 'Search the web and research a topic, returning sources and summaries.',
    permissionLevel: 'safe',
    category: 'research',
    implemented: false,
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'The search query' },
      { name: 'depth', type: 'string', required: false, description: 'How deep to research (quick, standard, deep)' },
    ],
  },
  {
    name: 'search_notion',
    description: 'Search connected Notion workspace for pages and content.',
    permissionLevel: 'safe',
    category: 'integration',
    implemented: false,
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query for Notion' },
    ],
  },
  // Task tools
  {
    name: 'create_task',
    description: 'Create a new task in the task system.',
    permissionLevel: 'safe',
    category: 'task',
    implemented: true,
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Task title' },
      { name: 'description', type: 'string', required: false, description: 'Task description' },
      { name: 'priority', type: 'string', required: false, description: 'low, medium, high, urgent' },
      { name: 'project_id', type: 'string', required: false, description: 'Associated project ID' },
      { name: 'due_date', type: 'string', required: false, description: 'Due date ISO string' },
    ],
  },
  {
    name: 'update_task',
    description: 'Update an existing task (status, priority, etc.).',
    permissionLevel: 'approval',
    category: 'task',
    implemented: true,
    parameters: [
      { name: 'task_id', type: 'string', required: true, description: 'Task ID to update' },
      { name: 'status', type: 'string', required: false, description: 'New status' },
      { name: 'priority', type: 'string', required: false, description: 'New priority' },
    ],
  },
  // Project tools
  {
    name: 'get_project',
    description: 'Retrieve project details by ID or name.',
    permissionLevel: 'safe',
    category: 'project',
    implemented: true,
    parameters: [
      { name: 'project_id', type: 'string', required: false, description: 'Project ID' },
      { name: 'name', type: 'string', required: false, description: 'Project name (fuzzy match)' },
    ],
  },
  {
    name: 'create_project',
    description: 'Create a new project.',
    permissionLevel: 'approval',
    category: 'project',
    implemented: true,
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'description', type: 'string', required: false, description: 'Project description' },
    ],
  },
  // GitHub tools
  {
    name: 'search_github',
    description: 'Search GitHub repositories and issues.',
    permissionLevel: 'safe',
    category: 'integration',
    implemented: false,
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'GitHub search query' },
    ],
  },
  {
    name: 'read_github_file',
    description: 'Read a file from a GitHub repository.',
    permissionLevel: 'safe',
    category: 'integration',
    implemented: false,
    parameters: [
      { name: 'repo', type: 'string', required: true, description: 'Repository (owner/repo)' },
      { name: 'path', type: 'string', required: true, description: 'File path' },
    ],
  },
  {
    name: 'create_github_issue',
    description: 'Create a GitHub issue in a repository.',
    permissionLevel: 'approval',
    category: 'integration',
    implemented: false,
    parameters: [
      { name: 'repo', type: 'string', required: true, description: 'Repository (owner/repo)' },
      { name: 'title', type: 'string', required: true, description: 'Issue title' },
      { name: 'body', type: 'string', required: false, description: 'Issue body' },
    ],
  },
  // System tools
  {
    name: 'send_notification',
    description: 'Send a push notification to the user\'s devices.',
    permissionLevel: 'safe',
    category: 'system',
    implemented: false,
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Notification title' },
      { name: 'message', type: 'string', required: false, description: 'Notification body' },
    ],
  },
  {
    name: 'inspect_project',
    description: 'Analyze a local project directory for structure and improvement suggestions.',
    permissionLevel: 'safe',
    category: 'code',
    implemented: false,
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Project path' },
    ],
  },
  {
    name: 'run_code',
    description: 'Execute code in a sandboxed environment.',
    permissionLevel: 'explicit',
    category: 'code',
    implemented: false,
    parameters: [
      { name: 'language', type: 'string', required: true, description: 'Programming language' },
      { name: 'code', type: 'string', required: true, description: 'Code to execute' },
    ],
  },
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.category === category);
}

export function getPermissionLevelForTool(toolName: string): 'safe' | 'approval' | 'explicit' {
  const tool = getToolByName(toolName);
  return tool?.permissionLevel ?? 'approval';
}
