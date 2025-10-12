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
 * KOSHA Style Guide (from reference analysis)
 * Based on 6 reference images: fall_1-4, chemical_1, machine_1
 */
const KOSHA_STYLE_GUIDE = `
KOSHA SAFETY MANUAL ILLUSTRATION STYLE (Reference-Based):

VISUAL STYLE:
- Semi-realistic cartoon with bold black outlines (2-3px weight)
- Flat colors, minimal shading, no gradients on objects
- Educational poster quality, immediately understandable

COLOR PALETTE (Strictly Follow):
- Background: Light gray (#E5E5E5) or light blue (#D8E8F5)
- Safety helmet: Yellow (#FFD700) - ALWAYS yellow
- Worker clothing: Blue (#4A90E2) or Gray (#7F8C8D)
- Danger markers: Red (#FF0000) star bursts
- Impact effects: White (#FFFFFF) cloud puffs
- Structures: Gray tones (#95A5A6, #BDC3C7)

CHARACTER DESIGN:
- Slightly cartoonish proportions (head 1:6 body ratio)
- Simple facial features (2 dots for eyes, line for mouth)
- Mitten-style hands (no individual fingers)
- Visible emotion appropriate to incident

HAZARD VISUALIZATION:
- Red star burst (⭐) at impact/contact points
- White cloud motion effects (☁️) showing movement
- Dotted arc lines for falling trajectories
- Bold outlines around all danger elements

COMPOSITION:
- Single focal point at hazard moment
- 2-3 depth layers maximum
- Simplified background (basic shapes only)
- Clear cause-and-effect relationship

STRICT REQUIREMENTS:
- Bold black outlines around ALL objects
- NO photo-realistic rendering
- NO complex shadows or lighting
- NO text, labels, or Korean characters
- NO detailed facial features
- NO busy backgrounds
- Educational clarity over artistic detail
`.trim();

/**
 * Generate detailed English prompt for AI image generation
 * Uses AI-generated scene description with KOSHA style guide
 */
async function generateImagePrompt(input: OPSInput, env: Env): Promise<string> {
  // Try AI-generated scene description first
  if (env.GEMINI_API_KEY) {
    const aiScene = await generateSceneDescriptionWithAI(input, env);
    if (aiScene) {
      // Use AI-generated description with strict style enforcement
      return `${KOSHA_STYLE_GUIDE}

SPECIFIC SCENE (from incident analysis):
${aiScene}

FINAL RENDERING REQUIREMENTS:
- Follow KOSHA style guide exactly (see above)
- Render as educational safety manual illustration
- Bold black outlines, flat colors, simple shapes
- Yellow helmet, blue/gray clothing, white impact clouds
- Red star at hazard point
- NO text whatsoever`.trim();
    }
  }

  // Fallback to template-based prompt with style guide
  return generateImagePromptFallback(input);
}

/**
 * Fallback: Template-based prompt generation
 */
function generateImagePromptFallback(input: OPSInput): string {
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

  // Extract location context
  const locationContext = input.location?.includes('건설') || input.location?.includes('현장')
    ? 'construction site'
    : input.location?.includes('공장') || input.location?.includes('시설')
    ? 'industrial facility'
    : 'workplace';

  // Build detailed prompt with KOSHA style guide
  const prompt = `${KOSHA_STYLE_GUIDE}

SPECIFIC INCIDENT:
Type: ${incidentTypeDesc}
Location: ${locationContext}
Scenario: ${translatedCause}

SCENE COMPOSITION:
- Worker wearing yellow safety helmet and ${locationContext === 'construction site' ? 'blue' : 'gray'} work clothes
- ${translatedCause}
- Side view or isometric 3/4 angle
- Simplified ${locationContext} background
- Red star burst at hazard/impact point
- White cloud motion effects

${normalizedType.includes('fall') || normalizedType.includes('추락') ? 'FALL ELEMENTS: Worker in mid-fall, arms out, dotted fall trajectory, scaffolding/ladder visible' : ''}
${normalizedType.includes('chemical') || normalizedType.includes('화학') ? 'CHEMICAL ELEMENTS: Wavy vapor lines, protective gear, container source visible' : ''}

STYLE CHECKLIST:
✓ Bold black outlines (2-3px)
✓ Flat colors, no gradients
✓ Yellow helmet visible
✓ Simple cartoon style
✓ NO text whatsoever

PRIORITY: ${translatedCause}`.trim().replace(/\s+/g, ' ');

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
    const prompt = await generateImagePrompt(input, env);

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
