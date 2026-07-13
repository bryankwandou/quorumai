import { OrgRole } from '@prisma/client';

/**
 * RBAC - Role-Based Access Control
 * Simple two-role model: ORG_ADMIN and ANALYST
 */

export type Action =
  | 'deals:create'
  | 'deals:view'
  | 'deals:deliberate'
  | 'deals:decision'
  | 'deals:delete'
  | 'members:invite'
  | 'members:remove'
  | 'members:view'
  | 'analytics:view'
  | 'org:settings';

const PERMISSIONS: Record<OrgRole, Action[]> = {
  ORG_ADMIN: [
    'deals:create',
    'deals:view',
    'deals:deliberate',
    'deals:decision',
    'deals:delete',
    'members:invite',
    'members:remove',
    'members:view',
    'analytics:view',
    'org:settings',
  ],
  ANALYST: [
    'deals:create',
    'deals:view',
    'deals:deliberate',
    'deals:decision',
    'members:view',
    'analytics:view',
  ],
};

export function can(action: Action, role: OrgRole): boolean {
  return PERMISSIONS[role].includes(action);
}

export function requirePermission(action: Action, role: OrgRole): void {
  if (!can(action, role)) {
    throw new Error(`Permission denied: ${action} requires higher role than ${role}`);
  }
}
