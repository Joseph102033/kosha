/**
 * Interactive Law Suggestion Panel Component
 * Features: Checkbox selection, drag-and-drop reordering, anonymous feedback storage
 */

import { useState, useEffect } from 'react';
import { highlightMultipleTypes } from '../../utils/highlight';

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
}

interface LawSelection {
  law_id: string;
  included: boolean;
  order: number;
  feedback_reason?: string;
}

interface LawSuggestPanelProps {
  summary: string;
  incidentType: string;
  causativeObject: string;
  workProcess: string;
  limit?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function LawSuggestPanelInteractive({
  summary,
  incidentType,
  causativeObject,
  workProcess,
  limit = 12,
}: LawSuggestPanelProps) {
  // Core suggestion state
  const [suggestions, setSuggestions] = useState<ScoredLaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User selection state
  const [selections, setSelections] = useState<Map<string, LawSelection>>(new Map());
  const [orderedLawIds, setOrderedLawIds] = useState<string[]>([]);
  const [expandedLaws, setExpandedLaws] = useState<Set<string>>(new Set());

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Feedback state
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch suggestions when inputs change
  useEffect(() => {
    fetchSuggestions();
  }, [summary, incidentType, causativeObject, workProcess, limit]);

  // Generate document hash and restore saved feedback
  useEffect(() => {
    if (suggestions.length > 0 && (summary || incidentType || causativeObject || workProcess)) {
      generateAndRestoreFeedback();
    }
  }, [suggestions, summary, incidentType, causativeObject, workProcess]);

  const fetchSuggestions = async () => {
    const hasInput = summary || incidentType || causativeObject || workProcess;
    if (!hasInput) {
      setSuggestions([]);
      setSelections(new Map());
      setOrderedLawIds([]);
      setFeedbackSaved(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFeedbackSaved(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/laws/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const fetchedSuggestions = data.data.suggestions;
        setSuggestions(fetchedSuggestions);

        // Initialize selections (all included by default)
        const initialSelections = new Map<string, LawSelection>();
        const initialOrder: string[] = [];

        fetchedSuggestions.forEach((scored: ScoredLaw, index: number) => {
          initialSelections.set(scored.law.id, {
            law_id: scored.law.id,
            included: true,
            order: index,
          });
          initialOrder.push(scored.law.id);
        });

        setSelections(initialSelections);
        setOrderedLawIds(initialOrder);
      } else {
        setError(data.error || 'Failed to fetch law suggestions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch law suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateAndRestoreFeedback = async () => {
    try {
      // Generate document hash
      const hashResponse = await fetch(`${API_BASE_URL}/api/feedback/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          incident_type: incidentType,
          causative_object: causativeObject,
          work_process: workProcess,
        }),
      });

      const hashData = await hashResponse.json();
      if (!hashData.success) return;

      const hash = hashData.data.document_hash;
      setDocumentHash(hash);

      // Try to restore saved feedback
      const feedbackResponse = await fetch(`${API_BASE_URL}/api/feedback/laws?hash=${hash}`);
      const feedbackData = await feedbackResponse.json();

      if (feedbackData.success && feedbackData.data) {
        // Restore saved selections
        const savedSelections = new Map<string, LawSelection>();
        const savedOrder: string[] = [];

        // Sort by order
        const sortedSaved = [...feedbackData.data.selections].sort((a, b) => a.order - b.order);

        sortedSaved.forEach((sel: LawSelection) => {
          savedSelections.set(sel.law_id, sel);
          if (sel.included) {
            savedOrder.push(sel.law_id);
          }
        });

        // Merge with current suggestions (handle new laws not in saved data)
        suggestions.forEach((scored) => {
          if (!savedSelections.has(scored.law.id)) {
            // New law not in saved feedback - add as included
            savedSelections.set(scored.law.id, {
              law_id: scored.law.id,
              included: true,
              order: savedOrder.length,
            });
            savedOrder.push(scored.law.id);
          }
        });

        setSelections(savedSelections);
        setOrderedLawIds(savedOrder);
        setFeedbackSaved(true);
      }
    } catch (err) {
      console.error('Failed to restore feedback:', err);
    }
  };

  const toggleInclusion = (lawId: string) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(lawId);
      if (current) {
        newSelections.set(lawId, { ...current, included: !current.included });
      }
      return newSelections;
    });

    // Update ordered list
    setOrderedLawIds((prev) => {
      const isIncluded = selections.get(lawId)?.included;
      if (isIncluded) {
        // Currently included, remove from order
        return prev.filter((id) => id !== lawId);
      } else {
        // Currently excluded, add to end of order
        return [...prev, lawId];
      }
    });

    setFeedbackSaved(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...orderedLawIds];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setOrderedLawIds(newOrder);
    setDraggedIndex(index);
    setFeedbackSaved(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveFeedback = async () => {
    if (!documentHash) {
      showToast('문서 해시를 생성할 수 없습니다', 'error');
      return;
    }

    setSavingFeedback(true);

    try {
      // Prepare selections with updated order
      const selectionsArray: LawSelection[] = [];

      // Add included laws in order
      orderedLawIds.forEach((lawId, index) => {
        const sel = selections.get(lawId);
        if (sel && sel.included) {
          selectionsArray.push({ ...sel, order: index });
        }
      });

      // Add excluded laws
      selections.forEach((sel) => {
        if (!sel.included) {
          selectionsArray.push(sel);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/feedback/laws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          incident_type: incidentType,
          causative_object: causativeObject,
          work_process: workProcess,
          selections: selectionsArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackSaved(true);
        showToast('내 선택이 저장되었습니다 ✓', 'success');
      } else {
        showToast('저장 실패: ' + (data.error || '알 수 없는 오류'), 'error');
      }
    } catch (err) {
      showToast('저장 실패: ' + (err instanceof Error ? err.message : '네트워크 오류'), 'error');
    } finally {
      setSavingFeedback(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
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
    if (!scored.confidence || !scored.confidence_level) return null;

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

    const segments = highlightMultipleTypes(law.text, allKeywords, allRegex);

    return segments.map((segment, idx) => {
      if (segment.isHighlighted) {
        return (
          <mark key={idx} className="bg-yellow-200 px-1 rounded" title={`${segment.matchType}: ${segment.pattern}`}>
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

  const includedCount = orderedLawIds.filter((id) => selections.get(id)?.included).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              추천 법령 {feedbackSaved && <span className="text-green-600 text-sm ml-2">✓ 반영됨</span>}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              총 {suggestions.length}개 법령 · {includedCount}개 선택됨
            </p>
          </div>
          <button
            onClick={saveFeedback}
            disabled={savingFeedback || feedbackSaved}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              feedbackSaved
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {savingFeedback ? '저장 중...' : feedbackSaved ? '✓ 저장됨' : '내 선택 고정'}
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-gray-200">
        {orderedLawIds.map((lawId, index) => {
          const scored = suggestions.find((s) => s.law.id === lawId);
          if (!scored) return null;

          const selection = selections.get(lawId);
          if (!selection) return null;

          const isIncluded = selection.included;
          const isExpanded = expandedLaws.has(lawId);
          const isDragging = draggedIndex === index;

          return (
            <div
              key={lawId}
              draggable={isIncluded}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`px-6 py-4 transition-all ${isDragging ? 'opacity-50' : ''} ${
                isIncluded ? 'bg-white hover:bg-gray-50 cursor-move' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isIncluded}
                  onChange={() => toggleInclusion(lawId)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />

                {/* Order Number */}
                {isIncluded && (
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {index + 1}
                  </div>
                )}

                {/* Law Content */}
                <div className="flex-1">
                  {/* Law Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {scored.law.law_title}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {scored.law.article_no}
                          {scored.law.clause_no && ` ${scored.law.clause_no}`}
                        </span>
                        {getConfidenceBadge(scored)}
                      </div>
                      {scored.evidence_summary && (
                        <div className="mt-1 text-xs text-gray-600 italic">💡 {scored.evidence_summary}</div>
                      )}
                    </div>
                    <a
                      href={scored.law.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
                    >
                      원문
                    </a>
                  </div>

                  {/* Law Text */}
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

                  {/* Evidence Toggle */}
                  {scored.matched_rules.length > 0 && (
                    <button
                      onClick={() => toggleEvidence(lawId)}
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
                            <div className="font-semibold text-gray-800 mb-1">🏷️ {rule.accident_type}</div>
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
