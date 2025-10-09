import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import type { CreateLawRuleRequest, UpdateLawRuleRequest } from '../../src/law/models';

describe('Law Rules CRUD API', () => {
  beforeAll(async () => {
    // Schema is initialized in setup.ts
  });

  beforeEach(async () => {
    // Clean up law_rules table before each test
    await env.DB.prepare('DELETE FROM law_rules').run();
  });

  describe('POST /api/law/rules - Create', () => {
    it('should create a new law rule', async () => {
      const request: CreateLawRuleRequest = {
        keyword: 'fall',
        lawTitle: '산업안전보건법 제38조',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      };

      const response = await SELF.fetch('http://localhost/api/law/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.keyword).toBe('fall');
      expect(data.data.law_title).toBe('산업안전보건법 제38조');
      expect(data.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await SELF.fetch('http://localhost/api/law/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: 'fall' }), // missing lawTitle and url
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should prevent duplicate keyword + lawTitle combinations', async () => {
      const request: CreateLawRuleRequest = {
        keyword: 'chemical',
        lawTitle: '화학물질관리법 제28조',
        url: 'https://www.law.go.kr/test',
      };

      // First insert
      await SELF.fetch('http://localhost/api/law/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      // Duplicate insert
      const response = await SELF.fetch('http://localhost/api/law/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });
  });

  describe('GET /api/law/rules - List', () => {
    it('should list all law rules', async () => {
      // Insert test data
      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-1', 'fall', '산업안전보건법 제38조', 'https://example.com/1', new Date().toISOString())
        .run();

      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-2', 'chemical', '화학물질관리법', 'https://example.com/2', new Date().toISOString())
        .run();

      const response = await SELF.fetch('http://localhost/api/law/rules', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.length).toBe(2);
    });

    it('should filter by keyword query parameter', async () => {
      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-1', 'fall', '산업안전보건법 제38조', 'https://example.com/1', new Date().toISOString())
        .run();

      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-2', 'chemical', '화학물질관리법', 'https://example.com/2', new Date().toISOString())
        .run();

      const response = await SELF.fetch('http://localhost/api/law/rules?keyword=fall', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(1);
      expect(data.data[0].keyword).toBe('fall');
    });
  });

  describe('GET /api/law/rules/:id - Get by ID', () => {
    it('should get a specific law rule by ID', async () => {
      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-123', 'fall', '산업안전보건법 제38조', 'https://example.com/1', new Date().toISOString())
        .run();

      const response = await SELF.fetch('http://localhost/api/law/rules/test-123', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('test-123');
      expect(data.data.keyword).toBe('fall');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await SELF.fetch('http://localhost/api/law/rules/non-existent', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/law/rules/:id - Update', () => {
    it('should update a law rule', async () => {
      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-123', 'fall', '산업안전보건법 제38조', 'https://example.com/1', new Date().toISOString())
        .run();

      const update: UpdateLawRuleRequest = {
        lawTitle: '산업안전보건법 제38조 (개정)',
        url: 'https://example.com/updated',
      };

      const response = await SELF.fetch('http://localhost/api/law/rules/test-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.law_title).toBe('산업안전보건법 제38조 (개정)');
      expect(data.data.url).toBe('https://example.com/updated');
      expect(data.data.keyword).toBe('fall'); // unchanged
    });

    it('should return 404 when updating non-existent rule', async () => {
      const response = await SELF.fetch('http://localhost/api/law/rules/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawTitle: 'Updated' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/law/rules/:id - Delete', () => {
    it('should delete a law rule', async () => {
      await env.DB.prepare(
        'INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind('test-123', 'fall', '산업안전보건법 제38조', 'https://example.com/1', new Date().toISOString())
        .run();

      const response = await SELF.fetch('http://localhost/api/law/rules/test-123', {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify deletion
      const check = await env.DB.prepare('SELECT * FROM law_rules WHERE id = ?')
        .bind('test-123')
        .first();
      expect(check).toBeNull();
    });

    it('should return 404 when deleting non-existent rule', async () => {
      const response = await SELF.fetch('http://localhost/api/law/rules/non-existent', {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });
});
