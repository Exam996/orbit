import type { PermissionLevel } from '@/lib/types';

export const PERMISSION_LEVELS: Record<PermissionLevel, {
  label: string;
  description: string;
  color: string;
}> = {
  safe: {
    label: 'Safe',
    description: 'ORBIT can perform this action automatically without asking.',
    color: 'emerald',
  },
  approval: {
    label: 'Needs Approval',
    description: 'ORBIT will ask for your approval before performing this action.',
    color: 'amber',
  },
  explicit: {
    label: 'Explicit Confirmation',
    description: 'This action requires strong confirmation due to its impact.',
    color: 'red',
  },
};

export function requiresApproval(level: PermissionLevel): boolean {
  return level === 'approval' || level === 'explicit';
}

export function isDestructive(level: PermissionLevel): boolean {
  return level === 'explicit';
}
