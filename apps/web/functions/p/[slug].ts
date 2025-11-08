/**
 * Cloudflare Pages Function - Proxy /p/:slug to Workers
 * This function forwards all /p/* requests to the Workers backend
 */

const WORKERS_URL = 'https://safe-ops-studio-workers.yosep102033.workers.dev';

export async function onRequest(context: {
  request: Request;
  params: { slug: string };
}): Promise<Response> {
  const { slug } = context.params;

  // Forward request to Workers
  const workerUrl = `${WORKERS_URL}/p/${slug}`;

  try {
    const response = await fetch(workerUrl, {
      method: context.request.method,
      headers: context.request.headers,
    });

    return response;
  } catch (error) {
    console.error('Error proxying to Workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
