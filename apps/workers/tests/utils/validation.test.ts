import { describe, it, expect } from 'vitest';
import { isValidEmail } from '../../src/utils/validation';

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@company.co.kr',
        'admin+tag@domain.org',
        'info@subdomain.example.com',
        'name_123@test-domain.com',
      ];

      // Act & Assert
      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      // Arrange
      const invalidEmails = [
        '',
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        'user..name@example.com',
        'user@.example.com',
        'user@example..com',
      ];

      // Act & Assert
      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should reject emails exceeding maximum length', () => {
      // Arrange
      const longEmail = 'a'.repeat(250) + '@example.com'; // > 254 chars

      // Act & Assert
      expect(isValidEmail(longEmail)).toBe(false);
    });

    it('should normalize email to lowercase', () => {
      // Arrange
      const email = 'Test@EXAMPLE.COM';

      // Act
      const result = isValidEmail(email);

      // Assert
      expect(result).toBe(true);
    });
  });
});
