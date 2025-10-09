import { describe, it, expect, beforeAll } from 'vitest';
import { env, SELF } from 'cloudflare:test';

describe('POST /api/subscribe', () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    await env.DB.prepare('DELETE FROM subscribers WHERE email LIKE ?').bind('%@test.com').run();
  });

  it('should successfully subscribe a new email', async () => {
    // Arrange
    const email = 'newuser@test.com';
    const request = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // Act
    const response = await SELF.fetch(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Successfully subscribed',
    });

    // Verify database entry
    const result = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?')
      .bind(email)
      .first();

    expect(result).toBeDefined();
    expect(result?.email).toBe(email);
    expect(result?.status).toBe('active');
  });

  it('should return 400 for invalid email format', async () => {
    // Arrange
    const invalidEmail = 'invalid-email';
    const request = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invalidEmail }),
    });

    // Act
    const response = await SELF.fetch(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid email');
  });

  it('should handle duplicate email idempotently', async () => {
    // Arrange
    const email = 'duplicate@test.com';

    // First subscription
    const firstRequest = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    await SELF.fetch(firstRequest);

    // Second subscription (duplicate)
    const secondRequest = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // Act
    const response = await SELF.fetch(secondRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Already subscribed');

    // Verify only one entry exists
    const results = await env.DB.prepare('SELECT COUNT(*) as count FROM subscribers WHERE email = ?')
      .bind(email)
      .first();

    expect(results?.count).toBe(1);
  });

  it('should return 400 for missing email field', async () => {
    // Arrange
    const request = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    // Act
    const response = await SELF.fetch(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Email is required');
  });

  it('should return 405 for non-POST methods', async () => {
    // Arrange
    const request = new Request('http://localhost/api/subscribe', {
      method: 'GET',
    });

    // Act
    const response = await SELF.fetch(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(405);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Method not allowed');
  });

  it('should normalize email to lowercase', async () => {
    // Arrange
    const email = 'CaseSensitive@TEST.COM';
    const normalizedEmail = 'casesensitive@test.com';
    const request = new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // Act
    const response = await SELF.fetch(request);
    await response.json();

    // Assert
    const result = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?')
      .bind(normalizedEmail)
      .first();

    expect(result).toBeDefined();
    expect(result?.email).toBe(normalizedEmail);
  });
});
