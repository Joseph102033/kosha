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
  console.log('🔍 Starting cause analysis with Gemini AI...');

  if (!env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY not configured, using fallback');
    return extractCausesFallback(input);
  }

  const prompt = `당신은 산업안전보건 전문가입니다. 다음 재해 정보를 분석하여 구체적인 직접 원인과 간접 원인을 도출하세요.

**재해 정보:**
- 재해 유형: ${input.incidentType}
- 발생 장소: ${input.location}
- 재해 개요: ${input.incidentCause}
${input.agentObject ? `- 가해물: ${input.agentObject}` : ''}
${input.hazardObject ? `- 위험물: ${input.hazardObject}` : ''}

**분석 요구사항:**

1. **직접 원인 (Direct Causes)**: 재해를 직접적으로 발생시킨 즉각적인 원인 3개를 도출하세요.
   - **필수**: 재해 개요에 명시된 구체적인 행동, 물건, 상황을 그대로 반영
   - **금지**: 일반적인 표현 사용 금지 (예: "부적절한~", "불충분한~")
   - **예시**:
     - ❌ "부적절한 사다리 사용" → ✅ "A형 사다리를 고정하지 않고 사용"
     - ❌ "안전장비 미착용" → ✅ "안전벨트 및 안전모 미착용"
     - ❌ "작업발판 미설치" → ✅ "3m 높이 작업에 비계 대신 이동식 사다리 사용"

2. **간접 원인 (Indirect Causes)**: 직접 원인을 야기한 근본 원인 4개를 도출하세요.
   - **구체적 시스템 결함**: "고소작업 안전교육 미실시 (최근 6개월 기준)"
   - **구체적 관리 결함**: "작업 전 도구 점검 절차 부재"
   - **구체적 감독 결함**: "관리감독자의 현장 안전점검 누락"
   - **일반적 표현 최소화**: "안전의식 부족" 같은 추상적 표현 지양

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

  console.log('🤖 Calling Gemini API for cause analysis...');
  const response = await callGemini(prompt, env, {
    temperature: 0.5, // Lower temperature for more consistent analysis
    maxOutputTokens: 1024,
  });

  if (!response) {
    console.error('❌ Gemini API failed for cause analysis, using fallback');
    return extractCausesFallback(input);
  }

  console.log('✅ Gemini response received for causes');
  const parsed = parseGeminiJSON<{ direct: string[]; indirect: string[] }>(response);

  if (!parsed || !parsed.direct || !parsed.indirect) {
    console.error('❌ Failed to parse Gemini causes, using fallback');
    return extractCausesFallback(input);
  }

  console.log('✅ Successfully parsed Gemini causes:', {
    directCount: parsed.direct.length,
    indirectCount: parsed.indirect.length,
  });

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
  console.log('🔍 Starting checklist generation with Gemini AI...');

  if (!env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY not configured, using fallback');
    return generateChecklistFallback(input);
  }

  const prompt = `당신은 산업안전보건 전문가입니다. 다음 재해 정보를 기반으로 구체적이고 실행 가능한 사고 예방 체크리스트를 작성하세요.

**재해 정보:**
- 재해 유형: ${input.incidentType}
- 발생 장소: ${input.location}
- 재해 개요: ${input.incidentCause}
${input.agentObject ? `- 가해물: ${input.agentObject}` : ''}
${input.hazardObject ? `- 위험물: ${input.hazardObject}` : ''}

**체크리스트 작성 요구사항:**

1. **최우선 핵심 조치사항** (상위 2-3개):
   - 재해 개요에 직접 언급된 위험 요소에 대한 구체적 대응책
   - **예시 (사다리 추락)**:
     - ✅ "A형 사다리 상단 및 하단에 전도방지 장치(아웃트리거) 설치 확인"
     - ✅ "2인 1조 작업: 1명은 사다리 하부 고정, 1명은 작업 수행"
     - ✅ "사다리 설치 각도 75도 확인 (경사계 사용)"
   - **금지**: "위험성 평가 실시", "안전 교육 실시" 같은 일반적 표현

2. **재해 유형별 필수 조치사항** (중간 3-4개):
   - 추락: 안전난간, 개인보호구, 작업발판 등
   - 화학물질: 환기, MSDS, 보호구 등
   - 낙하/비래: 낙하물 방지망, 출입통제 등

3. **일반 관리 조치사항** (하위 2-3개):
   - 작업 전 안전점검, 비상연락체계 등
   - 단, 구체적으로 작성 (예: "작업반장이 체크리스트로 10분 이상 점검")

4. **개수**: 총 7-10개 항목 (핵심 3개 + 필수 4개 + 일반 3개)

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

  console.log('🤖 Calling Gemini API for checklist generation...');
  const response = await callGemini(prompt, env, {
    temperature: 0.6,
    maxOutputTokens: 1024,
  });

  if (!response) {
    console.error('❌ Gemini API failed for checklist, using fallback');
    return generateChecklistFallback(input);
  }

  console.log('✅ Gemini response received for checklist');
  const parsed = parseGeminiJSON<{ checklist: string[] }>(response);

  if (!parsed || !parsed.checklist || !Array.isArray(parsed.checklist)) {
    console.error('❌ Failed to parse Gemini checklist, using fallback');
    return generateChecklistFallback(input);
  }

  // Validate checklist length
  if (parsed.checklist.length < 4) {
    console.error('❌ Insufficient checklist items from Gemini, using fallback');
    return generateChecklistFallback(input);
  }

  console.log('✅ Successfully generated checklist with', parsed.checklist.length, 'items');
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
