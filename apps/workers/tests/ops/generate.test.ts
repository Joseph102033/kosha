import { describe, it, expect, beforeAll } from 'vitest';
import { SELF } from 'cloudflare:test';
import type { GenerateOPSRequest, GenerateOPSResponse } from '../../src/ops/models';

describe('POST /api/ops/generate', () => {
  beforeAll(async () => {
    // Schema is initialized in setup.ts
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'GET',
    });
    expect(response.status).toBe(405);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentDate: '2025-01-15T10:30:00Z',
        // missing location, incidentType, incidentCause
      }),
    });
    expect(response.status).toBe(400);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  it('should generate OPS with summary (4-6 lines)', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      agentObject: 'Worker',
      hazardObject: 'Scaffolding',
      incidentType: 'Fall',
      incidentCause: 'Scaffolding collapsed due to improper installation',
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    const ops = data.data!;
    // Summary should be 4-6 lines
    const summaryLines = ops.summary.trim().split('\n').filter(line => line.trim().length > 0);
    expect(summaryLines.length).toBeGreaterThanOrEqual(4);
    expect(summaryLines.length).toBeLessThanOrEqual(6);
  });

  it('should generate direct and indirect causes', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      incidentType: 'Fall',
      incidentCause: 'Worker fell from height',
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.data?.causes).toBeDefined();
    expect(Array.isArray(data.data?.causes.direct)).toBe(true);
    expect(Array.isArray(data.data?.causes.indirect)).toBe(true);
    expect(data.data?.causes.direct.length).toBeGreaterThan(0);
    expect(data.data?.causes.indirect.length).toBeGreaterThan(0);
  });

  it('should generate checklist with 6-10 items', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      incidentType: 'Fall',
      incidentCause: 'No safety harness',
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.data?.checklist).toBeDefined();
    expect(Array.isArray(data.data?.checklist)).toBe(true);
    expect(data.data?.checklist.length).toBeGreaterThanOrEqual(6);
    expect(data.data?.checklist.length).toBeLessThanOrEqual(10);
  });

  it('should include law references', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      incidentType: 'Fall',
      incidentCause: 'Fall from scaffolding',
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.data?.laws).toBeDefined();
    expect(Array.isArray(data.data?.laws)).toBe(true);
    // Should have at least one law reference
    expect(data.data?.laws.length).toBeGreaterThan(0);

    // Each law should have title and url
    data.data?.laws.forEach(law => {
      expect(law.title).toBeDefined();
      expect(law.url).toBeDefined();
      expect(typeof law.title).toBe('string');
      expect(typeof law.url).toBe('string');
    });
  });

  it('should include placeholder image metadata', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul Construction Site',
      incidentType: 'Fall',
      incidentCause: 'Fall incident',
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.data?.imageMeta).toBeDefined();
    expect(data.data?.imageMeta?.type).toBe('placeholder');
  });

  it('should handle optional fields gracefully', async () => {
    const request: GenerateOPSRequest = {
      incidentDate: '2025-01-15T10:30:00Z',
      location: 'Seoul',
      incidentType: 'Chemical Spill',
      incidentCause: 'Container leak',
      // No agentObject or hazardObject
    };

    const response = await SELF.fetch('http://localhost/api/ops/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<GenerateOPSResponse>();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
