/**
 * Demo samples for Safe OPS Studio
 * Based on real accident cases from KOSHA (Korea Occupational Safety and Health Agency)
 */

import type { OPSFormData } from './schemas/ops';

export interface DemoSample {
  id: string;
  label: string;
  description: string;
  icon: string;
  formData: OPSFormData;
}

export const demoSamples: DemoSample[] = [
  {
    id: 'fall-ladder',
    label: '추락 사례',
    description: '사다리 작업 중 추락 재해',
    icon: '🪜',
    formData: {
      title: '사다리 작업 중 추락 사망사고',
      incidentDate: '2024-03-15T14:30:00',
      location: '서울특별시 강남구 테헤란로 OO빌딩',
      agentObject: '시설 관리 근로자',
      hazardObject: 'A형 사다리 (높이 3m)',
      incidentType: 'Fall',
      incidentCause: '작업자가 3m 높이의 A형 사다리에서 천장 조명 교체 작업 중 사다리가 미끄러지며 추락하여 사망함. 사다리 하단 고정 장치 미사용, 안전모 미착용 상태였음.',
    },
  },
  {
    id: 'fire-welding',
    label: '화재 사례',
    description: '용접 작업 중 화재 재해',
    icon: '🔥',
    formData: {
      title: '용접 작업 중 화재 사고',
      incidentDate: '2024-06-22T10:15:00',
      location: '경기도 평택시 OO공장 제1작업장',
      agentObject: '용접 작업자',
      hazardObject: '가스 용접기',
      incidentType: 'Fire',
      incidentCause: '작업자가 철골 구조물 용접 작업 중 불티가 주변에 적재된 스티로폼 포장재에 튀어 화재가 발생함. 소화기 미비치, 인화성 물질 정리 미흡 상태였음.',
    },
  },
  {
    id: 'caught-conveyor',
    label: '끼임 사례',
    description: '컨베이어 벨트 끼임 재해',
    icon: '⚙️',
    formData: {
      title: '컨베이어 벨트 끼임 사고',
      incidentDate: '2024-08-08T16:45:00',
      location: '인천광역시 남동구 OO물류센터',
      agentObject: '설비 정비원',
      hazardObject: '컨베이어 벨트 시스템',
      incidentType: 'Equipment Failure',
      incidentCause: '작업자가 가동 중인 컨베이어 벨트에 걸린 이물질을 제거하려다 장갑이 벨트와 롤러 사이에 말려 들어가 손가락이 끼임. 작업 전 전원 차단 미실시, 안전 덮개 미설치 상태였음.',
    },
  },
];

/**
 * Get a demo sample by ID
 */
export function getDemoSampleById(id: string): DemoSample | undefined {
  return demoSamples.find((sample) => sample.id === id);
}

/**
 * Get all demo sample IDs
 */
export function getDemoSampleIds(): string[] {
  return demoSamples.map((sample) => sample.id);
}
