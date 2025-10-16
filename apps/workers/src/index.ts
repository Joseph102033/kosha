/**
 * Safe OPS Studio - Cloudflare Workers Entry Point
 * Main router for all API endpoints
 */

import { handleSubscribe } from './subscriptions/subscribe';
import { handleListSubscribers } from './subscriptions/list';
import { handleGenerateOPS } from './ops/generate';
import { handleSaveOPS } from './ops/save';
import { handleGetOPS } from './ops/get';
import { handlePublicOPSPage } from './ops/public-page';
import {
  handleCreateLawRule,
  handleListLawRules,
  handleGetLawRule,
  handleUpdateLawRule,
  handleDeleteLawRule,
} from './law/rules';
import { searchLaws, getLawById, getLawTitles, getLawStats } from './law/search';
import { suggestLaws, getRuleVersion } from './law/suggest';
import { saveLawFeedback, getLawFeedback } from './law/feedback';
import { generateDocumentHash } from './utils/hash';
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

      // Law search endpoint (public - read-only)
      if (path === '/api/laws/search') {
        try {
          const queryParams = Object.fromEntries(url.searchParams);
          const searchParams = {
            query: queryParams.query || '',
            page: parseInt(queryParams.page || '1'),
            limit: parseInt(queryParams.limit || '20'),
            law_title: queryParams.law_title,
            article_no: queryParams.article_no,
          };

          const result = await searchLaws(env.DB, searchParams);

          return new Response(JSON.stringify({
            success: true,
            data: result
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Law search error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to search laws'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Law suggestion endpoint (public - hybrid scoring) - MUST come before lawIdMatch
      if (path === '/api/laws/suggest' && request.method === 'POST') {
        try {
          const body = await request.json() as {
            summary?: string;
            incident_type?: string;
            causative_object?: string;
            work_process?: string;
            limit?: number;
          };

          const result = await suggestLaws(env.DB, body);

          return new Response(JSON.stringify({
            success: true,
            data: result
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Law suggestion error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to suggest laws'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get law titles (public - read-only) - specific route before wildcard
      if (path === '/api/laws/titles') {
        try {
          const titles = await getLawTitles(env.DB);

          return new Response(JSON.stringify({
            success: true,
            data: titles
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Get law titles error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get law titles'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get law statistics (public - read-only) - specific route before wildcard
      if (path === '/api/laws/stats') {
        try {
          const stats = await getLawStats(env.DB);

          return new Response(JSON.stringify({
            success: true,
            data: stats
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Get law stats error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get law statistics'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get law rule version (public - metadata) - specific route before wildcard
      if (path === '/api/laws/rule-version') {
        try {
          const version = getRuleVersion();

          return new Response(JSON.stringify({
            success: true,
            data: version
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Get rule version error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get rule version'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Save law feedback (public - anonymous) - POST
      if (path === '/api/feedback/laws' && request.method === 'POST') {
        try {
          const body = await request.json() as {
            summary?: string;
            incident_type?: string;
            causative_object?: string;
            work_process?: string;
            selections: Array<{
              law_id: string;
              included: boolean;
              order: number;
              feedback_reason?: string;
            }>;
          };

          // Validate selections
          if (!body.selections || !Array.isArray(body.selections)) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Invalid selections format'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const result = await saveLawFeedback(env.OPS_CACHE, {
            summary: body.summary,
            incident_type: body.incident_type,
            causative_object: body.causative_object,
            work_process: body.work_process,
            selections: body.selections,
          });

          return new Response(JSON.stringify({
            success: true,
            data: result
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Save law feedback error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save feedback'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get law feedback by document hash (public - read) - GET
      if (path === '/api/feedback/laws' && request.method === 'GET') {
        try {
          const documentHash = url.searchParams.get('hash');

          if (!documentHash) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Missing document hash parameter'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const feedback = await getLawFeedback(env.OPS_CACHE, documentHash);

          if (!feedback) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Feedback not found'
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({
            success: true,
            data: feedback
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Get law feedback error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get feedback'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Generate document hash (helper endpoint for client) - POST
      if (path === '/api/feedback/hash' && request.method === 'POST') {
        try {
          const body = await request.json() as {
            summary?: string;
            incident_type?: string;
            causative_object?: string;
            work_process?: string;
          };

          const hash = await generateDocumentHash({
            summary: body.summary,
            incident_type: body.incident_type,
            causative_object: body.causative_object,
            work_process: body.work_process,
          });

          return new Response(JSON.stringify({
            success: true,
            data: { document_hash: hash }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Generate document hash error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate hash'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get law by ID (public - read-only) - wildcard route MUST be last
      const lawIdMatch = path.match(/^\/api\/laws\/([^\/]+)$/);
      if (lawIdMatch) {
        try {
          const lawId = lawIdMatch[1];
          const law = await getLawById(env.DB, lawId);

          if (!law) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Law not found'
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({
            success: true,
            data: law
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Get law error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get law'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }


      // Public OPS page (server-side rendered HTML)
      const publicOpsMatch = path.match(/^\/p\/([^\/]+)$/);
      if (publicOpsMatch) {
        const slug = publicOpsMatch[1];
        return await handlePublicOPSPage(slug, env);
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
