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
    id: 'fall-scaffolding',
    label: '추락 사례',
    description: '건설현장 비계 작업 중 추락 재해',
    icon: '🏗️',
    formData: {
      title: '건설현장 비계 작업 중 추락 사망사고',
      incidentDate: '2024-03-15T14:30:00',
      location: '서울특별시 강남구 테헤란로 건설현장 A동 3층',
      agentObject: '건설 근로자 (남, 42세, 경력 15년)',
      hazardObject: '강관 비계 (높이 12m)',
      incidentType: 'Fall',
      incidentCause: `작업자가 3층 높이(약 12m)의 강관 비계에서 외벽 마감 작업 중 안전난간이 설치되지 않은 개구부를 통해 추락하여 사망함.

사고 당시 상황:
- 안전난간 미설치 구간에서 작업 진행
- 안전대 부착설비 부족으로 안전대 미착용
- 작업 시작 전 안전점검 미실시
- 추락방지망 설치 불량 (처짐 과다)

직접적 원인:
- 개구부에 안전난간 미설치
- 작업자 안전대 미착용
- 추락방지망 기능 상실

관리적 원인:
- 작업 전 안전점검 절차 부재
- 안전관리자의 현장 순찰 부실
- 근로자 안전교육 미흡 (최근 6개월간 교육 기록 없음)`,
    },
  },
  {
    id: 'caught-machine',
    label: '끼임 사례',
    description: '제조업 기계설비 끼임 재해',
    icon: '🏭',
    formData: {
      title: '사출성형기 금형 교체 중 끼임 사망사고',
      incidentDate: '2024-06-22T10:15:00',
      location: '경기도 평택시 산업단지 ㈜OO플라스틱 제1공장',
      agentObject: '기계 조작원 (남, 35세, 경력 8년)',
      hazardObject: '200톤급 사출성형기',
      incidentType: 'Equipment Failure',
      incidentCause: `작업자가 사출성형기의 금형 교체 작업 중 기계가 예상치 못하게 작동하여 금형과 고정판 사이에 머리가 끼여 사망함.

사고 당시 상황:
- 금형 교체를 위해 안전덮개를 열고 작업 중
- 주전원은 차단했으나, 비상정지 장치 미작동
- 작업 중 동료 작업자가 실수로 작동 버튼 접촉
- 2인 1조 작업 원칙 미준수 (단독 작업)

직접적 원인:
- 전원 차단 불완전 (잔류 에너지 존재)
- 안전 인터록 장치 고장 상태 방치
- 작업 중 의도치 않은 기동

관리적 원인:
- 정비 작업 시 잠금장치(LOTO) 절차 미이행
- 설비 안전장치 정기점검 미실시 (최근 1년간 점검 기록 없음)
- 작업 허가서(Work Permit) 제도 운영 부재
- 신규 작업자 대상 설비 안전교육 부족`,
    },
  },
  {
    id: 'chemical-spill',
    label: '화학물질 누출',
    description: '화학공장 황산 누출 재해',
    icon: '⚗️',
    formData: {
      title: '황산 저장탱크 밸브 누출로 인한 화학 화상 사고',
      incidentDate: '2024-08-08T16:45:00',
      location: '울산광역시 남구 OO화학단지 ㈜OO케미칼 제3공장',
      agentObject: '설비 정비원 (남, 29세, 경력 3년)',
      hazardObject: '황산(98%) 저장탱크 (용량 50톤)',
      incidentType: 'Chemical Spill',
      incidentCause: `작업자가 황산 저장탱크의 하단 배출 밸브 점검 중 밸브 패킹 노후로 인해 황산이 누출되어 얼굴과 상체에 2도 화학 화상을 입음.

사고 당시 상황:
- 밸브 점검 시 화학물질 보호복 미착용 (일반 작업복만 착용)
- 보안경, 안면보호구 미착용
- 비상 세척 시설(Emergency Shower)까지 거리 30m 이상
- 작업 전 위험성 평가 미실시

직접적 원인:
- 밸브 패킹 재질 노후 (사용 기간 5년 초과)
- 개인보호구 미착용 (보호복, 안면보호구, 장갑)
- 누출 감지 및 차단 장치 부재

관리적 원인:
- 설비 부품 교체 주기 관리 미흡
- 화학물질 취급 작업 표준 절차서(SOP) 미작성
- 비상 세척 설비 배치 부적절 (접근성 불량)
- 화학물질 누출 대응 훈련 미실시 (최근 2년간 훈련 기록 없음)
- MSDS(물질안전보건자료) 작업 현장 비치 안 됨`,
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
