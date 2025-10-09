/**
 * GET /api/ops/:slug Handler
 * Retrieves OPS document from KV cache or D1
 */

import type { Env } from '../index';

export interface GetOPSResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Handle GET /api/ops/:slug (public endpoint)
 * Returns cached OPS from KV, falls back to D1
 */
export async function handleGetOPS(slug: string, env: Env): Promise<Response> {
  try {
    // Try KV cache first
    const cached = await env.OPS_CACHE.get(`ops:${slug}`, 'json');

    if (cached) {
      return Response.json({
        success: true,
        data: cached,
      } as GetOPSResponse);
    }

    // Fallback to D1 (should rarely happen)
    // Note: We don't have slug in D1, only ID
    // For now, return 404 if not in cache
    return Response.json(
      {
        success: false,
        error: 'OPS document not found',
      } as GetOPSResponse,
      { status: 404 }
    );
  } catch (error) {
    console.error('Error retrieving OPS:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to retrieve OPS document',
      } as GetOPSResponse,
      { status: 500 }
    );
  }
}
