-- Seed Law Rules Data
-- Total: 28 rules covering common incident types

-- Fall-related laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-1', 'fall', '산업안전보건법 제38조 (추락 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-2', 'fall', '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-3', 'scaffold', '산업안전보건법 제38조 (추락 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-4', 'scaffold', '산업안전보건기준에 관한 규칙 제56조 (비계의 구조)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-5', 'height', '산업안전보건법 제38조 (추락 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-6', 'opening', '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Chemical-related laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-7', 'chemical', '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-8', 'chemical', '화학물질관리법 제28조 (화학사고 예방 조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=206598', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-9', 'spill', '화학물질관리법 제28조 (화학사고 예방 조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=206598', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-10', 'spill', '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

-- Fire/Explosion-related laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-11', 'fire', '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-12', 'fire', '위험물안전관리법 제5조 (제조소등의 설치 및 변경)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231556', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-13', 'explosion', '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-14', 'explosion', '위험물안전관리법 제5조 (제조소등의 설치 및 변경)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231556', datetime('now'));

-- Equipment-related laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-15', 'equipment', '산업안전보건법 제83조 (유해·위험기계등에 대한 안전조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-16', 'equipment', '산업안전보건기준에 관한 규칙 제86조 (위험기계·기구의 방호조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Electrical-related laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-17', 'electrical', '산업안전보건법 제37조 (전기로 인한 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-18', 'electrical', '전기안전관리법 제13조 (전기안전관리자의 선임 등)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=230893', datetime('now'));

-- Confined space laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-19', 'confined', '산업안전보건법 제118조 (밀폐공간 작업 프로그램 수립·시행)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-20', 'confined', '산업안전보건기준에 관한 규칙 제619조 (밀폐공간 작업 시 조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Machinery laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-21', 'machinery', '산업안전보건법 제83조 (유해·위험기계등에 대한 안전조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-22', 'machinery', '산업안전보건기준에 관한 규칙 제86조 (위험기계·기구의 방호조치)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Construction laws
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-23', 'construction', '산업안전보건법 제63조 (산업안전보건관리비의 계상 및 사용)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-24', 'construction', '산업안전보건기준에 관한 규칙 제420조 (건설공사의 산업안전보건관리비)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Struck-by incidents
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-25', 'struck', '산업안전보건법 제38조 (낙하·비래 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-26', 'struck', '산업안전보건기준에 관한 규칙 제45조 (물체의 낙하·비래에 의한 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));

-- Caught-in/between incidents
INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-27', 'caught', '산업안전보건법 제38조 (협착에 의한 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390', datetime('now'));

INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at)
VALUES ('seed-28', 'caught', '산업안전보건기준에 관한 규칙 제88조 (회전기계 등의 위험 방지)', 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391', datetime('now'));
