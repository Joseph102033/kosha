/**
 * OPS Illustration Generator using Cloudflare Workers AI
 * Generates safety incident illustrations using AI image generation
 */

import type { OPSInput } from './models';
import type { Env } from '../index';


// REMOVED: AI scene description generator no longer used
// We now use ONLY pre-defined English descriptions to eliminate ALL Korean text

/**
 * Compact KOSHA Style Guide for AI image generation
 * Optimized for appropriate emotional tone in fatal accident documentation
 *
 * CRITICAL: Facial expressions must convey serious/distressed tone
 * - These are fatal workplace accidents for government safety reports
 * - Workers must show alarm/distress, NEVER smiling or happy
 * - Reference: Official KOSHA safety manual illustrations
 *
 * UPDATED (2025-11-01): Strengthened NO TEXT requirement to prevent Korean character artifacts
 */
const KOSHA_STYLE_COMPACT = `TEXT-FREE ILLUSTRATION ONLY. Absolutely NO written content: no letters, no words, no numbers, no Korean/Chinese/Japanese characters, no labels, no captions, no signage, no typography of any kind. Use ONLY visual symbols (icons, arrows, color coding). KOSHA safety manual style: cartoon with 2px black outlines, flat colors. Yellow helmet, blue/gray work clothes, red danger zones, white cloud effects. Light gray background. NO gradients. CRITICAL: Worker's face shows DISTRESS - furrowed worried eyebrows, mouth open in alarm, eyes wide in shock. NOT smiling, NOT happy. Panicked body language (arms flailing, falling). Serious safety incident, emergency situation. Yellow star burst at impact point.`.trim();

/**
 * Generate detailed English prompt for AI image generation
 * CRITICAL: Use ONLY pre-defined English descriptions to prevent ANY Korean text
 * NO translation - direct English-only mapping to eliminate Korean artifacts
 */
async function generateImagePrompt(input: OPSInput, env: Env): Promise<string> {
  // Use ONLY generic English descriptions - NO translation to prevent Korean text
  const englishDescription = getGenericIncidentDescription(input.incidentType);
  console.log('📝 Using generic English-only description (no translation):', englishDescription);
  return generateImagePromptWithEnglish(input, englishDescription);
}

// REMOVED: Translation function no longer used
// We now use ONLY pre-defined English descriptions to eliminate ALL Korean text
// This prevents Gemini from generating Korean characters in images

/**
 * Get generic incident description based on type (100% English, no Korean)
 * Maps common incident types to simple, visual English descriptions
 * NO Korean text in input or output - pure English for image generation
 */
function getGenericIncidentDescription(incidentType: string): string {
  const normalized = incidentType.toLowerCase().trim();

  // Fall incidents (추락)
  if (normalized.includes('fall') || normalized.includes('추락') || normalized.includes('ladder') || normalized.includes('사다리')) {
    return 'Worker falling from 3-meter ladder during overhead work. Person mid-air with limbs extended, motion lines showing downward movement. Ladder tipping over.';
  }

  // Fire incidents (화재)
  if (normalized.includes('fire') || normalized.includes('화재') || normalized.includes('burn') || normalized.includes('불') || normalized.includes('용접')) {
    return 'Welding sparks igniting nearby flammable materials. Flames spreading, worker stepping back with alarmed expression. Fire extinguisher visible nearby.';
  }

  // Caught/entanglement incidents (끼임)
  if (normalized.includes('caught') || normalized.includes('끼임') || normalized.includes('equipment') || normalized.includes('machinery') || normalized.includes('컨베이어') || normalized.includes('벨트') || normalized.includes('기계')) {
    return 'Worker hand caught between conveyor belt and rotating roller. Hand being pulled into machinery gap. Emergency stop button nearby but not pressed.';
  }

  // Chemical incidents (화학물질)
  if (normalized.includes('chemical') || normalized.includes('화학') || normalized.includes('leak') || normalized.includes('누출') || normalized.includes('독성')) {
    return 'Chemical container leaking hazardous liquid forming puddle on floor. Worker nearby with insufficient protective equipment. Vapor clouds rising from spill.';
  }

  // Explosion incidents (폭발)
  if (normalized.includes('explosion') || normalized.includes('폭발') || normalized.includes('blast')) {
    return 'Explosive blast with debris flying outward. Pressure wave radiating from source. Worker being thrown backward by force of explosion.';
  }

  // Electrocution incidents (감전)
  if (normalized.includes('electric') || normalized.includes('감전') || normalized.includes('shock') || normalized.includes('전기')) {
    return 'Worker touching exposed electrical wire. Lightning bolt symbols showing electrical discharge. Person body rigid with shock, hair standing on end.';
  }

  // Struck by object (낙하물)
  if (normalized.includes('struck') || normalized.includes('낙하') || normalized.includes('hit') || normalized.includes('충돌')) {
    return 'Heavy object falling from above toward worker below. Worker looking up with alarm. Motion lines showing falling trajectory.';
  }

  // Generic fallback
  return 'Workplace safety incident with worker in distress. Emergency situation requiring immediate safety intervention. Worker showing alarm and concern.';
}

