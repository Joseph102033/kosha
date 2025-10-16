/**
 * POST /api/ops/save Handler
 * Saves OPS document to D1 and KV
 */

import type { Env } from '../index';
import type { OPSDocument } from './models';

/**
 * Generate unique slug for public URL
 */
function generateSlug(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${random}`;
}

/**
 * Generate unique ID for OPS document
 */
function generateId(): string {
  return `ops-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export interface SaveOPSRequest {
  title: string;
  incidentDate: string;
  location: string;
  agentObject?: string;
  hazardObject?: string;
  incidentType: string;
  incidentCause: string;
  opsDocument: OPSDocument;
  createdBy?: string;
}

export interface SaveOPSResponse {
  success: boolean;
  data?: {
    id: string;
    slug: string;
    publicUrl: string;
    opsId: string; // For email sending compatibility (same as id)
  };
  error?: string;
}

/**
 * Validate save request
 */
function validateSaveRequest(data: any): data is SaveOPSRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const required = ['title', 'incidentDate', 'location', 'incidentType', 'incidentCause', 'opsDocument'];
  for (const field of required) {
    if (!data[field]) {
      return false;
    }
  }

  // Validate opsDocument structure
  const ops = data.opsDocument;
  if (!ops.summary || !ops.causes || !ops.checklist || !ops.laws) {
    return false;
  }

  return true;
}

/**
 * Handle POST /api/ops/save
 */
export async function handleSaveOPS(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as SaveOPSResponse,
      { status: 405 }
    );
  }

  try {
    const body = await request.json();

    if (!validateSaveRequest(body)) {
      return Response.json(
        { success: false, error: 'Missing required fields or invalid opsDocument structure' } as SaveOPSResponse,
        { status: 400 }
      );
    }

    const id = generateId();
    const slug = generateSlug();
    const createdAt = new Date().toISOString();
    const opsJson = JSON.stringify(body.opsDocument);

    // Save to D1
    await env.DB.prepare(
      `INSERT INTO ops_documents
       (id, title, incident_date, location, agent_object, hazard_object, incident_type, incident_cause, ops_json, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.title,
        body.incidentDate,
        body.location,
        body.agentObject || '',
        body.hazardObject || '',
        body.incidentType,
        body.incidentCause,
        opsJson,
        body.createdBy || 'admin',
        createdAt
      )
      .run();

    // Cache in KV (immutable, no expiration)
    const kvValue = JSON.stringify({
      id,
      slug,
      title: body.title,
      incidentDate: body.incidentDate,
      location: body.location,
      opsDocument: body.opsDocument,
      createdAt,
    });

    await env.OPS_CACHE.put(`ops:${slug}`, kvValue);

    // Public URL should point to Worker domain, not frontend
    // Worker handles /p/:slug route with server-rendered HTML
    const publicUrl = `https://safe-ops-studio-workers.yosep102033.workers.dev/p/${slug}`;

    return Response.json({
      success: true,
      data: {
        id,
        slug,
        publicUrl,
        opsId: id, // For email sending compatibility
      },
    } as SaveOPSResponse);
  } catch (error) {
    console.error('Error saving OPS:', error);
    return Response.json(
      { success: false, error: 'Failed to save OPS document' } as SaveOPSResponse,
      { status: 500 }
    );
  }
}
