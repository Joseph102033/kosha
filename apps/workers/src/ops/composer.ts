/**
 * OPS Composer - Generates OPS document sections
 * Rules-first approach with optional AI fallback
 */

import type { OPSInput, OPSDocument, LawReference } from './models';

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
  lines.push(`${date}에 ${input.incidentType} 재해가 발생했습니다.`);

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
 * Extract direct causes from incident data
 */
export function extractDirectCauses(input: OPSInput): string[] {
  const causes: string[] = [];

  // Primary cause from input
  causes.push(input.incidentCause);

  // Infer additional direct causes based on incident type
  const type = input.incidentType.toLowerCase();

  if (type.includes('fall') || type.includes('추락')) {
    causes.push('부적절한 추락 방지 조치');
    if (input.hazardObject?.toLowerCase().includes('scaffold') || input.hazardObject?.includes('비계')) {
      causes.push('비계 구조적 결함 또는 불안정');
    }
  } else if (type.includes('chemical') || type.includes('화학')) {
    causes.push('부적절한 화학물질 저장 또는 취급');
  } else if (type.includes('fire') || type.includes('explosion') || type.includes('화재') || type.includes('폭발')) {
    causes.push('인화성 물질에 점화원 노출');
  }

  return causes.slice(0, 3); // Limit to 3 direct causes
}

/**
 * Extract indirect causes (root causes)
 */
export function extractIndirectCauses(input: OPSInput): string[] {
  const causes: string[] = [];

  // Generic indirect causes
  causes.push('불충분한 안전 교육 또는 인식');
  causes.push('부적절한 위험성 평가 절차');

  // Type-specific indirect causes
  const type = input.incidentType.toLowerCase();

  if (type.includes('fall') || type.includes('추락')) {
    causes.push('정기적인 안전 장비 점검 부족');
    causes.push('고위험 작업에 대한 부적절한 감독');
  } else if (type.includes('chemical') || type.includes('화학')) {
    causes.push('물질안전보건자료(MSDS) 누락 또는 구버전 사용');
    causes.push('환기 시스템 유지보수 부족');
  } else {
    causes.push('표준 작업 절차의 미비점');
  }

  return causes.slice(0, 4); // Limit to 4 indirect causes
}

/**
 * Generate prevention checklist (6-10 items)
 */
export function generateChecklist(input: OPSInput): string[] {
  const checklist: string[] = [];

  // Universal safety checks
  checklist.push('작업 시작 전 종합적인 위험성 평가 실시');
  checklist.push('모든 근로자가 필수 안전 교육을 이수했는지 확인');
  checklist.push('모든 안전 장비가 사용 가능하고 양호한 상태인지 확인');
  checklist.push('비상 상황을 위한 명확한 의사소통 체계 구축');

  // Type-specific checks
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

  // Limit to 6-10 items
  return checklist.slice(0, 10);
}

/**
 * Compose full OPS document from input
 */
export function composeOPS(input: OPSInput, laws: LawReference[]): OPSDocument {
  return {
    summary: generateSummary(input),
    causes: {
      direct: extractDirectCauses(input),
      indirect: extractIndirectCauses(input),
    },
    checklist: generateChecklist(input),
    laws,
    imageMeta: {
      type: 'placeholder',
    },
  };
}
