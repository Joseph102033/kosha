/**
 * Authentication middleware for admin routes
 */

import type { Env } from '../index';

/**
 * Verify access key from request headers
 */
export function verifyAccessKey(request: Request, env: Env): boolean {
  // If no ACCESS_KEY is configured, allow all requests (dev mode)
  if (!env.ACCESS_KEY) {
    return true;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return false;
  }

  // Support both "Bearer <token>" and direct token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === env.ACCESS_KEY;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): Response {
  return Response.json(
    {
      success: false,
      error: 'Unauthorized: Invalid or missing access key',
    },
    { status: 401 }
  );
}

/**
 * Middleware wrapper for protected routes
 */
export async function requireAuth(
  request: Request,
  env: Env,
  handler: (request: Request, env: Env) => Promise<Response>
): Promise<Response> {
  if (!verifyAccessKey(request, env)) {
    return unauthorizedResponse();
  }
  return handler(request, env);
}
