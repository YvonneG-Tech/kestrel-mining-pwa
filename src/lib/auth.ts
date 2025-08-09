import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { UserRole } from '@prisma/client';

export async function getServerAuth() {
  return await getServerSession(authOptions);
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'USER': 0,
    'SUPERVISOR': 1,
    'ADMIN': 2,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function requireAuth(requiredRole: UserRole = 'USER') {
  return async function authMiddleware(
    request: Request,
    handler: (request: Request) => Promise<Response>
  ): Promise<Response> {
    const session = await getServerAuth();

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userRole = (session.user as { role: UserRole }).role;
    if (!hasPermission(userRole, requiredRole)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return handler(request);
  };
}