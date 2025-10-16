/**
 * Hash Utility for Document Fingerprinting
 * Generates deterministic hashes for incident data (no PII storage)
 */

/**
 * Generate SHA-256 hash from input data
 * Uses Web Crypto API available in Cloudflare Workers
 */
export async function generateDocumentHash(data: {
  summary?: string;
  incident_type?: string;
  causative_object?: string;
  work_process?: string;
}): Promise<string> {
  // Create deterministic string from input (sorted keys for consistency)
  const keys = ['summary', 'incident_type', 'causative_object', 'work_process'] as const;
  const normalized = keys
    .map((key) => `${key}:${(data[key] || '').trim()}`)
    .join('|');

  // Generate SHA-256 hash
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate short hash (first 16 chars) for display/logging
 */
export async function generateShortHash(data: {
  summary?: string;
  incident_type?: string;
  causative_object?: string;
  work_process?: string;
}): Promise<string> {
  const fullHash = await generateDocumentHash(data);
  return fullHash.substring(0, 16);
}

/**
 * Validate hash format
 */
export function isValidHash(hash: string): boolean {
  // SHA-256 hex string: 64 characters, 0-9a-f
  return /^[0-9a-f]{64}$/i.test(hash);
}

/**
 * Validate short hash format
 */
export function isValidShortHash(hash: string): boolean {
  // Short hash: 16 characters, 0-9a-f
  return /^[0-9a-f]{16}$/i.test(hash);
}
