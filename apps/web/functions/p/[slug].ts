/**
 * Cloudflare Pages Function for dynamic OPS pages
 * This handles /p/[slug] routes by serving the pre-built HTML with client-side hydration
 */

export async function onRequest(context: any) {
  // Serve the pre-built [slug].html file
  // The client-side JavaScript will handle fetching the actual OPS data
  const response = await context.env.ASSETS.fetch(context.request);

  // If the asset is not found, try to serve the [slug].html template
  if (response.status === 404) {
    const slugHtmlUrl = new URL('/p/[slug].html', context.request.url);
    return await context.env.ASSETS.fetch(slugHtmlUrl.toString());
  }

  return response;
}
