/**
 * Email validation utility
 *
 * RFC 5322 compliant email validation with practical restrictions:
 * - Maximum length: 254 characters
 * - Format: local-part@domain
 * - Normalizes to lowercase
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const MAX_EMAIL_LENGTH = 254;

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  // Check if empty
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Normalize to lowercase
  const normalizedEmail = email.trim().toLowerCase();

  // Check length
  if (normalizedEmail.length === 0 || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // Check format
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return false;
  }

  // Additional checks for consecutive dots
  if (normalizedEmail.includes('..')) {
    return false;
  }

  // Check that local part and domain exist
  const [localPart, domain] = normalizedEmail.split('@');
  if (!localPart || !domain) {
    return false;
  }

  // Check domain has at least one dot (basic TLD check)
  if (!domain.includes('.')) {
    return false;
  }

  return true;
}

/**
 * Normalizes an email address to lowercase
 * @param email - The email address to normalize
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
