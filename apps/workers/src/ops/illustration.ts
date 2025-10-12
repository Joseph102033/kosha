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
 * Generate detailed English prompt for AI image generation
 * Uses AI-generated scene description or falls back to template
 */
async function generateImagePrompt(input: OPSInput, env: Env): Promise<string> {
  // Try AI-generated scene description first
  if (env.GEMINI_API_KEY) {
    const aiScene = await generateSceneDescriptionWithAI(input, env);
    if (aiScene) {
      // Use AI-generated description
      return `${aiScene}

STANDARDS COMPLIANCE:
- Korean industrial safety (KOSHA) manual illustration style
- Technical accuracy for safety training materials
- Suitable for professional safety documentation and reports

AVOID: Cartoonish style, blurry details, pixelated rendering, amateur sketch, overly dramatic or horror-style imagery.`.trim();
    }
  }

  // Fallback to template-based prompt
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

  // Build detailed prompt with actual incident details
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
    - Hazard zones: Danger areas marked with safety tape and barriers (no text labels)
    - Visual markers: Color coding only, NO text, NO written signs, NO Korean characters, NO English text

    LIGHTING & RENDERING:
    - Studio lighting with clear shadows for depth perception
    - Highlights on metallic safety equipment
    - Professional technical manual illustration quality

    STANDARDS COMPLIANCE:
    - Korean industrial safety (KOSHA) manual illustration style
    - Technical accuracy for safety training materials
    - Suitable for professional safety documentation and reports

    AVOID: Cartoonish style, blurry details, pixelated rendering, amateur sketch, overly dramatic or horror-style imagery, ANY text labels, ANY written characters, ANY signs with text, ANY measurement numbers.

    STRICT REQUIREMENTS:
    - NO text of any kind in the image
    - NO Korean characters or English letters
    - NO warning signs with text
    - NO labels or annotations
    - ONLY visual elements (shapes, colors, objects)

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
