/**
 * Law Matching Engine
 * D1-based keyword matching for law reference suggestions
 */

import type { LawReference } from '../ops/models';
import type { Env } from '../index';

/**
 * Match laws from D1 database based on incident type and objects
 * If no rules found in DB, falls back to hardcoded defaults
 */
export async function matchLaws(
  incidentType: string,
  agentObject: string | undefined,
  hazardObject: string | undefined,
  env: Env
): Promise<LawReference[]> {
  const laws: LawReference[] = [];
  const type = incidentType.toLowerCase();
  const agent = agentObject?.toLowerCase() || '';
  const hazard = hazardObject?.toLowerCase() || '';

  // Build search keywords
  const keywords: string[] = [];

  // Extract keywords from incident type
  if (type.includes('fall')) keywords.push('fall');
  if (type.includes('chemical')) keywords.push('chemical');
  if (type.includes('fire')) keywords.push('fire');
  if (type.includes('explosion')) keywords.push('explosion');
  if (type.includes('spill')) keywords.push('spill');

  // Extract keywords from hazard object
  if (hazard.includes('scaffold')) keywords.push('scaffold');
  if (hazard.includes('height')) keywords.push('height');
  if (hazard.includes('opening')) keywords.push('opening');

  try {
    // Query D1 for matching law rules
    if (keywords.length > 0) {
      const placeholders = keywords.map(() => '?').join(',');
      const query = await env.DB.prepare(
        `SELECT DISTINCT law_title, url FROM law_rules WHERE keyword IN (${placeholders})`
      )
        .bind(...keywords)
        .all<{ law_title: string; url: string }>();

      if (query.results && query.results.length > 0) {
        query.results.forEach(row => {
          laws.push({
            title: row.law_title,
            url: row.url,
          });
        });
      }
    }
  } catch (error) {
    console.error('Error querying law rules from D1:', error);
  }

  // Fallback to hardcoded rules if no matches found
  if (laws.length === 0) {
    if (type.includes('fall') || hazard.includes('scaffold') || hazard.includes('height')) {
      laws.push({
        title: '산업안전보건법 제38조 (추락 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else if (type.includes('chemical') || type.includes('toxic') || type.includes('spill')) {
      laws.push({
        title: '산업안전보건법 제39조 (물질안전보건자료의 작성·제출)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else if (type.includes('fire') || type.includes('explosion')) {
      laws.push({
        title: '산업안전보건법 제36조 (폭발·화재 등의 위험 방지)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    } else {
      // Generic fallback
      laws.push({
        title: '산업안전보건법 제38조 (안전조치)',
        url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390',
      });
    }
  }

  // Remove duplicates
  const unique = laws.filter((law, index, self) =>
    index === self.findIndex(l => l.title === law.title)
  );

  return unique;
}
