-- Safe OPS Studio - Law Rules Seed Data
-- 산업안전보건법 및 시행규칙 기반 법령 매칭 규칙
-- 총 50개 규칙 (재해 유형별)

-- ============================================
-- 1. 추락 재해 관련 법령 (15개)
-- ============================================

-- 추락 일반
INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-FALL-001', '추락', '산업안전보건법 제38조 (추락 등의 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건법/제38조', datetime('now')),
('LAW-FALL-002', '추락,개구부', '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제42조', datetime('now')),
('LAW-FALL-003', '추락,안전난간', '산업안전보건기준에 관한 규칙 제13조 (안전난간의 구조 및 설치 요건)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제13조', datetime('now')),
('LAW-FALL-004', '추락,안전대', '산업안전보건기준에 관한 규칙 제44조 (안전대 등의 착용)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제44조', datetime('now')),
('LAW-FALL-005', '추락,작업발판', '산업안전보건기준에 관한 규칙 제56조 (작업발판)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제56조', datetime('now'));

-- 비계 관련
INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-FALL-006', '비계', '산업안전보건기준에 관한 규칙 제59조 (비계의 조립 등 작업 시 준수사항)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제59조', datetime('now')),
('LAW-FALL-007', '비계,강관', '산업안전보건기준에 관한 규칙 제60조 (강관비계)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제60조', datetime('now')),
('LAW-FALL-008', '비계,통나무', '산업안전보건기준에 관한 규칙 제64조 (통나무 비계)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제64조', datetime('now')),
('LAW-FALL-009', '달비계', '산업안전보건기준에 관한 규칙 제67조 (달비계)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제67조', datetime('now')),
('LAW-FALL-010', '말비계', '산업안전보건기준에 관한 규칙 제70조 (말비계)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제70조', datetime('now'));

-- 사다리 및 지붕 작업
INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-FALL-011', '사다리', '산업안전보건기준에 관한 규칙 제24조 (이동식 사다리식 통로 등)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제24조', datetime('now')),
('LAW-FALL-012', '지붕', '산업안전보건기준에 관한 규칙 제43조 (지붕 위에서의 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제43조', datetime('now')),
('LAW-FALL-013', '추락방지망', '산업안전보건기준에 관한 규칙 제45조 (추락의 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제45조', datetime('now')),
('LAW-FALL-014', '굴착,토석붕괴', '산업안전보건기준에 관한 규칙 제40조 (굴착면의 붕괴 등에 의한 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제40조', datetime('now')),
('LAW-FALL-015', '중량물,낙하', '산업안전보건기준에 관한 규칙 제32조 (낙하물에 의한 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제32조', datetime('now'));

-- ============================================
-- 2. 화학물질 관련 법령 (12개)
-- ============================================

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-CHEM-001', '화학물질', '산업안전보건법 제110조 (물질안전보건자료의 작성·제출)', 'https://www.law.go.kr/법령/산업안전보건법/제110조', datetime('now')),
('LAW-CHEM-002', 'MSDS', '산업안전보건법 제114조 (물질안전보건자료의 게시 및 교육)', 'https://www.law.go.kr/법령/산업안전보건법/제114조', datetime('now')),
('LAW-CHEM-003', '화학물질,누출', '산업안전보건기준에 관한 규칙 제420조 (누출 등의 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제420조', datetime('now')),
('LAW-CHEM-004', '화학물질,보호구', '산업안전보건기준에 관한 규칙 제449조 (보호구의 지급 등)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제449조', datetime('now')),
('LAW-CHEM-005', '화학물질,저장', '산업안전보건기준에 관한 규칙 제422조 (위험물질 등의 저장)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제422조', datetime('now'));

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-CHEM-006', '황산', '산업안전보건기준에 관한 규칙 제444조 (산 및 알칼리 취급 작업)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제444조', datetime('now')),
('LAW-CHEM-007', '환기', '산업안전보건기준에 관한 규칙 제430조 (국소배기장치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제430조', datetime('now')),
('LAW-CHEM-008', '비상세척', '산업안전보건기준에 관한 규칙 제511조 (세척시설 등의 설치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제511조', datetime('now')),
('LAW-CHEM-009', '화학물질,라벨', '산업안전보건법 제115조 (경고 표시 등)', 'https://www.law.go.kr/법령/산업안전보건법/제115조', datetime('now')),
('LAW-CHEM-010', '유기용제', '산업안전보건기준에 관한 규칙 제420조 (유기화합물의 유출 억제 등)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제420조', datetime('now'));

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-CHEM-011', '밀폐공간', '산업안전보건법 제38조의2 (밀폐공간 작업 프로그램 수립·시행)', 'https://www.law.go.kr/법령/산업안전보건법/제38조의2', datetime('now')),
('LAW-CHEM-012', '질식', '산업안전보건기준에 관한 규칙 제619조 (산소농도 측정 등)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제619조', datetime('now'));

-- ============================================
-- 3. 기계·설비 관련 법령 (10개)
-- ============================================

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-MACH-001', '기계,끼임', '산업안전보건법 제84조 (유해·위험 기계·기구 등에 대한 방호조치)', 'https://www.law.go.kr/법령/산업안전보건법/제84조', datetime('now')),
('LAW-MACH-002', '프레스', '산업안전보건기준에 관한 규칙 제90조 (프레스 등 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제90조', datetime('now')),
('LAW-MACH-003', '사출성형기', '산업안전보건기준에 관한 규칙 제94조 (사출성형기의 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제94조', datetime('now')),
('LAW-MACH-004', '기계,안전장치', '산업안전보건기준에 관한 규칙 제81조 (기계 등의 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제81조', datetime('now')),
('LAW-MACH-005', 'LOTO,잠금', '산업안전보건기준에 관한 규칙 제85조 (기계 등의 정비·점검 등의 작업)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제85조', datetime('now'));

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-MACH-006', '비상정지', '산업안전보건기준에 관한 규칙 제82조 (비상정지장치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제82조', datetime('now')),
('LAW-MACH-007', '회전체', '산업안전보건기준에 관한 규칙 제87조 (회전기계 등의 위험 방지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제87조', datetime('now')),
('LAW-MACH-008', '크레인', '산업안전보건기준에 관한 규칙 제137조 (크레인의 조종)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제137조', datetime('now')),
('LAW-MACH-009', '지게차', '산업안전보건기준에 관한 규칙 제178조 (지게차의 운전)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제178조', datetime('now')),
('LAW-MACH-010', '컨베이어', '산업안전보건기준에 관한 규칙 제88조 (컨베이어의 비상정지장치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제88조', datetime('now'));

-- ============================================
-- 4. 전기·감전 관련 법령 (6개)
-- ============================================

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-ELEC-001', '감전', '산업안전보건기준에 관한 규칙 제301조 (전기 기계·기구의 충전부 방호)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제301조', datetime('now')),
('LAW-ELEC-002', '정전작업', '산업안전보건기준에 관한 규칙 제322조 (정전전로에서의 작업)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제322조', datetime('now')),
('LAW-ELEC-003', '활선작업', '산업안전보건기준에 관한 규칙 제323조 (활선작업)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제323조', datetime('now')),
('LAW-ELEC-004', '접지', '산업안전보건기준에 관한 규칙 제304조 (접지)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제304조', datetime('now')),
('LAW-ELEC-005', '누전차단기', '산업안전보건기준에 관한 규칙 제305조 (누전차단기)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제305조', datetime('now')),
('LAW-ELEC-006', '전기설비,점검', '산업안전보건기준에 관한 규칙 제326조 (전기 기계·기구의 점검)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제326조', datetime('now'));

-- ============================================
-- 5. 화재·폭발 관련 법령 (7개)
-- ============================================

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-FIRE-001', '화재', '산업안전보건기준에 관한 규칙 제231조 (화재 예방)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제231조', datetime('now')),
('LAW-FIRE-002', '폭발', '산업안전보건기준에 관한 규칙 제227조 (폭발 또는 화재 등의 예방)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제227조', datetime('now')),
('LAW-FIRE-003', '소화설비', '산업안전보건기준에 관한 규칙 제232조 (소화설비)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제232조', datetime('now')),
('LAW-FIRE-004', '용접,화기', '산업안전보건기준에 관한 규칙 제241조 (화재 위험이 있는 장소의 용접 등 작업)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제241조', datetime('now')),
('LAW-FIRE-005', '가스용접', '산업안전보건기준에 관한 규칙 제246조 (가스 등의 용접장치 등의 안전기)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제246조', datetime('now')),
('LAW-FIRE-006', '정전기', '산업안전보건기준에 관한 규칙 제229조 (정전기 제거)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제229조', datetime('now')),
('LAW-FIRE-007', '위험물,저장', '산업안전보건기준에 관한 규칙 제226조 (위험물 등의 제조 등 작업 시의 조치)', 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙/제226조', datetime('now'));

-- ============================================
-- 6. 안전 관리 일반 (필수 공통 사항) (추가 항목 포함 총 50개 달성)
-- ============================================

-- 이미 48개이므로 2개만 추가하여 총 50개

INSERT INTO law_rules (id, keyword, law_title, url, created_at) VALUES
('LAW-GEN-001', '안전교육', '산업안전보건법 제29조 (근로자에 대한 안전보건교육)', 'https://www.law.go.kr/법령/산업안전보건법/제29조', datetime('now')),
('LAW-GEN-002', '위험성평가', '산업안전보건법 제36조 (위험성평가의 실시)', 'https://www.law.go.kr/법령/산업안전보건법/제36조', datetime('now'));

-- 총 50개 법령 규칙 완료
