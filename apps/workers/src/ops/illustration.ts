/**
 * OPS Illustration Generator using Cloudflare Workers AI
 * Generates safety incident illustrations using AI image generation
 */

import type { OPSInput } from './models';
import type { Env } from '../index';

/**
 * Translate Korean incident cause to English for AI understanding
 */
function translateIncidentCause(cause: string): string {
  // Simple translation hints for common Korean terms
  const translations: Record<string, string> = {
    '안전벨트': 'safety harness',
    '안전모': 'hard hat / safety helmet',
    '추락': 'falling from height',
    '비계': 'scaffolding',
    '사다리': 'ladder',
    '화학물질': 'chemical substance',
    '누출': 'leak / spill',
    '화재': 'fire',
    '폭발': 'explosion',
    '장비': 'equipment',
    '고장': 'malfunction / failure',
    '작업자': 'worker',
    '현장': 'work site / construction site',
    '건설': 'construction',
    '공장': 'factory / facility',
    '미착용': 'not wearing / without',
    '부족': 'insufficient / lack of',
    '불량': 'defective / faulty',
    '부실': 'inadequate / poor',
  };

  let translated = cause;
  for (const [korean, english] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(korean, 'g'), english);
  }

  return translated;
}

/**
 * Generate detailed English prompt for AI image generation
 * Uses actual incident details for accurate visualization
 */
function generateImagePrompt(input: OPSInput): string {
  const typeMap: Record<string, string> = {
    'fall': 'fall from height incident',
    '추락': 'fall from height incident',
    'chemical spill': 'chemical spill / hazmat incident',
    '화학물질 누출': 'chemical spill / hazmat incident',
    'fire': 'fire emergency',
    '화재': 'fire emergency',
    'explosion': 'explosion incident',
    '폭발': 'explosion incident',
    'equipment failure': 'equipment failure incident',
    '장비 고장': 'equipment failure incident',
    'other': 'workplace safety incident',
    '기타': 'workplace safety incident',
  };

  const normalizedType = input.incidentType.toLowerCase().trim();
  const incidentTypeDesc = typeMap[normalizedType] || 'workplace safety incident';

  // Translate incident cause for better AI understanding
  const translatedCause = translateIncidentCause(input.incidentCause || '');

  // Extract location context for better scene setting
  const locationContext = input.location?.includes('건설') || input.location?.includes('현장')
    ? 'construction site'
    : input.location?.includes('공장') || input.location?.includes('시설')
    ? 'industrial facility'
    : 'workplace';

  // Build highly detailed prompt with actual incident details
  const prompt = `
    Professional technical safety illustration depicting a ${incidentTypeDesc} at a Korean ${locationContext}.

    SPECIFIC INCIDENT DETAILS:
    - Scenario: ${translatedCause}
    - Location context: ${input.location || locationContext}
    - Incident type: ${incidentTypeDesc}

    VISUAL STYLE:
    - Art style: Professional isometric technical diagram, CAD-style rendering
    - Color scheme: OSHA standard safety colors (yellow #FFCC00 for caution, orange #FF6600 for warnings, red #CC0000 for danger)
    - Quality: Highly detailed 8K rendering with crisp clean lines

    COMPOSITION:
    - View: Cross-section cutaway diagram showing the incident moment clearly
    - Perspective: Isometric 3/4 view for maximum clarity and depth
    - Focus: The exact hazardous situation described in the incident cause

    TECHNICAL ELEMENTS:
    - Safety equipment: PPE (hard hats, safety harness, protective gear) clearly visible
    - Warning signage: Korean KOSHA safety signs and hazard markers
    - Hazard zones: Clearly marked danger areas with safety tape and barriers
    - Labels: Directional arrows and measurement indicators

    LIGHTING & RENDERING:
    - Studio lighting with clear shadows for depth perception
    - Highlights on metallic safety equipment
    - Professional technical manual illustration quality

    STANDARDS COMPLIANCE:
    - Korean industrial safety (KOSHA) manual illustration style
    - Technical accuracy for safety training materials
    - Suitable for professional safety documentation and reports

    AVOID: Cartoonish style, blurry details, pixelated rendering, amateur sketch, overly dramatic or horror-style imagery.

    PRIORITY: Accurately depict the specific incident scenario described: ${translatedCause}
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
        num_steps: 8, // Maximum steps for best quality (takes longer but more accurate)
      }
    );

    // Handle different response types
    // Workers AI can return ReadableStream, ArrayBuffer, or object with image property
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
    } else if (response instanceof ArrayBuffer) {
      const bytes = new Uint8Array(response);
      const base64 = btoa(String.fromCharCode(...bytes));
      return `data:image/png;base64,${base64}`;
    } else if (typeof response === 'object' && response !== null) {
      // Check if response has image data
      const anyResponse = response as any;
      if (anyResponse.image && anyResponse.image instanceof ArrayBuffer) {
        const bytes = new Uint8Array(anyResponse.image);
        const base64 = btoa(String.fromCharCode(...bytes));
        return `data:image/png;base64,${base64}`;
      } else if (typeof anyResponse.image === 'string') {
        // Already base64 or data URL
        if (anyResponse.image.startsWith('data:')) {
          return anyResponse.image;
        } else {
          return `data:image/png;base64,${anyResponse.image}`;
        }
      } else if (anyResponse.data && anyResponse.data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(anyResponse.data);
        const base64 = btoa(String.fromCharCode(...bytes));
        return `data:image/png;base64,${base64}`;
      }
    }

    return null;
  } catch (error) {
    console.error('Illustration generation error:', error);
    return null;
  }
}
