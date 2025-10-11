/**
 * POST /api/ops/generate Handler
 * Generates OPS document from incident input
 */

import type { Env } from '../index';
import type { GenerateOPSRequest, GenerateOPSResponse } from './models';
import { composeOPS } from './composer';
import { matchLaws } from '../law/matcher';
import { generateIllustration } from './illustration';

/**
 * Validate required fields in request
 */
function validateRequest(data: any): data is GenerateOPSRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const required = ['incidentDate', 'location', 'incidentType', 'incidentCause'];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Handle POST /api/ops/generate
 */
export async function handleGenerateOPS(request: Request, env: Env): Promise<Response> {
  // Only allow POST
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as GenerateOPSResponse,
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!validateRequest(body)) {
      return Response.json(
        { success: false, error: 'Missing required fields: incidentDate, location, incidentType, incidentCause' } as GenerateOPSResponse,
        { status: 400 }
      );
    }

    const input: GenerateOPSRequest = body;

    // Match laws based on incident type and objects (with AI-powered keyword extraction)
    const laws = await matchLaws(input.incidentType, input.agentObject, input.hazardObject, env, input.incidentCause);

    // Compose OPS document (with AI-powered analysis)
    const opsDocument = await composeOPS(input, laws, env);

    // Generate illustration (optional - don't fail if this fails)
    try {
      const illustrationUrl = await generateIllustration(input, env);
      if (illustrationUrl) {
        opsDocument.imageMeta = {
          type: 'generated',
          url: illustrationUrl,
        };
      }
    } catch (error) {
      console.error('Failed to generate illustration, using placeholder:', error);
      // Keep default placeholder
    }

    return Response.json({
      success: true,
      data: opsDocument,
    } as GenerateOPSResponse);
  } catch (error) {
    console.error('Error generating OPS:', error);
    return Response.json(
      { success: false, error: 'Failed to generate OPS document' } as GenerateOPSResponse,
      { status: 500 }
    );
  }
}
