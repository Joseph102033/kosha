/**
 * OPS Composer - Generates OPS document sections
 * AI-powered analysis using Google Gemini 2.5 Flash
 */

import type { OPSInput, OPSDocument, LawReference } from './models';
import type { Env } from '../index';
import { callGemini, parseGeminiJSON } from '../ai/gemini';

/**
 * Convert incident type to Korean
 */
function getIncidentTypeKorean(incidentType: string): string {
  const typeMap: Record<string, string> = {
    'fall': '추락',
    'chemical spill': '화학물질 누출',
    'fire': '화재',
    'explosion': '폭발',
    'equipment failure': '장비 고장',
    'other': '기타',
  };

  const normalized = incidentType.toLowerCase().trim();
  return typeMap[normalized] || incidentType;
}

/**
 * Generate a summary (4-6 lines) based on incident input
 */
export function generateSummary(input: OPSInput): string {
  const lines: string[] = [];

  // Line 1: Incident type and date
  const date = new Date(input.incidentDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const incidentTypeKR = getIncidentTypeKorean(input.incidentType);
  lines.push(`${date}에 ${incidentTypeKR} 재해가 발생했습니다.`);

  // Line 2: Location
  lines.push(`장소: ${input.location}`);

  // Line 3: Objects involved (if any)
  if (input.agentObject || input.hazardObject) {
    const objects = [input.agentObject, input.hazardObject].filter(Boolean).join(' 및 ');
    lines.push(`관련: ${objects}`);
  }

  // Line 4: Primary cause
  lines.push(`주요 원인: ${input.incidentCause}`);

  // Line 5: Severity assessment (generic)
  lines.push(`이 재해는 즉각적인 조사와 예방 조치가 필요합니다.`);

  // Line 6: Action required (if less than 6 lines)
  if (lines.length < 6) {
    lines.push(`모든 관련 이해관계자는 이 OPS 자료를 검토해야 합니다.`);
  }

  return lines.join('\n');
}

/**
 * AI-powered cause analysis using Gemini
 * Analyzes actual incident details to extract specific causes
 */
export async function extractCausesWithAI(
  input: OPSInput,
  env: Env
): Promise<{ direct: string[]; indirect: string[] }> {
  const prompt = `당신은 산업안전보건 전문가입니다. 다음 재해 정보를 분석하여 구체적인 직접 원인과 간접 원인을 도출하세요.

**재해 정보:**
- 재해 유형: ${input.incidentType}
- 발생 장소: ${input.location}
- 재해 개요: ${input.incidentCause}
${input.agentObject ? `- 가해물: ${input.agentObject}` : ''}
${input.hazardObject ? `- 위험물: ${input.hazardObject}` : ''}

**분석 요구사항:**

1. **직접 원인 (Direct Causes)**: 재해를 직접적으로 발생시킨 즉각적인 원인 3개를 도출하세요.
   - 재해 개요에 명시된 구체적인 상황을 반영
   - 일반적이지 않고 이 사고에 특화된 원인
   - 예: "안전벨트 미착용" (구체적) > "부적절한 안전 조치" (일반적)

2. **간접 원인 (Indirect Causes)**: 직접 원인을 야기한 근본 원인 4개를 도출하세요.
   - 시스템, 관리, 교육, 문화적 요인
   - 재발 방지를 위해 개선해야 할 근본 문제
   - 예: "고위험 작업 안전 교육 부재", "안전 장비 점검 체계 미비"

**출력 형식 (JSON):**
\`\`\`json
{
  "direct": [
    "구체적인 직접 원인 1",
    "구체적인 직접 원인 2",
    "구체적인 직접 원인 3"
  ],
  "indirect": [
    "근본 원인 1",
    "근본 원인 2",
    "근본 원인 3",
    "근본 원인 4"
  ]
}
\`\`\`

**중요**: 반드시 재해 개요(${input.incidentCause})의 내용을 반영하여 구체적이고 실행 가능한 원인을 작성하세요.`;

  const response = await callGemini(prompt, env, {
    temperature: 0.5, // Lower temperature for more consistent analysis
    maxOutputTokens: 1024,
  });

  if (!response) {
    console.error('Gemini API failed for cause analysis, using fallback');
    return extractCausesFallback(input);
  }

  const parsed = parseGeminiJSON<{ direct: string[]; indirect: string[] }>(response);

  if (!parsed || !parsed.direct || !parsed.indirect) {
    console.error('Failed to parse Gemini causes, using fallback');
    return extractCausesFallback(input);
  }

  // Validate array lengths
  if (parsed.direct.length < 2 || parsed.indirect.length < 2) {
    console.error('Insufficient causes from Gemini, using fallback');
    return extractCausesFallback(input);
  }

  return {
    direct: parsed.direct.slice(0, 3),
    indirect: parsed.indirect.slice(0, 4),
  };
}

/**
 * Fallback cause extraction (rule-based) when AI fails
 */
function extractCausesFallback(input: OPSInput): { direct: string[]; indirect: string[] } {
  const directCauses: string[] = [];
  const indirectCauses: string[] = [];

  const type = input.incidentType.toLowerCase();

  if (type.includes('fall') || type.includes('추락')) {
    directCauses.push('부적절한 추락 방지 조치');
    directCauses.push('안전장비 미착용 또는 부적절한 사용');
    directCauses.push('작업발판 및 안전난간 미설치');
    indirectCauses.push('불충분한 안전 교육 또는 인식');
    indirectCauses.push('정기적인 안전 장비 점검 부족');
    indirectCauses.push('고위험 작업에 대한 부적절한 감독');
    indirectCauses.push('부적절한 위험성 평가 절차');
  } else if (type.includes('chemical') || type.includes('화학')) {
    directCauses.push('부적절한 화학물질 저장 또는 취급');
    directCauses.push('개인보호구 미착용');
    directCauses.push('물질안전보건자료(MSDS) 미비치 또는 미확인');
    indirectCauses.push('불충분한 안전 교육 또는 인식');
    indirectCauses.push('물질안전보건자료(MSDS) 누락 또는 구버전 사용');
    indirectCauses.push('환기 시스템 유지보수 부족');
    indirectCauses.push('부적절한 위험성 평가 절차');
  } else {
    directCauses.push('안전 작업 절차 미준수');
    directCauses.push('작업 전 위험성 평가 미실시');
    directCauses.push('부적절한 작업 환경 관리');
    indirectCauses.push('불충분한 안전 교육 또는 인식');
    indirectCauses.push('부적절한 위험성 평가 절차');
    indirectCauses.push('표준 작업 절차의 미비점');
    indirectCauses.push('안전 관리 감독 체계 부족');
  }

  return {
    direct: directCauses.slice(0, 3),
    indirect: indirectCauses.slice(0, 4),
  };
}

/**
 * AI-powered prevention checklist generation
 * Creates specific, actionable checklist items based on incident details
 */
export async function generateChecklistWithAI(
  input: OPSInput,
  env: Env
): Promise<string[]> {
  const prompt = `당신은 산업안전보건 전문가입니다. 다음 재해 정보를 기반으로 구체적이고 실행 가능한 사고 예방 체크리스트를 작성하세요.

**재해 정보:**
- 재해 유형: ${input.incidentType}
- 발생 장소: ${input.location}
- 재해 개요: ${input.incidentCause}
${input.agentObject ? `- 가해물: ${input.agentObject}` : ''}
${input.hazardObject ? `- 위험물: ${input.hazardObject}` : ''}

**체크리스트 작성 요구사항:**

1. **구체성**: 재해 개요의 내용을 직접 반영한 구체적인 항목
   - 나쁜 예: "안전 교육 실시" (너무 일반적)
   - 좋은 예: "고소 작업 시 안전벨트 착용 방법 실습 교육 실시" (구체적)

2. **실행 가능성**: 현장에서 즉시 확인하고 실행할 수 있는 항목
   - 확인 가능한 조건 (예: "~되어 있는지 확인", "~를 점검")
   - 측정 가능한 기준 (예: "~mm 이상", "~개 설치")

3. **순서**: 작업 전 → 작업 중 → 작업 후 순서로 구성

4. **개수**: 6-10개 항목

**출력 형식 (JSON):**
\`\`\`json
{
  "checklist": [
    "구체적이고 실행 가능한 체크리스트 항목 1",
    "구체적이고 실행 가능한 체크리스트 항목 2",
    "...",
    "구체적이고 실행 가능한 체크리스트 항목 6-10"
  ]
}
\`\`\`

**중요**: 반드시 재해 개요(${input.incidentCause})에서 발생한 구체적인 상황을 반영하세요.`;

  const response = await callGemini(prompt, env, {
    temperature: 0.6,
    maxOutputTokens: 1024,
  });

  if (!response) {
    console.error('Gemini API failed for checklist, using fallback');
    return generateChecklistFallback(input);
  }

  const parsed = parseGeminiJSON<{ checklist: string[] }>(response);

  if (!parsed || !parsed.checklist || !Array.isArray(parsed.checklist)) {
    console.error('Failed to parse Gemini checklist, using fallback');
    return generateChecklistFallback(input);
  }

  // Validate checklist length
  if (parsed.checklist.length < 4) {
    console.error('Insufficient checklist items from Gemini, using fallback');
    return generateChecklistFallback(input);
  }

  return parsed.checklist.slice(0, 10);
}

/**
 * Fallback checklist generation (rule-based) when AI fails
 */
function generateChecklistFallback(input: OPSInput): string[] {
  const checklist: string[] = [];

  // Universal safety checks
  checklist.push('작업 시작 전 종합적인 위험성 평가 실시');
  checklist.push('모든 근로자가 필수 안전 교육을 이수했는지 확인');
  checklist.push('모든 안전 장비가 사용 가능하고 양호한 상태인지 확인');
  checklist.push('비상 상황을 위한 명확한 의사소통 체계 구축');

  const type = input.incidentType.toLowerCase();

  if (type.includes('fall') || type.includes('추락')) {
    checklist.push('모든 추락 방지 시스템 및 고정점 점검');
    checklist.push('개인 추락방지시스템의 적절한 사용 확인');
    checklist.push('안전난간 및 안전장벽이 안전하게 설치되었는지 확인');
    checklist.push('높은 곳 작업 구역의 적절한 조명 확보');
  } else if (type.includes('chemical') || type.includes('화학')) {
    checklist.push('모든 근로자와 물질안전보건자료(MSDS) 검토');
    checklist.push('적절한 개인보호구 착용 확인');
    checklist.push('화학물질 저장 용기의 라벨 부착 확인');
    checklist.push('환기 시스템 작동 상태 확인');
  } else {
    checklist.push('모든 팀원과 표준 작업 절차 검토');
    checklist.push('작업 구역의 잠재적 위험 요소 점검');
    checklist.push('비상 대피 경로 설정');
    checklist.push('고위험 작업을 위한 전담 안전 관찰자 지정');
  }

  return checklist.slice(0, 10);
}

/**
 * Compose full OPS document from input
 * Uses AI for cause analysis and checklist generation
 */
export async function composeOPS(
  input: OPSInput,
  laws: LawReference[],
  env: Env
): Promise<OPSDocument> {
  // Run AI analyses in parallel
  const [causes, checklist] = await Promise.all([
    extractCausesWithAI(input, env),
    generateChecklistWithAI(input, env),
  ]);

  return {
    summary: generateSummary(input),
    causes,
    checklist,
    laws,
    imageMeta: {
      type: 'placeholder',
    },
  };
}
