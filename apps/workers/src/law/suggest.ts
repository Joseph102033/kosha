/**
 * Law Suggestion System - Hybrid Scorer
 * Combines FTS5 BM25 scores with rule-based keyword/regex matching
 */

import lawRulesData from '../../rules/law_rules.json';
import { rankLaws } from './ranker';

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
  created_at: string;
  updated_at: string;
}

interface RuleMatch {
  type: 'keyword' | 'regex';
  pattern: string;
  matches: string[];
}

interface ScoredLaw {
  law: LawArticle;
  total_score: number;
  bm25_score: number;
  rule_score: number;
  matched_rules: {
    accident_type: string;
    matches: RuleMatch[];
  }[];
}

interface SuggestParams {
  summary?: string;
  incident_type?: string;
  causative_object?: string;
  work_process?: string;
  limit?: number;
}

interface LawRule {
  keywords: string[];
  regex: string[];
  weight: number;
}

interface LawRulesConfig {
  version: string;
  updated_at: string;
  description: string;
  rules: Record<string, LawRule>;
  scoring_parameters: {
    alpha: number;
    beta: number;
    description: string;
  };
}

// Cast imported JSON to typed config
const lawRules = lawRulesData as LawRulesConfig;

/**
 * Main function to suggest relevant laws based on incident data
 */
export async function suggestLaws(
  db: D1Database,
  params: SuggestParams
): Promise<{
  suggestions: ScoredLaw[];
  metadata: {
    version: string;
    updated_at: string;
    alpha: number;
    beta: number;
    total_candidates: number;
  };
}> {
  const { summary = '', incident_type = '', causative_object = '', work_process = '', limit = 12 } = params;

  // Combine all input text for FTS5 search
  const searchText = [summary, incident_type, causative_object, work_process]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (!searchText) {
    return {
      suggestions: [],
      metadata: {
        version: lawRules.version,
        updated_at: lawRules.updated_at,
        alpha: lawRules.scoring_parameters.alpha,
        beta: lawRules.scoring_parameters.beta,
        total_candidates: 0,
      },
    };
  }

  // Step 1: Get candidate laws from FTS5 search (fetch more than needed for rule filtering)
  const ftsLimit = Math.max(50, limit * 5); // Get 5x candidates for rule-based refinement
  const ftsResults = await getFTS5Candidates(db, searchText, ftsLimit);

  // Step 2: Calculate rule-based scores for each candidate
  const scoredLaws = ftsResults.map((result) => {
    const ruleScore = calculateRuleScore(result.law, params);

    // Combine scores using weighted formula: score = α*bm25 + β*rule_score
    const alpha = lawRules.scoring_parameters.alpha;
    const beta = lawRules.scoring_parameters.beta;
    const totalScore = alpha * result.bm25_score + beta * ruleScore.score;

    return {
      law: result.law,
      total_score: totalScore,
      bm25_score: result.bm25_score,
      rule_score: ruleScore.score,
      matched_rules: ruleScore.matches,
    };
  });

  // Step 3: Sort by total score (descending) and take top N
  // For deterministic results, use secondary sort by law ID
  const sortedLaws = scoredLaws.sort((a, b) => {
    if (Math.abs(a.total_score - b.total_score) < 0.0001) {
      // Scores are equal, sort by ID for deterministic ordering
      return a.law.id.localeCompare(b.law.id);
    }
    return b.total_score - a.total_score;
  });

  const topSuggestions = sortedLaws.slice(0, limit);

  // Apply confidence-based ranking
  const rankedSuggestions = rankLaws(topSuggestions, params);

  return {
    suggestions: rankedSuggestions,
    metadata: {
      version: lawRules.version,
      updated_at: lawRules.updated_at,
      alpha: lawRules.scoring_parameters.alpha,
      beta: lawRules.scoring_parameters.beta,
      total_candidates: ftsResults.length,
    },
  };
}

/**
 * Get candidate laws using FTS5 full-text search with BM25 ranking
 */
