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
  const prompt = `당신은 산업안전보건 법령 전문가입니다. 다음 재해 정보를 분석하여 관련 법령을 찾기 위한 **핵심 키워드만** 추출하세요.

**재해 정보:**
- 재해 유형: ${incidentType}
- 재해 개요: ${incidentCause}
${agentObject ? `- 가해물: ${agentObject}` : ''}
${hazardObject ? `- 위험물: ${hazardObject}` : ''}

**키워드 추출 요구사항:**

1. **재해 유형과 직접 관련된 구체적인 키워드만 추출** (3-5개)
   - ✅ 좋은 예: "협착", "컨베이어", "끼임", "방호장치", "비상정지"
   - ✅ 좋은 예: "추락", "안전난간", "개구부", "안전대", "추락방지망"
   - ✅ 좋은 예: "감전", "전기", "절연", "접지", "누전차단기"

2. **다음 일반적인 키워드는 절대 사용 금지** (너무 광범위하여 관련 없는 법령 다수 매칭):
   - ❌ 제외: "일반", "작업장", "보호구", "조명", "환기", "비상구"
   - ❌ 제외: 너무 넓은 개념의 키워드

3. **재해 유형별 핵심 키워드 예시:**
   - 추락: "추락", "안전난간", "개구부", "추락방지망", "안전대"
   - 협착/끼임: "협착", "끼임", "방호장치", "컨베이어", "롤러", "비상정지"
   - 감전: "감전", "전기", "절연", "접지", "누전차단기", "활선작업"
   - 화재: "화재", "폭발", "인화성", "소화설비", "방화구획"
   - 화학물질: "화학물질", "MSDS", "환기설비", "보호장갑", "세척시설"

4. **반드시 한글 키워드만 사용** (영문 사용 금지)

5. **설비/장비 이름이 명확하면 반드시 포함** (예: 컨베이어, 사다리, 비계, 크레인 등)

**출력 형식 (JSON):**
\`\`\`json
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
\`\`\``;

  const response = await callGemini(prompt, env, {
    temperature: 0.2, // Lower temperature for more focused keywords
    maxOutputTokens: 4096,
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

  // Filter out excluded keywords (일반적인 키워드 제거)
  const excludedKeywords = ['일반', '작업장', '보호구', '조명', '환기', '비상구', '소음'];
  const filtered = parsed.keywords.filter(kw => !excludedKeywords.includes(kw));

  return filtered.slice(0, 5);
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

  // Extract keywords from hazard object (구체적인 설비/장비 이름 우선)
  if (hazard.includes('컨베이어') || hazard.includes('conveyor')) keywords.push('컨베이어', '협착');
  if (hazard.includes('사다리') || hazard.includes('ladder')) keywords.push('추락', '사다리');
  if (hazard.includes('scaffold') || hazard.includes('비계')) keywords.push('추락', '비계');
  if (hazard.includes('크레인') || hazard.includes('crane')) keywords.push('낙하물', '크레인');
  if (hazard.includes('height') || hazard.includes('높이')) keywords.push('추락');
  if (hazard.includes('opening') || hazard.includes('개구부')) keywords.push('추락', '개구부');
  if (hazard.includes('machine') || hazard.includes('기계')) keywords.push('기계', '협착');
  if (hazard.includes('electric') || hazard.includes('전기')) keywords.push('감전', '전기');
  if (hazard.includes('화학') || hazard.includes('chemical')) keywords.push('화학물질');
  if (hazard.includes('밀폐') || hazard.includes('confined')) keywords.push('밀폐공간');

  // Remove duplicates and excluded keywords
  const excludedKeywords = ['일반', '작업장', '보호구', '조명', '환기', '비상구', '소음'];
  const unique = [...new Set(keywords)];
  return unique.filter(kw => !excludedKeywords.includes(kw));
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
    // Query D1 for matching law rules with relevance scoring
    if (keywords.length > 0) {
      console.log('🔍 Searching laws with keywords:', keywords);

      const placeholders = keywords.map(() => '?').join(',');

      // Build CASE statements for title matching bonus
      const titleMatchConditions = keywords.map(kw =>
        `WHEN law_title LIKE '%${kw}%' THEN 50`
      ).join(' ');

      // SQL query with relevance scoring
      const sql = `
        SELECT
          law_title,
          url,
          article_text,
          (
            -- Base score: keyword match
            (SELECT COUNT(*) FROM law_rules AS lr2 WHERE lr2.law_title = law_rules.law_title AND lr2.keyword IN (${placeholders})) * 10
            +
            -- Bonus: title contains keyword
            CASE ${titleMatchConditions} ELSE 0 END
          ) as relevance_score
        FROM law_rules
        WHERE keyword IN (${placeholders})
        GROUP BY law_title, url, article_text
        ORDER BY relevance_score DESC, law_title ASC
      `;

      const query = await env.DB.prepare(sql)
        .bind(...keywords, ...keywords)
        .all<{ law_title: string; url: string; article_text: string | null; relevance_score: number }>();

      if (query.results && query.results.length > 0) {
        console.log(`✅ Found ${query.results.length} laws, top 5 scores:`,
          query.results.slice(0, 5).map(r => ({ title: r.law_title.substring(0, 40), score: r.relevance_score }))
        );

        query.results.forEach(row => {
          laws.push({
            title: row.law_title,
            url: row.url,
            article_text: row.article_text || undefined,
          });
        });
      } else {
        console.log('⚠️ No laws found with keywords:', keywords);
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
