/**
 * Law Ranking System - Confidence-based Re-ranking
 * Adds confidence scores (0-100) and evidence summaries to law suggestions
 *
 * Confidence Formula:
 * confidence = base_score × coverage_factor × specificity_factor × recency_factor
 *
 * Where:
 * - base_score: Normalized total_score from hybrid scorer (0-100)
 * - coverage_factor: How many search terms are covered (0.5-1.2)
 * - specificity_factor: Length and detail of matched text (0.8-1.15)
 * - recency_factor: Law effective date bonus (0.95-1.05)
 */

interface LawArticle {
  id: string;
  law_code: string;
  law_title: string;
  article_no: string;
  clause_no: string | null;
  text: string;
  effective_date: string;
  keywords: string;
  source_url: string;
}

interface RuleMatch {
  type: 'keyword' | 'regex';
  pattern: string;
  matches: string[];
}

interface MatchedRule {
  accident_type: string;
  matches: RuleMatch[];
}

interface ScoredLaw {
  law: LawArticle;
  total_score: number;
  bm25_score: number;
  rule_score: number;
  matched_rules: MatchedRule[];
}

interface RankedLaw extends ScoredLaw {
  confidence: number;
  confidence_level: 'high' | 'medium' | 'low';
  evidence_summary: string;
  ranking_factors: {
    base_score: number;
    coverage_factor: number;
    specificity_factor: number;
    recency_factor: number;
  };
}

interface RankingParams {
  summary?: string;
  incident_type?: string;
  causative_object?: string;
  work_process?: string;
}

/**
 * Re-rank laws with confidence scores and evidence summaries
 */
export function rankLaws(
  suggestions: ScoredLaw[],
  params: RankingParams
): RankedLaw[] {
  // Extract search terms for coverage analysis
  const searchTerms = [
    params.summary || '',
    params.incident_type || '',
    params.causative_object || '',
    params.work_process || '',
  ]
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter((term) => term.length > 1)
    .map((term) => term.toLowerCase());

  // Calculate confidence for each law
  const rankedLaws: RankedLaw[] = suggestions.map((scored) => {
    const baseScore = scored.total_score * 100; // Convert to 0-100 scale

    // Factor 1: Coverage - how many search terms are covered
    const coverageFactor = calculateCoverageFactor(scored.law, searchTerms);

    // Factor 2: Specificity - length and detail of law text
    const specificityFactor = calculateSpecificityFactor(scored.law, scored.matched_rules);

    // Factor 3: Recency - newer laws get slight bonus
    const recencyFactor = calculateRecencyFactor(scored.law.effective_date);

    // Calculate final confidence score
    const confidence = Math.min(
      100,
      Math.max(0, baseScore * coverageFactor * specificityFactor * recencyFactor)
    );

    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low';
    if (confidence >= 70) {
      confidenceLevel = 'high';
    } else if (confidence >= 40) {
      confidenceLevel = 'medium';
    } else {
      confidenceLevel = 'low';
    }

    // Generate evidence summary
    const evidenceSummary = generateEvidenceSummary(scored.matched_rules, scored.bm25_score, scored.rule_score);

    return {
      ...scored,
      confidence: Math.round(confidence),
      confidence_level: confidenceLevel,
      evidence_summary: evidenceSummary,
      ranking_factors: {
        base_score: Math.round(baseScore * 100) / 100,
        coverage_factor: Math.round(coverageFactor * 100) / 100,
        specificity_factor: Math.round(specificityFactor * 100) / 100,
        recency_factor: Math.round(recencyFactor * 100) / 100,
      },
    };
  });

  // Sort by confidence (descending), then by id for deterministic ordering
  rankedLaws.sort((a, b) => {
    if (Math.abs(a.confidence - b.confidence) < 0.01) {
      return a.law.id.localeCompare(b.law.id);
    }
    return b.confidence - a.confidence;
  });

  return rankedLaws;
}

/**
 * Calculate coverage factor: how many search terms appear in the law
 * Range: 0.5 (poor coverage) to 1.2 (excellent coverage)
 */
function calculateCoverageFactor(law: LawArticle, searchTerms: string[]): number {
  if (searchTerms.length === 0) {
    return 1.0;
  }

  const lawText = [law.law_title, law.article_no, law.text, law.keywords]
    .join(' ')
    .toLowerCase();

  let coveredTerms = 0;
  for (const term of searchTerms) {
    if (lawText.includes(term)) {
      coveredTerms++;
    }
  }

  const coverageRatio = coveredTerms / searchTerms.length;

  // Map coverage ratio to factor
  // 0% coverage: 0.5x
  // 50% coverage: 0.85x
  // 100% coverage: 1.2x
  if (coverageRatio >= 0.8) {
    return 1.2;
  } else if (coverageRatio >= 0.6) {
    return 1.1;
  } else if (coverageRatio >= 0.4) {
    return 1.0;
  } else if (coverageRatio >= 0.2) {
    return 0.85;
  } else {
    return 0.7;
  }
}

