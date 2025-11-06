/**
 * CORS Middleware
 * Applies CORS headers to responses
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Access-Key',
};

/**
 * Apply CORS headers to a response
 */
export function applyCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCorsPrelight(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
