/**
 * Law Suggestion Panel Component
 * Displays AI-suggested relevant laws based on incident data with hybrid scoring
 */

import { useState, useEffect } from 'react';
import { highlightMultipleTypes, HighlightSegment } from '../../utils/highlight';

interface RuleMatch {
  type: 'keyword' | 'regex';
  pattern: string;
  matches: string[];
}

interface MatchedRule {
  accident_type: string;
  matches: RuleMatch[];
}

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

interface ScoredLaw {
  law: LawArticle;
  total_score: number;
  bm25_score: number;
  rule_score: number;
  matched_rules: MatchedRule[];
  confidence?: number;
  confidence_level?: 'high' | 'medium' | 'low';
  evidence_summary?: string;
  ranking_factors?: {
    base_score: number;
    coverage_factor: number;
    specificity_factor: number;
    recency_factor: number;
  };
}

interface SuggestMetadata {
  version: string;
  updated_at: string;
  alpha: number;
  beta: number;
  total_candidates: number;
}

interface LawSuggestPanelProps {
  summary: string;
  incidentType: string;
  causativeObject: string;
  workProcess: string;
  limit?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function LawSuggestPanel({
  summary,
  incidentType,
  causativeObject,
  workProcess,
  limit = 12,
}: LawSuggestPanelProps) {
  const [suggestions, setSuggestions] = useState<ScoredLaw[]>([]);
  const [metadata, setMetadata] = useState<SuggestMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLaws, setExpandedLaws] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, [summary, incidentType, causativeObject, workProcess, limit]);

  const fetchSuggestions = async () => {
    // Only fetch if we have some input
    const hasInput = summary || incidentType || causativeObject || workProcess;
    if (!hasInput) {
      setSuggestions([]);
      setMetadata(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/laws/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          incident_type: incidentType,
          causative_object: causativeObject,
          work_process: workProcess,
          limit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions);
        setMetadata(data.data.metadata);
      } else {
        setError(data.error || 'Failed to fetch law suggestions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch law suggestions');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvidence = (lawId: string) => {
    setExpandedLaws((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lawId)) {
        newSet.delete(lawId);
      } else {
        newSet.add(lawId);
      }
      return newSet;
    });
  };

  const getConfidenceBadge = (scored: ScoredLaw) => {
    if (!scored.confidence || !scored.confidence_level) {
      return null;
    }

    const { confidence, confidence_level } = scored;

    let badgeClass = '';
    let badgeText = '';
    let badgeIcon = '';

    if (confidence_level === 'high') {
      badgeClass = 'bg-green-100 text-green-800 border-green-300';
      badgeText = '추천';
      badgeIcon = '✓';
    } else if (confidence_level === 'medium') {
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      badgeText = '검토요망';
      badgeIcon = '⚠';
    } else {
      badgeClass = 'bg-gray-100 text-gray-800 border-gray-300';
      badgeText = '보류';
      badgeIcon = '•';
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
          title={`신뢰도: ${confidence}%`}
        >
          {badgeIcon} {badgeText}
        </span>
        <span className="text-xs text-gray-500 font-medium">{confidence}%</span>
      </div>
    );
  };

  const renderHighlightedText = (law: LawArticle, matchedRules: MatchedRule[]): React.ReactElement[] => {
    // Extract all keywords and regex patterns from matched rules
    const allKeywords: string[] = [];
    const allRegex: string[] = [];

    for (const rule of matchedRules) {
      for (const match of rule.matches) {
        if (match.type === 'keyword') {
          allKeywords.push(match.pattern);
        } else if (match.type === 'regex') {
          allRegex.push(match.pattern);
        }
      }
    }

    // Highlight the law text
    const segments = highlightMultipleTypes(law.text, allKeywords, allRegex);

    return segments.map((segment, idx) => {
      if (segment.isHighlighted) {
        return (
          <mark
            key={idx}
            className="bg-yellow-200 px-1 rounded"
            title={`${segment.matchType}: ${segment.pattern}`}
          >
            {segment.text}
          </mark>
        );
      }
      return <span key={idx}>{segment.text}</span>;
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">관련 법령 검색 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">⚠️ {error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">사고 정보를 입력하면 관련 법령이 자동으로 추천됩니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with metadata */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">추천 법령</h3>
            <p className="text-sm text-gray-600 mt-1">
              총 {suggestions.length}개 법령 (후보 {metadata?.total_candidates}개 중)
            </p>
          </div>
          {metadata && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                v{metadata.version}
              </span>
              <span className="text-xs text-gray-500" title={metadata.updated_at}>
                {new Date(metadata.updated_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          )}
        </div>
        {metadata && (
          <div className="mt-2 text-xs text-gray-500">
            점수 구성: {(metadata.alpha * 100).toFixed(0)}% BM25 + {(metadata.beta * 100).toFixed(0)}% 규칙 기반
          </div>
        )}
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-gray-200">
        {suggestions.map((scored) => {
          const isExpanded = expandedLaws.has(scored.law.id);

          return (
            <div key={scored.law.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              {/* Law Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {scored.law.law_title}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {scored.law.article_no}
                      {scored.law.clause_no && ` ${scored.law.clause_no}`}
                    </span>
                    {getConfidenceBadge(scored)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>시행일: {scored.law.effective_date}</span>
                    <span>•</span>
                    <span title={`Total: ${scored.total_score.toFixed(3)}`}>
                      BM25: {scored.bm25_score.toFixed(3)} / 규칙: {scored.rule_score.toFixed(3)}
                    </span>
                  </div>
                  {scored.evidence_summary && (
                    <div className="mt-1 text-xs text-gray-600 italic">
                      💡 {scored.evidence_summary}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full"
                    title={`Total Score: ${scored.total_score.toFixed(3)}`}
                  >
                    {Math.round(scored.total_score * 100)}
                  </div>
                  <a
                    href={scored.law.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    원문
                  </a>
                </div>
              </div>

              {/* Law Text with Highlighting */}
              <div className="text-sm text-gray-700 mb-2 leading-relaxed">
                {renderHighlightedText(scored.law, scored.matched_rules)}
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1 mb-2">
                {scored.law.keywords.split(',').map((keyword, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {keyword}
                  </span>
                ))}
              </div>

              {/* Evidence Toggle Button */}
              {scored.matched_rules.length > 0 && (
                <button
                  onClick={() => toggleEvidence(scored.law.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {isExpanded ? '▼' : '▶'} 근거 보기 ({scored.matched_rules.length}개 규칙)
                </button>
              )}

              {/* Evidence Details */}
              {isExpanded && scored.matched_rules.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">매칭된 규칙:</div>
                  <div className="space-y-2">
                    {scored.matched_rules.map((rule, ruleIdx) => (
                      <div key={ruleIdx} className="text-xs">
                        <div className="font-semibold text-gray-800 mb-1">
                          🏷️ {rule.accident_type}
                        </div>
                        <div className="pl-4 space-y-1">
                          {rule.matches.map((match, matchIdx) => (
                            <div key={matchIdx} className="flex items-start gap-2">
                              <span className="font-medium text-gray-600 min-w-[60px]">
                                {match.type === 'keyword' ? '키워드' : '정규식'}:
                              </span>
                              <span className="text-gray-700">
                                <code className="bg-white px-1 py-0.5 rounded border border-gray-300">
                                  {match.pattern}
                                </code>
                                {match.matches.length > 0 && (
                                  <span className="ml-2 text-gray-500">
                                    ({match.matches.slice(0, 3).join(', ')}
                                    {match.matches.length > 3 && ` 외 ${match.matches.length - 3}개`})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
