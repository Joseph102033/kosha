/**
 * Email subscription handler
 *
 * POST /api/subscribe
 * - Validates email format
 * - Prevents duplicates (idempotent)
 * - Stores in D1 database
 */

import { isValidEmail, normalizeEmail } from '../utils/validation';
import type { SubscribeRequest, SubscribeResponse } from './models';

export interface Env {
  DB: D1Database;
  OPS_CACHE: KVNamespace;
}

/**
 * Generate a unique ID for subscriber
 */
function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Handle POST /api/subscribe
 */
export async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  // Only accept POST method
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as SubscribeResponse),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let body: SubscribeRequest;

  // Parse JSON body
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid JSON',
      } as SubscribeResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Validate email field exists
  if (!body.email) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Email is required',
      } as SubscribeResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Validate email format
  if (!isValidEmail(body.email)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid email format',
      } as SubscribeResponse),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Normalize email
  const email = normalizeEmail(body.email);

  // Check if email already exists (idempotent)
  try {
    const existing = await env.DB.prepare('SELECT id, status FROM subscribers WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Already subscribed',
        } as SubscribeResponse),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert new subscriber
    const id = generateId();
    const now = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO subscribers (id, email, status, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(id, email, 'active', now)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed',
      } as SubscribeResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      } as SubscribeResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
