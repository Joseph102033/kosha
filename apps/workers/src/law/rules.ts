/**
 * Law Rules CRUD Handlers
 */

import type { Env } from '../index';
import type {
  CreateLawRuleRequest,
  UpdateLawRuleRequest,
  LawRule,
  LawRulesResponse,
  LawRuleResponse,
  DeleteLawRuleResponse,
} from './models';

/**
 * Generate unique ID for law rule
 */
function generateId(): string {
  return `law-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate create request
 */
function validateCreateRequest(data: any): data is CreateLawRuleRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return (
    typeof data.keyword === 'string' &&
    data.keyword.trim().length > 0 &&
    typeof data.lawTitle === 'string' &&
    data.lawTitle.trim().length > 0 &&
    typeof data.url === 'string' &&
    data.url.trim().length > 0
  );
}

/**
 * POST /api/law/rules - Create new law rule
 */
export async function handleCreateLawRule(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as LawRuleResponse,
      { status: 405 }
    );
  }

  try {
    const body = await request.json();

    if (!validateCreateRequest(body)) {
      return Response.json(
        { success: false, error: 'Missing required fields: keyword, lawTitle, url' } as LawRuleResponse,
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await env.DB.prepare(
      'SELECT id FROM law_rules WHERE keyword = ? AND law_title = ?'
    )
      .bind(body.keyword, body.lawTitle)
      .first();

    if (existing) {
      return Response.json(
        { success: false, error: 'Law rule with this keyword and title already exists' } as LawRuleResponse,
        { status: 409 }
      );
    }

    // Insert new rule
    const id = generateId();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, body.keyword, body.lawTitle, body.url, createdAt)
      .run();

    const newRule: LawRule = {
      id,
      keyword: body.keyword,
      law_title: body.lawTitle,
      url: body.url,
      created_at: createdAt,
    };

    return Response.json(
      { success: true, data: newRule } as LawRuleResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating law rule:', error);
    return Response.json(
      { success: false, error: 'Failed to create law rule' } as LawRuleResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/law/rules - List all law rules (with optional keyword filter)
 */
export async function handleListLawRules(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as LawRulesResponse,
      { status: 405 }
    );
  }

  try {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');

    let query: D1PreparedStatement;
    if (keyword) {
      query = env.DB.prepare(
        'SELECT * FROM law_rules WHERE keyword = ? ORDER BY created_at DESC'
      ).bind(keyword);
    } else {
      query = env.DB.prepare('SELECT * FROM law_rules ORDER BY created_at DESC');
    }

    const result = await query.all<LawRule>();

    return Response.json({
      success: true,
      data: result.results || [],
    } as LawRulesResponse);
  } catch (error) {
    console.error('Error listing law rules:', error);
    return Response.json(
      { success: false, error: 'Failed to list law rules' } as LawRulesResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/law/rules/:id - Get specific law rule
 */
export async function handleGetLawRule(ruleId: string, env: Env): Promise<Response> {
  try {
    const rule = await env.DB.prepare('SELECT * FROM law_rules WHERE id = ?')
      .bind(ruleId)
      .first<LawRule>();

    if (!rule) {
      return Response.json(
        { success: false, error: 'Law rule not found' } as LawRuleResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: rule,
    } as LawRuleResponse);
  } catch (error) {
    console.error('Error getting law rule:', error);
    return Response.json(
      { success: false, error: 'Failed to get law rule' } as LawRuleResponse,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/law/rules/:id - Update law rule
 */
export async function handleUpdateLawRule(
  ruleId: string,
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== 'PUT') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as LawRuleResponse,
      { status: 405 }
    );
  }

  try {
    const body = await request.json<UpdateLawRuleRequest>();

    // Check if rule exists
    const existing = await env.DB.prepare('SELECT * FROM law_rules WHERE id = ?')
      .bind(ruleId)
      .first<LawRule>();

    if (!existing) {
      return Response.json(
        { success: false, error: 'Law rule not found' } as LawRuleResponse,
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.keyword !== undefined) {
      updates.push('keyword = ?');
      values.push(body.keyword);
    }
    if (body.lawTitle !== undefined) {
      updates.push('law_title = ?');
      values.push(body.lawTitle);
    }
    if (body.url !== undefined) {
      updates.push('url = ?');
      values.push(body.url);
    }

    if (updates.length === 0) {
      return Response.json(
        { success: false, error: 'No fields to update' } as LawRuleResponse,
        { status: 400 }
      );
    }

    values.push(ruleId); // for WHERE clause
    await env.DB.prepare(
      `UPDATE law_rules SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...values)
      .run();

    // Fetch updated rule
    const updated = await env.DB.prepare('SELECT * FROM law_rules WHERE id = ?')
      .bind(ruleId)
      .first<LawRule>();

    return Response.json({
      success: true,
      data: updated!,
    } as LawRuleResponse);
  } catch (error) {
    console.error('Error updating law rule:', error);
    return Response.json(
      { success: false, error: 'Failed to update law rule' } as LawRuleResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/law/rules/:id - Delete law rule
 */
export async function handleDeleteLawRule(ruleId: string, env: Env): Promise<Response> {
  try {
    // Check if rule exists
    const existing = await env.DB.prepare('SELECT id FROM law_rules WHERE id = ?')
      .bind(ruleId)
      .first();

    if (!existing) {
      return Response.json(
        { success: false, error: 'Law rule not found' } as DeleteLawRuleResponse,
        { status: 404 }
      );
    }

    await env.DB.prepare('DELETE FROM law_rules WHERE id = ?').bind(ruleId).run();

    return Response.json({
      success: true,
      message: 'Law rule deleted successfully',
    } as DeleteLawRuleResponse);
  } catch (error) {
    console.error('Error deleting law rule:', error);
    return Response.json(
      { success: false, error: 'Failed to delete law rule' } as DeleteLawRuleResponse,
      { status: 500 }
    );
  }
}
