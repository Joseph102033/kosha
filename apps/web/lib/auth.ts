/**
 * Authentication utilities for client-side auth state management
 */

const ACCESS_KEY_STORAGE = 'ops_access_key';

/**
 * Get access key from localStorage
 */
export function getAccessKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY_STORAGE);
}

/**
 * Save access key to localStorage
 */
export function setAccessKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY_STORAGE, key);
}

/**
 * Clear access key from localStorage
 */
export function clearAccessKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY_STORAGE);
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const key = getAccessKey();
  return key ? `Bearer ${key}` : null;
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeader = getAuthHeader();

  const headers = new Headers(options.headers);
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
