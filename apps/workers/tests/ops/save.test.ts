import { describe, it, expect, beforeEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import type { SaveOPSRequest, SaveOPSResponse } from '../../src/ops/save';

describe('POST /api/ops/save', () => {
  beforeEach(async () => {
    // Clean up ops_documents table
    await env.DB.prepare('DELETE FROM ops_documents').run();
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'GET',
    });
    expect(response.status).toBe(405);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test OPS',
        // missing other required fields
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json<SaveOPSResponse>();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  it('should save OPS document to D1 and return slug', async () => {
    const request: SaveOPSRequest = {
      title: 'Fall from Scaffolding',
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      agentObject: 'Worker',
      hazardObject: 'Scaffolding',
      incidentType: 'Fall',
      incidentCause: 'Scaffolding collapse',
      opsDocument: {
        summary: 'Fall incident occurred on January 15, 2025.\nLocation: Seoul Construction Site.',
        causes: {
          direct: ['Scaffolding collapse', 'No safety harness'],
          indirect: ['Inadequate inspection', 'Poor training'],
        },
        checklist: [
          'Inspect scaffolding daily',
          'Ensure harnesses are worn',
          'Provide safety training',
          'Install guardrails',
          'Mark hazardous areas',
          'Assign safety observer',
        ],
        laws: [
          {
            title: '산업안전보건법 제38조',
            url: 'https://www.law.go.kr/test',
          },
        ],
        imageMeta: {
          type: 'placeholder',
        },
      },
    };

    const response = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SaveOPSResponse>();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data?.id).toBeDefined();
    expect(data.data?.slug).toBeDefined();
    expect(data.data?.publicUrl).toMatch(/^\/p\//);

    // Verify D1 insertion
    const dbRecord = await env.DB.prepare('SELECT * FROM ops_documents WHERE id = ?')
      .bind(data.data!.id)
      .first();

    expect(dbRecord).toBeDefined();
    expect(dbRecord?.title).toBe('Fall from Scaffolding');
  });

  it('should cache OPS document in KV', async () => {
    const request: SaveOPSRequest = {
      title: 'Chemical Spill',
      incidentDate: '2025-01-20T14:00:00Z',
      location: 'Factory Floor 3',
      incidentType: 'Chemical Spill',
      incidentCause: 'Container leak',
      opsDocument: {
        summary: 'Chemical spill occurred on January 20, 2025.',
        causes: {
          direct: ['Container leak'],
          indirect: ['Poor storage'],
        },
        checklist: [
          'Inspect containers',
          'Use proper PPE',
          'Train staff',
          'Maintain ventilation',
          'Label chemicals',
          'Have spill kits ready',
        ],
        laws: [
          {
            title: '화학물질관리법 제28조',
            url: 'https://www.law.go.kr/test2',
          },
        ],
      },
    };

    const response = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SaveOPSResponse>();

    // Verify KV cache
    const cachedData = await env.OPS_CACHE.get(`ops:${data.data!.slug}`, 'json');
    expect(cachedData).toBeDefined();
    expect(cachedData).toHaveProperty('title', 'Chemical Spill');
    expect(cachedData).toHaveProperty('opsDocument');
  });

  it('should handle optional fields gracefully', async () => {
    const request: SaveOPSRequest = {
      title: 'Equipment Failure',
      incidentDate: '2025-01-25T09:00:00Z',
      location: 'Warehouse',
      incidentType: 'Equipment Failure',
      incidentCause: 'Mechanical failure',
      // No agentObject or hazardObject
      opsDocument: {
        summary: 'Equipment failure occurred.',
        causes: {
          direct: ['Mechanical failure'],
          indirect: ['Lack of maintenance'],
        },
        checklist: ['Inspect equipment', 'Schedule maintenance', 'Train operators', 'Keep logs', 'Replace worn parts', 'Monitor performance'],
        laws: [],
      },
    };

    const response = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SaveOPSResponse>();
    expect(data.success).toBe(true);
  });

  it('should generate unique slugs for different OPS documents', async () => {
    const request1: SaveOPSRequest = {
      title: 'OPS 1',
      incidentDate: '2025-01-01T00:00:00Z',
      location: 'Location 1',
      incidentType: 'Fall',
      incidentCause: 'Cause 1',
      opsDocument: {
        summary: 'Summary 1',
        causes: { direct: ['D1'], indirect: ['I1'] },
        checklist: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
        laws: [],
      },
    };

    const request2: SaveOPSRequest = {
      ...request1,
      title: 'OPS 2',
    };

    const response1 = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request1),
    });

    const response2 = await SELF.fetch('http://localhost/api/ops/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request2),
    });

    const data1 = await response1.json<SaveOPSResponse>();
    const data2 = await response2.json<SaveOPSResponse>();

    expect(data1.data!.slug).not.toBe(data2.data!.slug);
    expect(data1.data!.id).not.toBe(data2.data!.id);
  });
});
