/**
 * Dummy OPS data generator
 * Provides fallback data when API is unavailable or form is incomplete
 */

import type { OPSDocument, OPSFormData } from './schemas/ops';

/**
 * Generate dummy OPS document based on partial form data
 * Used for skeleton → dummy → real data flow
 */
export function generateDummyOPS(formData: Partial<OPSFormData>): OPSDocument {
  const incidentType = formData.incidentType || '추락';
  const location = formData.location || '작업 현장';
  const date = formData.incidentDate
    ? new Date(formData.incidentDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '날짜 미지정';

  return {
    summary: `${date}에 ${incidentType} 재해가 발생했습니다.\n장소: ${location}\n주요 원인: ${
      formData.incidentCause?.slice(0, 50) || '원인 분석 중...'
    }\n이 재해는 즉각적인 조사와 예방 조치가 필요합니다.\n모든 관련 이해관계자는 이 OPS 자료를 검토해야 합니다.`,
    causes: {
      direct: generateDummyDirectCauses(incidentType),
      indirect: generateDummyIndirectCauses(incidentType),
    },
    checklist: generateDummyChecklist(incidentType),
    laws: generateDummyLaws(incidentType),
    imageMeta: {
      type: 'placeholder',
    },
  };
}

/**
 * Generate dummy direct causes based on incident type
 */
function generateDummyDirectCauses(incidentType: string): string[] {
  const type = incidentType.toLowerCase();

  if (type.includes('추락') || type.includes('fall')) {
    return [
      '작업발판 또는 안전난간 미설치',
      '안전벨트 및 개인보호구 미착용',
      '작업 중 부주의 또는 균형 상실',
    ];
  }

  if (type.includes('화학') || type.includes('chemical')) {
    return [
      '화학물질 용기 파손 또는 누출',
      '개인보호구(보호복, 마스크) 미착용',
      '물질안전보건자료(MSDS) 미확인',
    ];
  }

  if (type.includes('화재') || type.includes('fire')) {
    return [
      '인화성 물질 부적절한 보관',
      '화기 작업 시 안전 조치 미흡',
      '전기 설비 과부하 또는 노후화',
    ];
  }

  // Default generic causes
  return [
    '안전 작업 절차 미준수',
    '작업 전 위험성 평가 미실시',
    '부적절한 작업 환경 관리',
  ];
}

/**
 * Generate dummy indirect causes
 */
function generateDummyIndirectCauses(incidentType: string): string[] {
  return [
    '불충분한 안전 교육 또는 인식 부족',
    '부적절한 위험성 평가 절차',
    '정기적인 안전 장비 점검 미실시',
    '고위험 작업에 대한 관리감독 부족',
  ];
}

/**
 * Generate dummy checklist based on incident type
 */
function generateDummyChecklist(incidentType: string): string[] {
  const type = incidentType.toLowerCase();

  const universalItems = [
    '작업 시작 전 종합적인 위험성 평가 실시',
    '모든 근로자가 필수 안전 교육을 이수했는지 확인',
    '비상 상황을 위한 명확한 의사소통 체계 구축',
  ];

  let specificItems: string[] = [];

  if (type.includes('추락') || type.includes('fall')) {
    specificItems = [
      '모든 추락 방지 시스템 및 고정점 점검',
      '개인 추락방지시스템의 적절한 사용 확인',
      '안전난간 및 작업발판이 안전하게 설치되었는지 확인',
      '높은 곳 작업 구역의 적절한 조명 확보',
    ];
  } else if (type.includes('화학') || type.includes('chemical')) {
    specificItems = [
      '모든 근로자와 물질안전보건자료(MSDS) 검토',
      '적절한 개인보호구 착용 확인',
      '화학물질 저장 용기의 라벨 부착 확인',
      '환기 시스템 작동 상태 확인',
    ];
  } else {
    specificItems = [
      '모든 안전 장비가 사용 가능하고 양호한 상태인지 확인',
      '작업 구역의 잠재적 위험 요소 점검',
      '비상 대피 경로 설정',
      '고위험 작업을 위한 전담 안전 관찰자 지정',
    ];
  }

  return [...universalItems, ...specificItems];
}

/**
 * Generate dummy law references
 */
function generateDummyLaws(incidentType: string): Array<{ title: string; url: string }> {
  const type = incidentType.toLowerCase();

  if (type.includes('추락') || type.includes('fall')) {
    return [
      {
        title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234639#0000',
      },
      {
        title: '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234640#0000',
      },
    ];
  }

  if (type.includes('화학') || type.includes('chemical')) {
    return [
      {
        title: '산업안전보건법 제110조 (물질안전보건자료의 작성·제출)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234639#0000',
      },
      {
        title: '화학물질관리법 제14조 (화학물질 취급기준)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=227622#0000',
      },
    ];
  }

  // Default general safety laws
  return [
    {
      title: '산업안전보건법 제5조 (사업주의 의무)',
      url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234639#0000',
    },
    {
      title: '산업안전보건기준에 관한 규칙 제3조 (안전조치)',
      url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234640#0000',
    },
  ];
}

/**
 * Sample OPS document for testing (complete example)
 */
export const SAMPLE_OPS_DOCUMENT: OPSDocument = {
  summary: `2025년 1월 15일에 추락 재해가 발생했습니다.
장소: 서울시 강남구 건설현장 A동 3층
관련: 작업자 및 A형 사다리
주요 원인: 작업자가 A형 사다리를 고정하지 않고 사용하다가 사다리가 넘어지며 3m 높이에서 추락
이 재해는 즉각적인 조사와 예방 조치가 필요합니다.
모든 관련 이해관계자는 이 OPS 자료를 검토해야 합니다.`,
  causes: {
    direct: [
      'A형 사다리를 고정하지 않고 사용',
      '안전벨트 및 안전모 미착용',
      '3m 높이 작업에 비계 대신 이동식 사다리 사용',
    ],
    indirect: [
      '고소작업 안전교육 미실시 (최근 6개월 기준)',
      '작업 전 도구 점검 절차 부재',
      '관리감독자의 현장 안전점검 누락',
      '작업계획서 미작성 및 승인 절차 부재',
    ],
  },
  checklist: [
    '작업 시작 전 종합적인 위험성 평가 실시',
    '모든 근로자가 필수 안전 교육을 이수했는지 확인',
    '비상 상황을 위한 명확한 의사소통 체계 구축',
    'A형 사다리 상단 및 하단에 전도방지 장치(아웃트리거) 설치 확인',
    '2인 1조 작업: 1명은 사다리 하부 고정, 1명은 작업 수행',
    '사다리 설치 각도 75도 확인 (경사계 사용)',
    '개인 추락방지시스템(안전벨트, 안전고리) 착용 및 체결 확인',
    '높은 곳 작업 구역의 적절한 조명 확보',
  ],
  laws: [
    {
      title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
      url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234639#0000',
    },
    {
      title: '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)',
      url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234640#0000',
    },
    {
      title: '산업안전보건기준에 관한 규칙 제55조 (사다리식 통로 등의 구조)',
      url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=234640#0000',
    },
  ],
  imageMeta: {
    type: 'placeholder',
  },
};
