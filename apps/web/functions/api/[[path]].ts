/**
 * Cloudflare Pages Function - Proxy /api/* to Workers
 * This function forwards all /api/* requests to the Workers backend
 */

const WORKERS_URL = 'https://safe-ops-studio-workers.yosep102033.workers.dev';

export async function onRequest(context: {
  request: Request;
  params: { path: string[] };
}): Promise<Response> {
  const { path } = context.params;
  const apiPath = path ? path.join('/') : '';

  // Forward request to Workers
  const url = new URL(context.request.url);
  const workerUrl = `${WORKERS_URL}/api/${apiPath}${url.search}`;

  try {
    let requestInit: RequestInit = {
      method: context.request.method,
      headers: context.request.headers,
    };

    // Include body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(context.request.method)) {
      requestInit.body = await context.request.text();
    }

    const response = await fetch(workerUrl, requestInit);

    return response;
  } catch (error) {
    console.error('Error proxying to Workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
