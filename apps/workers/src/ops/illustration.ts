/**
 * OPS Illustration Generator using Cloudflare Workers AI
 * Generates safety incident illustrations using AI image generation
 */

import type { OPSInput } from './models';
import type { Env } from '../index';
import { callGemini } from '../ai/gemini';

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
 * Generate scene description using Gemini AI
 * Analyzes incident details and creates detailed visual scene description
 */
async function generateSceneDescriptionWithAI(input: OPSInput, env: Env): Promise<string | null> {
  const prompt = `당신은 산업안전 기술 삽화 전문가입니다. 다음 재해 정보를 기반으로 정확하고 상세한 장면 묘사를 영문으로 작성하세요.

**재해 정보:**
- 재해 유형: ${input.incidentType}
- 발생 장소: ${input.location}
- 재해 개요: ${input.incidentCause}
${input.agentObject ? `- 가해물: ${input.agentObject}` : ''}
${input.hazardObject ? `- 위험물: ${input.hazardObject}` : ''}

**요구사항:**

1. **정확한 장면 묘사**: 재해 개요의 내용을 정확히 반영한 구체적인 장면
   - 작업자의 위치, 자세, 행동
   - 위험 요소의 구체적인 상태
   - 안전 장비 착용/미착용 상태
   - 환경 요소 (높이, 구조물, 주변 환경)

2. **시각적 디테일**: 이미지 생성에 필요한 구체적인 시각 정보
   - 시점 (isometric 3/4 view)
   - 색상 (OSHA 안전색: yellow #FFCC00, orange #FF6600, red #CC0000)
   - 조명 (studio lighting with shadows)
   - 스타일 (professional technical diagram, CAD-style)

3. **영문으로 작성**: 이미지 생성 AI가 이해할 수 있도록 영문으로 작성

4. **간결함**: 500자 이내로 핵심만 간결하게

**출력 형식 (Plain Text, 영문):**
Professional technical safety illustration depicting [incident scenario].

Scene details:
- Worker: [position, posture, action, safety equipment status]
- Hazard: [specific hazard element and its state]
- Environment: [location context, structures, height]
- Key elements: [specific details that must be visible]

Visual style: Isometric 3/4 view, CAD-style rendering, OSHA safety colors, studio lighting.

**중요**: 재해 개요(${input.incidentCause})의 내용을 정확히 반영하세요.`;

  const response = await callGemini(prompt, env, {
    temperature: 0.7,
    maxOutputTokens: 1024,
  });

  return response;
}

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
 * CRITICAL: Translate ALL Korean text to English to prevent text artifacts in images
 */
async function generateImagePrompt(input: OPSInput, env: Env): Promise<string> {
  // Translate Korean incident info to English first
  const englishDescription = await translateIncidentToEnglish(input, env);
  return generateImagePromptWithEnglish(input, englishDescription);
}

/**
 * Translate Korean incident information to English using Gemini
 * This prevents Gemini Image API from seeing Korean text and generating Korean characters
 */
async function translateIncidentToEnglish(input: OPSInput, env: Env): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not configured, using basic translation');
    return translateIncidentCause(input.incidentCause || '');
  }

  const prompt = `Translate this Korean workplace accident description to concise English (max 3 sentences). Focus on: what happened, where, and key safety violation.

재해 유형: ${input.incidentType}
장소: ${input.location}
재해 개요: ${input.incidentCause}

Output ONLY the English description, nothing else:`;

  try {
    const response = await callGemini(prompt, env, {
      temperature: 0.3,
      maxOutputTokens: 256,
    });

    if (response) {
      console.log('✅ Korean incident translated to English');
      return response.trim();
    }
  } catch (error) {
    console.error('❌ Translation failed:', error);
  }

  // Fallback to basic translation
  return translateIncidentCause(input.incidentCause || '');
}

/**
 * Build image generation prompt with English-only description
 * NO Korean text in prompt to prevent Korean characters in generated image
 */
function generateImagePromptWithEnglish(input: OPSInput, englishDescription: string): string {
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

  // Extract location context (English only)
  const locationContext = input.location?.includes('건설') || input.location?.includes('현장')
    ? 'construction site'
    : input.location?.includes('공장') || input.location?.includes('시설')
    ? 'industrial facility'
    : 'workplace';

  // Build 100% English prompt - NO Korean text anywhere
  // This prevents Gemini from generating Korean characters in the image
  let prompt = `CRITICAL: TEXT-FREE IMAGE - DO NOT GENERATE ANY TEXT/LETTERS/CHARACTERS. This is a visual-only illustration. NO Korean text, NO Chinese characters, NO English words, NO numbers, NO labels, NO captions. ${KOSHA_STYLE_COMPACT} ${incidentTypeDesc} at ${locationContext}. Worker in yellow helmet, ${locationContext === 'construction site' ? 'blue' : 'gray'} clothes, showing ALARM on face (worried eyebrows, open mouth). Scene: ${englishDescription}.`;

  // Add type-specific details with emphasis on distress
  if (normalizedType.includes('fall') || normalizedType.includes('추락')) {
    prompt += ' Fall: worker mid-air with panicked expression, arms flailing outward, mouth open in shock, dotted motion arc, scaffolding/ladder collapsing.';
  } else if (normalizedType.includes('chemical') || normalizedType.includes('화학')) {
    prompt += ' Chemical emergency: worker with distressed worried face, vapor/fume lines rising, protective gear insufficient, hazard container leaking.';
  } else if (normalizedType.includes('fire') || normalizedType.includes('화재')) {
    prompt += ' Fire emergency: worker showing alarm, flames/smoke, urgent evacuation posture.';
  } else {
    prompt += ' Worker in distress, concerned facial expression, emergency situation.';
  }

  prompt += ' Yellow star at impact, white clouds showing force, red danger area. Serious tone, NOT happy. FINAL EMPHASIS (MANDATORY): This image MUST be 100% text-free. Absolutely FORBIDDEN: all text, all letters (Korean/Chinese/Japanese/English/any language), all numbers, all written characters, all labels, all captions, all signage, all typography. Do NOT attempt to write Korean characters - they will become distorted hieroglyphics. ONLY visual elements (drawings, shapes, colors, icons, arrows) are allowed. Pure visual communication only.';

  // Ensure under 2048 chars
  if (prompt.length > 2040) {
    console.warn(`⚠️ Prompt truncated from ${prompt.length} to 2040 chars`);
    prompt = prompt.substring(0, 2040);
  }

  console.log('📝 Illustration prompt generated:', {
    length: prompt.length,
    preview: prompt.substring(0, 200) + '...',
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
