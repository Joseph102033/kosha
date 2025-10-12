/**
 * GET /api/subscribers
 * List active newsletter subscribers (admin-only)
 */

import type { Env } from '../index';

export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  createdAt: string;
}

export interface ListSubscribersResponse {
  success: boolean;
  data?: {
    subscribers: Subscriber[];
    total: number;
  };
  error?: string;
}

/**
 * List all active newsletter subscribers
 * Admin-only endpoint (protected by requireAuth middleware)
 */
export async function handleListSubscribers(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as ListSubscribersResponse,
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  try {
    // Query all active subscribers
    const result = await env.DB.prepare(
      `SELECT id, email, status, created_at as createdAt
       FROM subscribers
       WHERE status = 'active'
       ORDER BY created_at DESC`
    ).all<Subscriber>();

    return Response.json({
      success: true,
      data: {
        subscribers: result.results || [],
        total: result.results?.length || 0,
      },
    } as ListSubscribersResponse);
  } catch (error) {
    console.error('Error listing subscribers:', error);
    return Response.json(
      { success: false, error: 'Failed to retrieve subscribers' } as ListSubscribersResponse,
      { status: 500 }
    );
  }
}