async function getFTS5Candidates(
  db: D1Database,
  searchText: string,
  limit: number
): Promise<Array<{ law: LawArticle; bm25_score: number }>> {
  // FTS5 MATCH query with rank (BM25 score)
  const sql = `
    SELECT
      l.*,
      bm25(laws_fts) as bm25_rank
    FROM laws l
    INNER JOIN laws_fts ON laws_fts.rowid = l.rowid
    WHERE laws_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `;

  const result = await db.prepare(sql).bind(searchText, limit).all();

  // Convert BM25 rank to normalized score (rank is negative, more negative = better match)
  // Normalize to 0-1 range for consistent scoring
  const results = (result.results as Array<LawArticle & { bm25_rank: number }>) || [];

  if (results.length === 0) {
    return [];
  }

  // Find min and max ranks for normalization
  const ranks = results.map((r) => r.bm25_rank);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const rankRange = maxRank - minRank || 1; // Avoid division by zero

  return results.map((result) => {
    const { bm25_rank, ...law } = result;

    // Normalize: convert negative rank to positive score in [0, 1]
    // More negative rank (better match) → higher score
    const normalizedScore = rankRange === 0 ? 1.0 : (maxRank - bm25_rank) / rankRange;

    return {
      law: law as LawArticle,
      bm25_score: normalizedScore,
    };
  });
}

/**
 * Calculate rule-based score for a law article
 */
function calculateRuleScore(
  law: LawArticle,
  params: SuggestParams
): {
  score: number;
  matches: Array<{ accident_type: string; matches: RuleMatch[] }>;
} {
  const { incident_type = '', summary = '', causative_object = '', work_process = '' } = params;

  // Combine all searchable fields from the law
  const lawSearchText = [
    law.law_title,
    law.article_no,
    law.text,
    law.keywords,
  ].join(' ');

  // Combine all input text
  const inputText = [summary, incident_type, causative_object, work_process].join(' ');

  let totalScore = 0;
  const allMatches: Array<{ accident_type: string; matches: RuleMatch[] }> = [];

  // Iterate through all rule types
  for (const [accidentType, rule] of Object.entries(lawRules.rules)) {
    const ruleMatches: RuleMatch[] = [];
    let ruleScore = 0;

    // Check keyword matches
    for (const keyword of rule.keywords) {
      const keywordRegex = new RegExp(keyword, 'gi');
      const lawMatches = lawSearchText.match(keywordRegex);
      const inputMatches = inputText.match(keywordRegex);

      if (lawMatches && inputMatches) {
        // Both law and input contain this keyword
        ruleScore += 1.0 * rule.weight;
        ruleMatches.push({
          type: 'keyword',
          pattern: keyword,
          matches: Array.from(new Set([...lawMatches, ...inputMatches])), // Deduplicate
        });
      } else if (lawMatches) {
        // Only law contains keyword (partial match)
        ruleScore += 0.3 * rule.weight;
        ruleMatches.push({
          type: 'keyword',
          pattern: keyword,
          matches: lawMatches,
        });
      }
    }

    // Check regex matches
    for (const pattern of rule.regex) {
      try {
        const regex = new RegExp(pattern, 'gi');
        const lawMatches = lawSearchText.match(regex);
        const inputMatches = inputText.match(regex);

        if (lawMatches && inputMatches) {
          // Both law and input match this pattern
          ruleScore += 1.5 * rule.weight; // Regex matches score higher
          ruleMatches.push({
            type: 'regex',
            pattern: pattern,
            matches: Array.from(new Set([...lawMatches, ...inputMatches])),
          });
        } else if (lawMatches) {
          // Only law matches pattern
          ruleScore += 0.5 * rule.weight;
          ruleMatches.push({
            type: 'regex',
            pattern: pattern,
            matches: lawMatches,
          });
        }
      } catch (e) {
        // Invalid regex, skip
        console.warn(`Invalid regex pattern: ${pattern}`, e);
      }
    }

    if (ruleMatches.length > 0) {
      totalScore += ruleScore;
      allMatches.push({
        accident_type: accidentType,
        matches: ruleMatches,
      });
    }
  }

  // Normalize rule score to [0, 1] range
  // Maximum possible score estimation: assume 10 keywords + 5 regex patterns per rule type
  const maxPossibleScore = Object.keys(lawRules.rules).length * (10 * 1.0 + 5 * 1.5);
  const normalizedScore = Math.min(1.0, totalScore / maxPossibleScore);

  return {
    score: normalizedScore,
    matches: allMatches,
  };
}

/**
 * Get rule version information
 */
export function getRuleVersion(): {
  version: string;
  updated_at: string;
} {
  return {
    version: lawRules.version,
    updated_at: lawRules.updated_at,
  };
}
