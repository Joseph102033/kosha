/**
 * Law Matching Engine
 * AI-powered keyword extraction + D1-based matching
 */

import type { LawReference } from '../ops/models';
import type { Env } from '../index';
import { callGemini, parseGeminiJSON } from '../ai/gemini';

/**
 * Extract relevant keywords from incident details using AI
 */
async function extractKeywordsWithAI(
  incidentType: string,
  incidentCause: string,
  agentObject: string | undefined,
  hazardObject: string | undefined,
  env: Env
): Promise<string[]> {
  const prompt = `당신은 산업안전보건 법령 전문가입니다. 다음 재해 정보를 분석하여 관련 법령을 찾기 위한 핵심 키워드를 추출하세요.

**재해 정보:**
- 재해 유형: ${incidentType}
- 재해 개요: ${incidentCause}
${agentObject ? `- 가해물: ${agentObject}` : ''}
${hazardObject ? `- 위험물: ${hazardObject}` : ''}

**키워드 추출 요구사항:**

1. 다음 카테고리의 **한글 키워드**를 추출하세요:
   - 재해 유형 키워드 (예: 추락, 협착, 감전, 화재, 전도, 낙하물)
   - 작업 환경 키워드 (예: 작업장, 기계, 보호구, 비상구, 조명, 환기)
   - 위험 요소 키워드 (예: 화학물질, 분진, 고열, 소음, 밀폐공간)

2. **반드시 한글 키워드만 사용** (영문 사용 금지)
   - ✅ 좋은 예: "추락", "안전난간", "개구부", "안전대"
   - ❌ 나쁜 예: "fall", "scaffold", "harness"

3. 일반적이고 검색 가능한 키워드 사용 (너무 구체적이면 매칭 실패)
   - ✅ 좋은 예: "추락", "작업장", "기계"
   - ❌ 나쁜 예: "3층에서 추락"

4. 3-7개 키워드 추출

**사용 가능한 키워드 목록:**
- 재해 유형: 추락, 협착, 감전, 화재, 전도, 낙하물
- 작업장: 작업장, 기계, 보호구, 비상구, 조명, 환기
- 위험 요소: 화학물질, 분진, 고열, 소음, 밀폐공간

**출력 형식 (JSON):**
\`\`\`json
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}
\`\`\``;

  const response = await callGemini(prompt, env, {
    temperature: 0.3, // Low temperature for consistent keyword extraction
    maxOutputTokens: 4096, // Increased to handle thinking tokens (Gemini 2.5 Flash uses up to 2047 thinking tokens)
  });

  if (!response) {
    console.error('Gemini API failed for keyword extraction');
    return [];
  }

  const parsed = parseGeminiJSON<{ keywords: string[] }>(response);

  if (!parsed || !parsed.keywords || !Array.isArray(parsed.keywords)) {
    console.error('Failed to parse Gemini keywords');
    return [];
  }

  return parsed.keywords.slice(0, 7);
}

/**
 * Fallback keyword extraction (rule-based)
 */
function extractKeywordsFallback(
  incidentType: string,
  agentObject: string | undefined,
  hazardObject: string | undefined
): string[] {
  const keywords: string[] = [];
  const type = incidentType.toLowerCase();
  const agent = agentObject?.toLowerCase() || '';
  const hazard = hazardObject?.toLowerCase() || '';

  // Extract keywords from incident type (한글 키워드)
  if (type.includes('fall') || type.includes('추락')) keywords.push('추락');
  if (type.includes('chemical') || type.includes('화학')) keywords.push('화학물질');
  if (type.includes('fire') || type.includes('화재')) keywords.push('화재');
  if (type.includes('explosion') || type.includes('폭발')) keywords.push('화재'); // 화재와 폭발은 같은 카테고리
  if (type.includes('협착') || type.includes('caught')) keywords.push('협착');
  if (type.includes('감전') || type.includes('electric')) keywords.push('감전');
  if (type.includes('전도') || type.includes('slip')) keywords.push('전도');
  if (type.includes('낙하') || type.includes('falling')) keywords.push('낙하물');

  // Extract keywords from hazard object
  if (hazard.includes('scaffold') || hazard.includes('비계')) keywords.push('추락', '작업장');
  if (hazard.includes('height') || hazard.includes('높이')) keywords.push('추락');
  if (hazard.includes('opening') || hazard.includes('개구부')) keywords.push('추락');
  if (hazard.includes('machine') || hazard.includes('기계')) keywords.push('기계', '협착');
  if (hazard.includes('electric') || hazard.includes('전기')) keywords.push('감전');
  if (hazard.includes('화학') || hazard.includes('chemical')) keywords.push('화학물질');
  if (hazard.includes('안전대') || hazard.includes('harness')) keywords.push('보호구', '추락');
  if (hazard.includes('밀폐') || hazard.includes('confined')) keywords.push('밀폐공간');

  // Remove duplicates
  return [...new Set(keywords)];
}

/**
 * Match laws from D1 database based on incident details
 * Uses AI-powered keyword extraction + D1 query
 */
export async function matchLaws(
  incidentType: string,
  agentObject: string | undefined,
  hazardObject: string | undefined,
  env: Env,
  incidentCause?: string
): Promise<LawReference[]> {
  const laws: LawReference[] = [];

  // Try AI-powered keyword extraction first
  let keywords: string[] = [];
  if (incidentCause && env.GEMINI_API_KEY) {
    keywords = await extractKeywordsWithAI(incidentType, incidentCause, agentObject, hazardObject, env);
  }

  // Fallback to rule-based if AI fails or no API key
  if (keywords.length === 0) {
    keywords = extractKeywordsFallback(incidentType, agentObject, hazardObject);
  }

  try {
    // Query D1 for matching law rules
    if (keywords.length > 0) {
      const placeholders = keywords.map(() => '?').join(',');
      const query = await env.DB.prepare(
        `SELECT DISTINCT law_title, url FROM law_rules WHERE keyword IN (${placeholders})`
      )
        .bind(...keywords)
        .all<{ law_title: string; url: string }>();

      if (query.results && query.results.length > 0) {
        query.results.forEach(row => {
          laws.push({
            title: row.law_title,
            url: row.url,
          });
        });
      }
    }
  } catch (error) {
    console.error('Error querying law rules from D1:', error);
  }

  // Fallback to hardcoded rules if no matches found
  if (laws.length === 0) {
    const type = incidentType.toLowerCase();
    const hazard = hazardObject?.toLowerCase() || '';

    if (type.includes('fall') || type.includes('추락') || hazard.includes('scaffold') || hazard.includes('height')) {
      laws.push({
        title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsId=001766#산업안전보건법',
      });
    } else if (type.includes('chemical') || type.includes('화학') || type.includes('toxic') || type.includes('spill')) {
      laws.push({
        title: '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsId=001766#산업안전보건법',
      });
    } else if (type.includes('fire') || type.includes('화재') || type.includes('explosion') || type.includes('폭발')) {
      laws.push({
        title: '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsId=001766#산업안전보건법',
      });
    } else {
      // Generic fallback
      laws.push({
        title: '산업안전보건법 제38조 (안전조치)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsId=001766#산업안전보건법',
      });
    }
  }

  // Remove duplicates
  const unique = laws.filter((law, index, self) =>
    index === self.findIndex(l => l.title === law.title)
  );

  // Limit to 10 laws to comply with Gemini API validation
  // (Gemini expects laws array to have <=10 items for image generation)
  return unique.slice(0, 10);
}
