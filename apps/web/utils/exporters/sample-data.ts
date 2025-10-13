/**
 * Sample OPS data for testing exports
 */

import { OPSExportData } from './types';

export const SAMPLE_OPS_DATA: OPSExportData = {
  // Metadata
  title: '건설현장 추락사고 안전조치 보고서',
  incident_date: '2025-01-15 10:30',
  location: '서울시 강남구 테헤란로 123 건설현장 3층',
  created_at: new Date().toISOString(),
  document_hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',

  // Incident details
  agent_object: '비계',
  hazard_object: '안전난간',
  incident_type: '추락',
  incident_cause: '작업자가 3층 비계 작업 중 안전난간이 미설치된 구간에서 균형을 잃고 추락하였음. 당시 안전벨트를 착용하지 않은 상태였으며, 작업 시작 전 안전 점검이 미흡하였음.',

  // AI-generated content
  summary: '건설현장 3층 비계 작업 중 안전난간 미설치 구간에서 작업자가 추락한 사고입니다. 안전벨트 미착용 및 작업 전 안전 점검 부재가 주요 원인으로 파악되었습니다. 해당 구간의 안전난간 설치 및 작업자 안전교육 강화가 필요합니다.',

  root_causes: [
    '안전난간 미설치: 3층 비계 일부 구간에 안전난간이 설치되지 않았음',
    '안전벨트 미착용: 작업자가 고소작업 시 필수인 안전벨트를 착용하지 않음',
    '작업 전 안전 점검 미흡: 작업 시작 전 현장 안전상태 점검이 제대로 이루어지지 않음',
    '안전교육 부족: 작업자에게 고소작업 안전수칙에 대한 교육이 충분히 제공되지 않음',
    '현장 감독 소홀: 작업 중 현장 책임자의 안전 감독이 부족하였음',
  ],

  prevention_checklist: [
    '모든 고소작업 구간에 안전난간 설치 완료 확인',
    '작업자 안전벨트 착용 의무화 및 일일 점검',
    '작업 시작 전 TBM(Tool Box Meeting) 실시',
    '고소작업 안전교육 실시 및 이수증 관리',
    '현장 책임자의 수시 안전 점검 체계 구축',
    '안전 미준수 시 즉시 작업 중지 조치',
    '추락방지 안전망 설치 검토',
    '작업자 건강상태 확인 (고소공포증, 어지러움 등)',
  ],

  // Law suggestions
  suggested_laws: [
    {
      law_title: '산업안전보건법',
      article_no: '제38조(안전조치)',
      text: '사업주는 근로자가 추락할 위험이 있는 장소에서 작업을 하는 경우에는 안전난간, 울타리, 수직형 추락방망 또는 덮개 등의 방호조치를 하여야 한다.',
      confidence: 95,
      confidence_level: 'high',
    },
    {
      law_title: '산업안전보건기준에 관한 규칙',
      article_no: '제42조(안전대의 부착설비 등)',
      text: '사업주는 근로자가 안전대를 사용하여 작업을 하는 경우에 안전대를 안전하게 걸어 사용할 수 있는 설비 등을 설치하여야 한다.',
      confidence: 92,
      confidence_level: 'high',
    },
    {
      law_title: '산업안전보건기준에 관한 규칙',
      article_no: '제56조(비계의 구조)',
      text: '사업주는 비계를 조립·해체 또는 변경하는 경우에 비계의 재료, 구조 및 안전성 등을 고려하여 작업계획서를 작성하고 그 계획에 따라 작업을 실시하여야 한다.',
      confidence: 88,
      confidence_level: 'high',
    },
    {
      law_title: '산업안전보건법',
      article_no: '제29조(안전보건교육)',
      text: '사업주는 소속 근로자에게 고용노동부령으로 정하는 바에 따라 정기적으로 안전보건교육을 하여야 한다.',
      confidence: 85,
      confidence_level: 'high',
    },
    {
      law_title: '산업안전보건기준에 관한 규칙',
      article_no: '제13조(안전난간의 구조 및 설치요건)',
      text: '안전난간은 상부 난간대, 중간 난간대, 발끝막이판 및 난간기둥으로 구성하며, 상부난간대는 바닥면 등으로부터 90센티미터 이상 지점에 설치하여야 한다.',
      confidence: 90,
      confidence_level: 'high',
    },
  ],
};
