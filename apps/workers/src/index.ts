/**
 * Safe OPS Studio - Cloudflare Workers Entry Point
 * Main router for all API endpoints
 */

import { handleSubscribe } from './subscriptions/subscribe';
import { handleListSubscribers } from './subscriptions/list';
import { handleGenerateOPS } from './ops/generate';
import { handleSaveOPS } from './ops/save';
import { handleGetOPS } from './ops/get';
import {
  handleCreateLawRule,
  handleListLawRules,
  handleGetLawRule,
  handleUpdateLawRule,
  handleDeleteLawRule,
} from './law/rules';
import { handleSend } from './delivery/send';
import { requireAuth } from './auth/middleware';

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // KV Namespace binding
  OPS_CACHE: KVNamespace;

  // Workers AI binding
  AI: Ai;

  // Environment variables
  ACCESS_KEY?: string;
  EMAIL_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Access-Key',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // API routes
      if (path === '/api/subscribe') {
        const response = await handleSubscribe(request, env);
        // Add CORS headers to response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // List subscribers endpoint (protected)
      if (path === '/api/subscribers') {
        const response = await requireAuth(request, env, handleListSubscribers);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // OPS generation endpoint (public - for real-time preview)
      if (path === '/api/ops/generate') {
        const response = await handleGenerateOPS(request, env);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // OPS save endpoint (protected)
      if (path === '/api/ops/save') {
        const response = await requireAuth(request, env, handleSaveOPS);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // Get public OPS by slug
      const opsSlugMatch = path.match(/^\/api\/ops\/([^\/]+)$/);
      if (opsSlugMatch) {
        const slug = opsSlugMatch[1];
        const response = await handleGetOPS(slug, env);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // Law rules endpoints
      if (path === '/api/law/rules') {
        let response: Response;
        if (request.method === 'POST') {
          // POST is protected
          response = await requireAuth(request, env, handleCreateLawRule);
        } else if (request.method === 'GET') {
          // GET is public (read-only)
          response = await handleListLawRules(request, env);
        } else {
          response = Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
        }
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // Law rules endpoints with ID
      const lawRuleMatch = path.match(/^\/api\/law\/rules\/([^\/]+)$/);
      if (lawRuleMatch) {
        const ruleId = lawRuleMatch[1];
        let response: Response;

        if (request.method === 'GET') {
          // GET is public (read-only)
          response = await handleGetLawRule(ruleId, env);
        } else if (request.method === 'PUT') {
          // PUT is protected
          response = await requireAuth(request, env, (req, env) => handleUpdateLawRule(ruleId, req, env));
        } else if (request.method === 'DELETE') {
          // DELETE is protected
          response = await requireAuth(request, env, (req, env) => handleDeleteLawRule(ruleId, env));
        } else {
          response = Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
        }

        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // Email sending endpoint (protected)
      if (path === '/api/send') {
        const response = await requireAuth(request, env, handleSend);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      // More routes will be added here
      // - GET  /api/news

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