/**
 * Calculate specificity factor: detail and precision of the law
 * Range: 0.8 (vague/short) to 1.15 (specific/detailed)
 */
function calculateSpecificityFactor(law: LawArticle, matchedRules: MatchedRule[]): number {
  let factor = 1.0;

  // Factor 1: Text length (more detailed = higher)
  const textLength = law.text.length;
  if (textLength > 500) {
    factor += 0.1; // Very detailed law
  } else if (textLength > 200) {
    factor += 0.05; // Moderately detailed
  } else if (textLength < 100) {
    factor -= 0.1; // Too short/vague
  }

  // Factor 2: Number of matched rules (more matches = higher)
  const ruleMatchCount = matchedRules.reduce(
    (sum, rule) => sum + rule.matches.length,
    0
  );
  if (ruleMatchCount >= 5) {
    factor += 0.1; // Strong rule alignment
  } else if (ruleMatchCount >= 3) {
    factor += 0.05; // Good rule alignment
  } else if (ruleMatchCount === 0) {
    factor -= 0.15; // No rule matches (BM25 only)
  }

  // Factor 3: Keyword density (more keywords = higher)
  const keywordCount = law.keywords.split(',').filter((k) => k.trim().length > 0).length;
  if (keywordCount >= 5) {
    factor += 0.05; // Well-tagged
  } else if (keywordCount <= 2) {
    factor -= 0.05; // Poorly tagged
  }

  return Math.max(0.8, Math.min(1.15, factor));
}

/**
 * Calculate recency factor: newer laws get slight bonus
 * Range: 0.95 (old law) to 1.05 (recent law)
 */
function calculateRecencyFactor(effectiveDate: string): number {
  try {
    const lawDate = new Date(effectiveDate);
    const now = new Date();
    const ageInYears = (now.getTime() - lawDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    // Laws within 2 years: +5% bonus
    if (ageInYears <= 2) {
      return 1.05;
    }
    // Laws 2-5 years old: neutral
    else if (ageInYears <= 5) {
      return 1.0;
    }
    // Laws 5-10 years old: -2% penalty
    else if (ageInYears <= 10) {
      return 0.98;
    }
    // Laws 10+ years old: -5% penalty
    else {
      return 0.95;
    }
  } catch (e) {
    // Invalid date format, return neutral
    return 1.0;
  }
}

/**
 * Generate human-readable evidence summary
 */
function generateEvidenceSummary(
  matchedRules: MatchedRule[],
  bm25Score: number,
  ruleScore: number
): string {
  const parts: string[] = [];

  // Part 1: Rule matches
  if (matchedRules.length > 0) {
    const totalMatches = matchedRules.reduce(
      (sum, rule) => sum + rule.matches.length,
      0
    );
    const accidentTypes = matchedRules.map((r) => r.accident_type).slice(0, 2);
    parts.push(`${accidentTypes.join(', ')} 유형 매칭 (${totalMatches}개 규칙)`);
  }

  // Part 2: Score breakdown
  if (bm25Score > 0.7) {
    parts.push('강한 텍스트 유사도');
  } else if (bm25Score > 0.4) {
    parts.push('중간 텍스트 유사도');
  }

  if (ruleScore > 0.7) {
    parts.push('강한 규칙 매칭');
  } else if (ruleScore > 0.4) {
    parts.push('중간 규칙 매칭');
  }

  // Part 3: Fallback if no matches
  if (parts.length === 0) {
    if (bm25Score > 0) {
      parts.push('텍스트 검색 결과');
    } else {
      parts.push('일반 관련성');
    }
  }

  return parts.join(' · ');
}

/**
 * LLM Re-ranking Hook (Interface only, not implemented)
 *
 * Future enhancement: Use LLM to re-rank laws based on:
 * - Semantic similarity
 * - Contextual relevance
 * - Legal precedence
 * - Industry-specific interpretation
 *
 * @param rankedLaws - Laws already ranked by rule-based system
 * @param context - Additional context for LLM
 * @returns Re-ranked laws with LLM confidence scores
 */
export async function llmRerank(
  rankedLaws: RankedLaw[],
  context: {
    summary: string;
    incident_type: string;
    industry?: string;
    company_size?: string;
  }
): Promise<RankedLaw[]> {
  // TODO: Implement LLM re-ranking when needed
  // For now, return the rule-based ranking as-is
  console.warn('[LLM Rerank] Not implemented - using rule-based ranking');
  return rankedLaws;
}