/**
 * Build image generation prompt with English-only description
 * NO Korean text in prompt to prevent Korean characters in generated image
 * ZERO TOLERANCE for ANY non-English text in this function
 */
function generateImagePromptWithEnglish(input: OPSInput, englishDescription: string): string {
  // Map incident types to English descriptions (NO Korean keys)
  const normalizedType = input.incidentType.toLowerCase().trim();
  let incidentTypeDesc = 'workplace safety incident';

  if (normalizedType.includes('fall')) {
    incidentTypeDesc = 'fall from height incident';
  } else if (normalizedType.includes('chemical')) {
    incidentTypeDesc = 'chemical spill hazmat incident';
  } else if (normalizedType.includes('fire')) {
    incidentTypeDesc = 'fire emergency';
  } else if (normalizedType.includes('explosion')) {
    incidentTypeDesc = 'explosion incident';
  } else if (normalizedType.includes('caught') || normalizedType.includes('equipment')) {
    incidentTypeDesc = 'machinery entanglement incident';
  }

  // Default to industrial facility (NO Korean location checks)
  const locationContext = 'industrial facility';

  // Build 100% English prompt - ZERO Korean text anywhere
  let prompt = `ABSOLUTE REQUIREMENT: This image MUST contain ZERO text, ZERO letters, ZERO words in ANY language. No Korean. No English. No Chinese. No Japanese. No numbers. No labels. No captions. No signage. Only pure visual illustration. ${KOSHA_STYLE_COMPACT} Scene: ${incidentTypeDesc} at ${locationContext}. ${englishDescription} Worker wearing yellow safety helmet and gray work clothes, face showing DISTRESS (worried eyebrows, open mouth in alarm, wide shocked eyes). NOT smiling. Panicked body language.`;

  // Add type-specific visual details (English only)
  if (normalizedType.includes('fall')) {
    prompt += ' Fall scene: person mid-air with arms flailing, dotted motion arc showing fall path, ladder or platform tipping over, yellow star burst at impact point.';
  } else if (normalizedType.includes('chemical')) {
    prompt += ' Chemical scene: container leaking liquid, vapor clouds rising, worker stepping back with alarmed face, puddle forming.';
  } else if (normalizedType.includes('fire')) {
    prompt += ' Fire scene: orange flames spreading, gray smoke, worker backing away urgently, fire extinguisher nearby.';
  } else if (normalizedType.includes('caught') || normalizedType.includes('equipment')) {
    prompt += ' Machinery scene: hand caught in equipment gap, rotating parts, emergency stop button visible, motion lines.';
  } else {
    prompt += ' Emergency scene: worker in visible distress, danger present, urgent situation.';
  }

  prompt += ' Visual elements: yellow star burst, white cloud puffs showing force, red danger zone highlighting hazard. Flat colors, 2px black outlines, KOSHA cartoon style. Light gray background. FINAL WARNING: If you generate ANY text characters (Korean/English/Chinese/numbers/symbols), you have FAILED. This MUST be a pure visual illustration with ZERO textual content. Do NOT add explanatory text. Do NOT add labels. Do NOT add captions. Visual communication ONLY through drawings.';

  // Ensure under 2048 chars
  if (prompt.length > 2040) {
    console.warn(`⚠️ Prompt truncated from ${prompt.length} to 2040 chars`);
    prompt = prompt.substring(0, 2040);
  }

  console.log('📝 100% English-only prompt generated:', {
    length: prompt.length,
    hasKorean: /[\u3131-\uD79D]/.test(prompt),
    preview: prompt.substring(0, 150) + '...',
  });

  return prompt;
}

/**
 * Generate illustration using Google Gemini 2.5 Flash Image API
 * Returns base64-encoded image (data URL) or null if generation fails
 * Free tier: 500 images/day via Google AI Studio
 */
export async function generateIllustration(
  input: OPSInput,
  env: Env
): Promise<string | null> {
  try {
    // Check if Gemini API key is configured
    if (!env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return null;
    }

    const prompt = await generateImagePrompt(input, env);
    console.log('🎨 Generating illustration with Gemini 2.5 Flash Image...');

    // Call Google Gemini 2.5 Flash Image API
    // Model: gemini-2.0-flash-preview-image-generation
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'], // MUST include TEXT with IMAGE for Gemini
            temperature: 0.4, // Lower temperature for consistent safety illustrations
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      return null;
    }

    const result = await response.json();

    // Extract image data from Gemini response
    // Response structure: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];

      // Find image part in response
      const imagePart = candidate.content?.parts?.find(
        (part: any) => part.inlineData?.mimeType?.startsWith('image/')
      );

      if (imagePart?.inlineData?.data) {
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        const base64Data = imagePart.inlineData.data;

        console.log('✅ Illustration generated successfully');
        return `data:${mimeType};base64,${base64Data}`;
      }
    }

    console.error('❌ No image found in Gemini response');
    return null;
  } catch (error) {
    console.error('❌ Illustration generation error:', error);
    return null;
  }
}
