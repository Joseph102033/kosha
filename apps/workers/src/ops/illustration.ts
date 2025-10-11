/**
 * OPS Illustration Generator using Cloudflare Workers AI
 * Generates safety incident illustrations using AI image generation
 */

import type { OPSInput } from './models';
import type { Env } from '../index';

/**
 * Generate English prompt for AI image generation
 * Korean text needs to be translated to English for better AI understanding
 */
function generateImagePrompt(input: OPSInput): string {
  const typeMap: Record<string, string> = {
    'fall': 'worker falling from height at construction site',
    '추락': 'worker falling from height at construction site',
    'chemical spill': 'chemical spill accident in industrial facility',
    '화학물질 누출': 'chemical spill accident in industrial facility',
    'fire': 'fire emergency in workplace',
    '화재': 'fire emergency in workplace',
    'explosion': 'explosion incident at industrial site',
    '폭발': 'explosion incident at industrial site',
    'equipment failure': 'equipment malfunction causing workplace accident',
    '장비 고장': 'equipment malfunction causing workplace accident',
    'other': 'workplace safety incident',
    '기타': 'workplace safety incident',
  };

  const normalizedType = input.incidentType.toLowerCase().trim();
  const sceneDescription = typeMap[normalizedType] || 'workplace safety incident';

  // Build comprehensive prompt
  const prompt = `
    Professional safety illustration showing ${sceneDescription}.
    Style: Clean, educational diagram with safety warning colors (yellow, orange, red).
    Perspective: Side view showing the incident clearly.
    Elements: Safety equipment, warning signs, clear hazard indicators.
    Mood: Serious, educational, professional safety training material.
    Quality: High detail, clear composition, suitable for safety documentation.
  `.trim().replace(/\s+/g, ' ');

  return prompt;
}

/**
 * Generate illustration using Cloudflare Workers AI
 * Returns base64-encoded image or null if generation fails
 */
export async function generateIllustration(
  input: OPSInput,
  env: Env
): Promise<string | null> {
  try {
    const prompt = generateImagePrompt(input);

    // Use Cloudflare Workers AI to generate image
    // Model: @cf/black-forest-labs/flux-1-schnell (fast, high quality)
    const response = await env.AI.run(
      '@cf/black-forest-labs/flux-1-schnell',
      {
        prompt: prompt,
        num_steps: 4, // Schnell is optimized for 4 steps
      }
    );

    // Response is a Blob/ReadableStream
    if (response instanceof ReadableStream) {
      const reader = response.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to base64
      const base64 = btoa(String.fromCharCode(...combined));
      return `data:image/png;base64,${base64}`;
    }

    return null;
  } catch (error) {
    console.error('Illustration generation error:', error);
    return null;
  }
}
