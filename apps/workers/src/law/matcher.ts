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

1. 다음 카테고리의 키워드를 추출하세요:
   - 재해 유형 키워드 (예: fall, chemical, fire, explosion, equipment)
   - 작업 환경 키워드 (예: scaffold, height, confined_space, machinery)
   - 위험 요소 키워드 (예: electricity, toxic, hot_work, lifting)
   - 안전 장비 키워드 (예: harness, ppe, guard, ventilation)

2. 영문 키워드로 추출 (한글 키워드는 영문으로 변환)
   - 추락 → fall
   - 화학물질 → chemical
   - 비계 → scaffold
   - 안전벨트 → harness

3. 일반적이고 검색 가능한 키워드 사용 (너무 구체적이면 매칭 실패)
   - 좋은 예: "fall", "height", "scaffold"
   - 나쁜 예: "worker_fell_from_third_floor"

4. 3-7개 키워드 추출

**출력 형식 (JSON):**
\`\`\`json
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}
\`\`\``;

  const response = await callGemini(prompt, env, {
    temperature: 0.3, // Low temperature for consistent keyword extraction
    maxOutputTokens: 512,
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

  // Extract keywords from incident type
  if (type.includes('fall') || type.includes('추락')) keywords.push('fall');
  if (type.includes('chemical') || type.includes('화학')) keywords.push('chemical');
  if (type.includes('fire') || type.includes('화재')) keywords.push('fire');
  if (type.includes('explosion') || type.includes('폭발')) keywords.push('explosion');
  if (type.includes('spill') || type.includes('누출')) keywords.push('spill');
  if (type.includes('equipment') || type.includes('장비')) keywords.push('equipment');

  // Extract keywords from hazard object
  if (hazard.includes('scaffold') || hazard.includes('비계')) keywords.push('scaffold');
  if (hazard.includes('height') || hazard.includes('높이')) keywords.push('height');
  if (hazard.includes('opening') || hazard.includes('개구부')) keywords.push('opening');
  if (hazard.includes('machine') || hazard.includes('기계')) keywords.push('machinery');
  if (hazard.includes('electric') || hazard.includes('전기')) keywords.push('electricity');

  return keywords;
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
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else if (type.includes('chemical') || type.includes('화학') || type.includes('toxic') || type.includes('spill')) {
      laws.push({
        title: '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else if (type.includes('fire') || type.includes('화재') || type.includes('explosion') || type.includes('폭발')) {
      laws.push({
        title: '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else {
      // Generic fallback
      laws.push({
        title: '산업안전보건법 제38조 (안전조치)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    }
  }

  // Remove duplicates
  const unique = laws.filter((law, index, self) =>
    index === self.findIndex(l => l.title === law.title)
  );

  return unique;
}
