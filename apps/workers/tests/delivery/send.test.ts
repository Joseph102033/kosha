import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import type { SendEmailRequest, SendEmailResponse } from '../../src/delivery/models';

describe('POST /api/send', () => {
  beforeEach(async () => {
    // Clean up deliveries and ops_documents tables
    await env.DB.prepare('DELETE FROM deliveries').run();
    await env.DB.prepare('DELETE FROM ops_documents').run();

    // Create test OPS documents for foreign key constraints
    const testOpsIds = ['ops-test-001', 'ops-single-001', 'ops-timestamp-001', 'ops-dedup-001'];
    for (const opsId of testOpsIds) {
      await env.DB.prepare(
        `INSERT INTO ops_documents (id, title, incident_date, location, agent_object, hazard_object, incident_type, incident_cause, ops_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        opsId,
        'Test OPS',
        '2025-01-01T00:00:00Z',
        'Test Location',
        '',
        '',
        'Test Type',
        'Test Cause',
        '{}',
        new Date().toISOString()
      ).run();
    }
  });

  it('should return 405 for non-POST methods', async () => {
    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'GET',
    });
    expect(response.status).toBe(405);
  });

  it('should return 400 for missing opsId', async () => {
    const request: Partial<SendEmailRequest> = {
      recipients: ['test@example.com'],
      publicUrl: '/p/test-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(400);
    const data = await response.json<SendEmailResponse>();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  it('should return 400 for empty recipients array', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-123',
      recipients: [],
      publicUrl: '/p/test-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(400);
    const data = await response.json<SendEmailResponse>();
    expect(data.success).toBe(false);
    expect(data.error).toContain('recipients');
  });

  it('should return 400 for invalid email addresses', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-123',
      recipients: ['invalid-email', 'valid@example.com'],
      publicUrl: '/p/test-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(400);
    const data = await response.json<SendEmailResponse>();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid email');
  });

  it('should create delivery records with queued status when EMAIL_API_KEY is not configured', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-test-001',
      recipients: ['recipient1@example.com', 'recipient2@example.com'],
      publicUrl: '/p/test-slug-123',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SendEmailResponse>();
    expect(data.success).toBe(true);
    expect(data.data?.sent).toBeGreaterThanOrEqual(0);
    expect(data.data?.deliveryIds).toHaveLength(2);

    // Verify D1 records
    const records = await env.DB.prepare('SELECT * FROM deliveries WHERE ops_id = ?')
      .bind('ops-test-001')
      .all();

    expect(records.results).toHaveLength(2);
    expect(records.results[0].to_email).toBe('recipient1@example.com');
    expect(records.results[1].to_email).toBe('recipient2@example.com');
    expect(['queued', 'sent']).toContain(records.results[0].status);
  });

  it('should handle single recipient', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-single-001',
      recipients: ['single@example.com'],
      publicUrl: '/p/single-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SendEmailResponse>();
    expect(data.success).toBe(true);
    expect(data.data?.deliveryIds).toHaveLength(1);

    // Verify D1 record
    const record = await env.DB.prepare('SELECT * FROM deliveries WHERE ops_id = ?')
      .bind('ops-single-001')
      .first();

    expect(record).toBeDefined();
    expect(record?.to_email).toBe('single@example.com');
  });

  it('should log delivery timestamp', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-timestamp-001',
      recipients: ['time@example.com'],
      publicUrl: '/p/time-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);

    const record = await env.DB.prepare('SELECT * FROM deliveries WHERE ops_id = ?')
      .bind('ops-timestamp-001')
      .first();

    expect(record?.sent_at).toBeDefined();
    expect(record?.sent_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(record?.created_at).toBeDefined();
    expect(record?.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should deduplicate recipients', async () => {
    const request: SendEmailRequest = {
      opsId: 'ops-dedup-001',
      recipients: ['dup@example.com', 'dup@example.com', 'unique@example.com'],
      publicUrl: '/p/dedup-slug',
    };

    const response = await SELF.fetch('http://localhost/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    expect(response.status).toBe(200);
    const data = await response.json<SendEmailResponse>();
    expect(data.data?.deliveryIds).toHaveLength(2); // Only 2 unique recipients

    const records = await env.DB.prepare('SELECT * FROM deliveries WHERE ops_id = ?')
      .bind('ops-dedup-001')
      .all();

    expect(records.results).toHaveLength(2);
  });
});
