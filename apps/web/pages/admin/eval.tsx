import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import goldenDataset from '../../fixtures/golden-dataset.json';
import {
  evaluateSingleCase,
  evaluateTestCases,
  type TestCase,
  type EvaluationResult,
  type DetailedMetrics,
} from '../../lib/eval/metrics';
import { generateTrendChart, generateMultiLineChart, type DataPoint, type MultiLineData } from '../../lib/eval/chart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface EvaluationHistory {
  version: string;
  date: string;
  results: EvaluationResult;
}

export default function EvaluationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentResults, setCurrentResults] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<EvaluationHistory[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<{ testCase: any; metrics: DetailedMetrics } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load evaluation history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('eval_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save evaluation history to localStorage
  const saveHistory = (newEntry: EvaluationHistory) => {
    const updated = [...history, newEntry];
    setHistory(updated);
    localStorage.setItem('eval_history', JSON.stringify(updated));
  };

  // Run evaluation on golden dataset
  const runEvaluation = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const testCases: TestCase[] = [];

      // Fetch law suggestions for each test case
      for (const testCase of goldenDataset.test_cases) {
        try {
          const response = await fetch(`${API_URL}/api/law/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incidentType: testCase.incident_type,
              incidentCause: testCase.incident_cause,
            }),
          });

          const data = await response.json();

          if (data.success && data.data && data.data.laws) {
            const predicted = data.data.laws.map((law: any) => law.title);

            testCases.push({
              id: testCase.id,
              description: testCase.description,
              incidentType: testCase.incident_type,
              incidentCause: testCase.incident_cause,
              predicted,
              relevant: testCase.relevant_laws,
            });
          } else {
            // Failed case: empty predictions
            testCases.push({
              id: testCase.id,
              description: testCase.description,
              incidentType: testCase.incident_type,
              incidentCause: testCase.incident_cause,
              predicted: [],
              relevant: testCase.relevant_laws,
            });
          }
        } catch (err) {
          console.error(`Error fetching laws for ${testCase.id}:`, err);
          testCases.push({
            id: testCase.id,
            description: testCase.description,
            incidentType: testCase.incident_type,
            incidentCause: testCase.incident_cause,
            predicted: [],
            relevant: testCase.relevant_laws,
          });
        }
      }

      // Calculate metrics
      const results = evaluateTestCases(testCases);
      setCurrentResults(results);

      // Save to history
      const newEntry: EvaluationHistory = {
        version: `v0.${history.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        results,
      };
      saveHistory(newEntry);

    } catch (err) {
      setError('평가 실행 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRunning(false);
    }
  };

  // View details for a specific case
  const viewCaseDetails = async (caseId: string) => {
    const testCase = goldenDataset.test_cases.find(tc => tc.id === caseId);
    if (!testCase) return;

    try {
      const response = await fetch(`${API_URL}/api/law/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType: testCase.incident_type,
          incidentCause: testCase.incident_cause,
        }),
      });

      const data = await response.json();
      const predicted = data.success && data.data?.laws
        ? data.data.laws.map((law: any) => law.title)
        : [];

      const metrics = evaluateSingleCase(predicted, testCase.relevant_laws);

      setCaseDetails({ testCase, metrics });
      setSelectedCase(caseId);
    } catch (err) {
      console.error('Failed to fetch case details:', err);
    }
  };

  // Generate trend charts
  const generateCharts = () => {
    if (history.length < 2) return null;

    const precisionData: DataPoint[] = history.map(h => ({
      version: h.version,
      date: h.date,
      value: h.results.precision_at_5,
    }));

    const recallData: DataPoint[] = history.map(h => ({
      version: h.version,
      date: h.date,
      value: h.results.recall_at_5,
    }));

    const mrrData: DataPoint[] = history.map(h => ({
      version: h.version,
      date: h.date,
      value: h.results.mrr,
    }));

    const multiLineData: MultiLineData = {
      'Precision@5': precisionData,
      'Recall@5': recallData,
      'MRR': mrrData,
    };

    return {
      precision: generateTrendChart(precisionData, 'Precision@5'),
      recall: generateTrendChart(recallData, 'Recall@5'),
      mrr: generateTrendChart(mrrData, 'MRR'),
      multi: generateMultiLineChart(multiLineData),
    };
  };

  const charts = generateCharts();

  return (
    <>
      <Head>
        <title>법령 추천 정확도 평가 | Safe OPS Studio</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">⚖️ 법령 추천 정확도 평가</h1>
                <p className="text-sm text-gray-600 mt-1">골든 데이터셋 기반 정량적 평가</p>
              </div>
              <Link
                href="/builder"
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Builder로 돌아가기
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Run Evaluation Button */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">평가 실행</h2>
                <p className="text-sm text-gray-600 mt-1">
                  골든 데이터셋 {goldenDataset.test_cases.length}건에 대해 현재 룰셋의 정확도를 평가합니다.
                </p>
              </div>
              <button
                onClick={runEvaluation}
                disabled={isRunning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isRunning ? '⏳ 평가 실행 중...' : '▶️ 평가 시작'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Current Results */}
          {currentResults && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 최근 평가 결과</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Precision@3"
                  value={currentResults.precision_at_3}
                  description="상위 3개 중 정답 비율"
                />
                <MetricCard
                  label="Recall@3"
                  value={currentResults.recall_at_3}
                  description="전체 정답 중 찾은 비율"
                />
                <MetricCard
                  label="MRR"
                  value={currentResults.mrr}
                  description="첫 정답의 평균 역순위"
                />
                <MetricCard
                  label="NDCG@5"
                  value={currentResults.ndcg_at_5}
                  description="순서를 고려한 품질"
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Precision@5</h3>
                  <p className="text-3xl font-bold text-blue-600">{(currentResults.precision_at_5 * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600 mt-1">F1@5: {(currentResults.f1_at_5 * 100).toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Recall@5</h3>
                  <p className="text-3xl font-bold text-green-600">{(currentResults.recall_at_5 * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600 mt-1">Total: {currentResults.total_cases} cases</p>
                </div>
              </div>
            </div>
          )}

          {/* History Table */}
          {history.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 평가 이력</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">버전</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">날짜</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">P@3</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">R@3</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">P@5</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">R@5</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">MRR</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">NDCG@5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{entry.version}</td>
                        <td className="px-4 py-2 text-gray-600">{entry.date}</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.precision_at_3 * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.recall_at_3 * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.precision_at_5 * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.recall_at_5 * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.mrr * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right text-gray-900">{(entry.results.ndcg_at_5 * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => {
                  if (confirm('평가 이력을 모두 삭제하시겠습니까?')) {
                    setHistory([]);
                    localStorage.removeItem('eval_history');
                  }
                }}
                className="mt-4 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ 이력 삭제
              </button>
            </div>
          )}

          {/* Trend Charts */}
          {charts && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📉 메트릭 추세 그래프</h2>

              <div className="space-y-6">
                <div dangerouslySetInnerHTML={{ __html: charts.multi }} />

                <div className="grid md:grid-cols-2 gap-6">
                  <div dangerouslySetInnerHTML={{ __html: charts.precision }} />
                  <div dangerouslySetInnerHTML={{ __html: charts.recall }} />
                </div>

                <div dangerouslySetInnerHTML={{ __html: charts.mrr }} />
              </div>
            </div>
          )}

          {/* Test Cases List */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🧪 골든 데이터셋 ({goldenDataset.test_cases.length}건)</h2>

            <div className="space-y-3">
              {goldenDataset.test_cases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => viewCaseDetails(testCase.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {testCase.id}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {testCase.incident_type}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{testCase.description}</h3>
                      <p className="text-sm text-gray-600 mt-1">{testCase.incident_cause.substring(0, 100)}...</p>
                    </div>
                    <button className="ml-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                      상세보기 →
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {testCase.relevant_laws.map((law, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        ✓ {law}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Details Modal */}
          {caseDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{caseDetails.testCase.id} 상세</h3>
                  <button
                    onClick={() => setCaseDetails(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">사고 설명</h4>
                    <p className="text-gray-700">{caseDetails.testCase.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">사고 원인</h4>
                    <p className="text-gray-700">{caseDetails.testCase.incident_cause}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="P@3" value={caseDetails.metrics.precision_at_3} small />
                    <MetricCard label="R@3" value={caseDetails.metrics.recall_at_3} small />
                    <MetricCard label="MRR" value={caseDetails.metrics.mrr} small />
                    <MetricCard label="NDCG@5" value={caseDetails.metrics.ndcg_at_5} small />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">✅ 정답 법령 ({caseDetails.testCase.relevant_laws.length}개)</h4>
                    <div className="space-y-1">
                      {caseDetails.testCase.relevant_laws.map((law: string, idx: number) => (
                        <div key={idx} className="px-3 py-2 bg-green-50 text-green-800 text-sm rounded border border-green-200">
                          {law}
                        </div>
                      ))}
                    </div>
                  </div>

                  {caseDetails.metrics.matched_laws.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 매칭된 법령 ({caseDetails.metrics.matched_laws.length}개)</h4>
                      <div className="space-y-1">
                        {caseDetails.metrics.matched_laws.map((law, idx) => (
                          <div key={idx} className="px-3 py-2 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200">
                            {law}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {caseDetails.metrics.missed_laws.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">❌ 누락된 법령 ({caseDetails.metrics.missed_laws.length}개)</h4>
                      <div className="space-y-1">
                        {caseDetails.metrics.missed_laws.map((law, idx) => (
                          <div key={idx} className="px-3 py-2 bg-red-50 text-red-800 text-sm rounded border border-red-200">
                            {law}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setCaseDetails(null)}
                  className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: number;
  description?: string;
  small?: boolean;
}

function MetricCard({ label, value, description, small = false }: MetricCardProps) {
  const percentage = (value * 100).toFixed(1);
  const color = value >= 0.7 ? 'text-green-600' : value >= 0.5 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${small ? '' : 'border border-gray-200'}`}>
      <h3 className={`font-semibold text-gray-900 ${small ? 'text-sm' : ''}`}>{label}</h3>
      <p className={`font-bold ${color} ${small ? 'text-xl' : 'text-3xl'} mt-1`}>
        {percentage}%
      </p>
      {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
    </div>
  );
}
