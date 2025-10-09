import { describe, it, expect } from 'vitest';
import { verifyAccessKey, unauthorizedResponse } from '../../src/auth/middleware';
import type { Env } from '../../src/index';

describe('Auth Middleware', () => {
  const mockEnv: Env = {
    DB: {} as D1Database,
    OPS_CACHE: {} as KVNamespace,
    ACCESS_KEY: 'test-secret-key-12345',
  };

  describe('verifyAccessKey', () => {
    it('should return true when ACCESS_KEY is not configured', () => {
      const envWithoutKey: Env = { ...mockEnv, ACCESS_KEY: undefined };
      const request = new Request('http://localhost/api/test');

      expect(verifyAccessKey(request, envWithoutKey)).toBe(true);
    });

    it('should return false when Authorization header is missing', () => {
      const request = new Request('http://localhost/api/test');

      expect(verifyAccessKey(request, mockEnv)).toBe(false);
    });

    it('should return true with valid Bearer token', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'Authorization': 'Bearer test-secret-key-12345' },
      });

      expect(verifyAccessKey(request, mockEnv)).toBe(true);
    });

    it('should return true with valid direct token', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'Authorization': 'test-secret-key-12345' },
      });

      expect(verifyAccessKey(request, mockEnv)).toBe(true);
    });

    it('should return false with invalid token', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'Authorization': 'Bearer wrong-token' },
      });

      expect(verifyAccessKey(request, mockEnv)).toBe(false);
    });

    it('should return false with empty Authorization header', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'Authorization': '' },
      });

      expect(verifyAccessKey(request, mockEnv)).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 401 status', async () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it('should return JSON error message', async () => {
      const response = unauthorizedResponse();
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized: Invalid or missing access key',
      });
    });
  });
});
