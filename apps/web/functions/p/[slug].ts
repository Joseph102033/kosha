/**
 * Cloudflare Pages Function for dynamic OPS pages
 * This handles /p/[slug] routes by serving the pre-built HTML with client-side hydration
 */

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export async function onRequest(context: { request: Request; env: Env }) {
  // Try to fetch the [slug].html template
  const url = new URL(context.request.url);
  const templateUrl = new URL('/p/[slug].html', url.origin);

  try {
    const response = await context.env.ASSETS.fetch(new Request(templateUrl.toString()));

    if (response.ok) {
      // Return the template with proper headers
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching template:', error);
  }

  // Fallback to 404
  return new Response('Not Found', { status: 404 });
}
