/**
 * Seed Law Rules Script
 * Seeds D1 database with initial law rules for MVP
 *
 * Usage: Run this script after D1 migrations
 */

export const lawRulesSeed = [
  // Fall-related laws
  {
    keyword: 'fall',
    law_title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'fall',
    law_title: '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },
  {
    keyword: 'scaffold',
    law_title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'scaffold',
    law_title: '산업안전보건기준에 관한 규칙 제56조 (비계의 구조)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },
  {
    keyword: 'height',
    law_title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'opening',
    law_title: '산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Chemical-related laws
  {
    keyword: 'chemical',
    law_title: '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'chemical',
    law_title: '화학물질관리법 제28조 (화학사고 예방 조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=206598',
  },
  {
    keyword: 'spill',
    law_title: '화학물질관리법 제28조 (화학사고 예방 조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=206598',
  },
  {
    keyword: 'spill',
    law_title: '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },

  // Fire/Explosion-related laws
  {
    keyword: 'fire',
    law_title: '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'fire',
    law_title: '위험물안전관리법 제5조 (제조소등의 설치 및 변경)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231556',
  },
  {
    keyword: 'explosion',
    law_title: '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'explosion',
    law_title: '위험물안전관리법 제5조 (제조소등의 설치 및 변경)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231556',
  },

  // Equipment-related laws
  {
    keyword: 'equipment',
    law_title: '산업안전보건법 제83조 (유해·위험기계등에 대한 안전조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'equipment',
    law_title: '산업안전보건기준에 관한 규칙 제86조 (위험기계·기구의 방호조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Electrical-related laws
  {
    keyword: 'electrical',
    law_title: '산업안전보건법 제37조 (전기로 인한 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'electrical',
    law_title: '전기안전관리법 제13조 (전기안전관리자의 선임 등)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=230893',
  },

  // Confined space laws
  {
    keyword: 'confined',
    law_title: '산업안전보건법 제118조 (밀폐공간 작업 프로그램 수립·시행)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'confined',
    law_title: '산업안전보건기준에 관한 규칙 제619조 (밀폐공간 작업 시 조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Machinery laws
  {
    keyword: 'machinery',
    law_title: '산업안전보건법 제83조 (유해·위험기계등에 대한 안전조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'machinery',
    law_title: '산업안전보건기준에 관한 규칙 제86조 (위험기계·기구의 방호조치)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Construction laws
  {
    keyword: 'construction',
    law_title: '산업안전보건법 제63조 (산업안전보건관리비의 계상 및 사용)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'construction',
    law_title: '산업안전보건기준에 관한 규칙 제420조 (건설공사의 산업안전보건관리비)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Struck-by incidents
  {
    keyword: 'struck',
    law_title: '산업안전보건법 제38조 (낙하·비래 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'struck',
    law_title: '산업안전보건기준에 관한 규칙 제45조 (물체의 낙하·비래에 의한 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },

  // Caught-in/between incidents
  {
    keyword: 'caught',
    law_title: '산업안전보건법 제38조 (협착에 의한 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
  },
  {
    keyword: 'caught',
    law_title: '산업안전보건기준에 관한 규칙 제88조 (회전기계 등의 위험 방지)',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231391',
  },
];

/**
 * Generate seed SQL statements
 */
export function generateSeedSQL(): string[] {
  const statements: string[] = [];

  lawRulesSeed.forEach((rule, index) => {
    const id = `seed-${index + 1}`;
    const createdAt = new Date().toISOString();

    statements.push(
      `INSERT OR IGNORE INTO law_rules (id, keyword, law_title, url, created_at) VALUES ('${id}', '${rule.keyword}', '${rule.law_title}', '${rule.url}', '${createdAt}');`
    );
  });

  return statements;
}

// Export for console output
if (require.main === module) {
  console.log('-- Law Rules Seed Data');
  console.log('-- Total rules:', lawRulesSeed.length);
  console.log('');
  generateSeedSQL().forEach(sql => console.log(sql));
}
