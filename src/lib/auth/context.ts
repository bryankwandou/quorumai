import { auth as clerkAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { OrgRole } from '@prisma/client';

export interface AuthContext {
  userId: string;
  clerkUserId: string;
  organizationId: string | null;
  role: OrgRole | null;
  email: string;
}

/**
 * Server-side auth context retrieval
 * Throws if user is not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const { userId: clerkUserId, orgId: clerkOrgId } = await clerkAuth();
  
  if (!clerkUserId) {
    throw new Error('Unauthorized - no authenticated user');
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      email: true,
      memberships: {
        where: clerkOrgId ? {
          organization: {
            clerkOrgId,
          },
        } : undefined,
        select: {
          organizationId: true,
          role: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error('User not found in database');
  }

  const membership = user.memberships[0];

  return {
    userId: user.id,
    clerkUserId,
    organizationId: membership?.organizationId ?? null,
    role: membership?.role ?? null,
    email: user.email,
  };
}

/**
 * Requires user to be in an organization context
 */
export async function requireOrgAuth(): Promise<Required<AuthContext>> {
  const auth = await requireAuth();
  
  if (!auth.organizationId || !auth.role) {
    throw new Error('No organization context - user must be in an organization');
  }

  return auth as Required<AuthContext>;
}
