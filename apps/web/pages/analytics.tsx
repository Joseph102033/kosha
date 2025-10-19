import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface AnalyticsData {
  total_ops: number;
  total_subscribers: number;
  ops_by_type: Array<{
    incident_type: string;
    count: number;
  }>;
  recent_ops: Array<{
    id: string;
    title: string;
    incident_type: string;
    created_at: string;
  }>;
  law_ruleset_version: string;
}

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  'Fall': '추락',
  'Equipment Failure': '기계설비 고장/끼임',
  'Chemical Spill': '화학물질 누출',
  'Electrical': '감전',
  'Fire': '화재',
  'Explosion': '폭발',
  'Caught': '끼임',
  'Struck': '맞음',
  'Other': '기타',
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('https://safe-ops-studio-workers.yosep102033.workers.dev/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">⚠️ {error || '데이터를 불러올 수 없습니다'}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // Calculate prevention impact metrics
  const preventionScore = Math.min(100, data.total_ops * 3); // 3 points per OPS
  const estimatedPrevention = data.total_ops * 2; // Estimate 2 potential accidents prevented per OPS

  return (
    <>
      <Head>
        <title>통계 대시보드 - Safe OPS Studio</title>
        <meta name="description" content="OPS 생성 통계 및 산재 예방 효과" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
              ← 홈으로
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 통계 대시보드</h1>
            <p className="text-gray-600">
              OPS 생성 통계 및 산재 예방 효과 측정
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total OPS */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">생성된 OPS</h3>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{data.total_ops}</p>
              <p className="text-xs text-gray-500 mt-1">안전 교육 자료</p>
            </div>

            {/* Total Subscribers */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">뉴스레터 구독자</h3>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{data.total_subscribers}</p>
              <p className="text-xs text-gray-500 mt-1">활성 구독자</p>
            </div>

            {/* Prevention Score */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">예방 점수</h3>
                <span className="text-2xl">🛡️</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{preventionScore}</p>
              <p className="text-xs text-gray-500 mt-1">
                예상 예방: ~{estimatedPrevention}건 재해
              </p>
            </div>
          </div>

          {/* OPS by Incident Type */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">재해 유형별 OPS 생성 현황</h2>
            {data.ops_by_type.length > 0 ? (
              <div className="space-y-3">
                {data.ops_by_type.map((item, index) => {
                  const label = INCIDENT_TYPE_LABELS[item.incident_type] || item.incident_type;
                  const percentage = data.total_ops > 0
                    ? ((item.count / data.total_ops) * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-sm text-gray-600">
                          {item.count}건 ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">아직 생성된 OPS가 없습니다</p>
            )}
          </div>

          {/* Recent OPS */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">최근 생성된 OPS</h2>
            {data.recent_ops.length > 0 ? (
              <div className="space-y-3">
                {data.recent_ops.map((ops, index) => {
                  const typeLabel = INCIDENT_TYPE_LABELS[ops.incident_type] || ops.incident_type;
                  const date = new Date(ops.created_at).toLocaleDateString('ko-KR');

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-2xl">{index + 1}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{ops.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {typeLabel}
                          </span>
                          <span className="text-xs text-gray-500">{date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">아직 생성된 OPS가 없습니다</p>
            )}
          </div>

          {/* System Info */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">시스템 정보</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">법령 룰셋 버전</p>
                <p className="font-semibold text-gray-900">v0.1 ({data.law_ruleset_version})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">AI 모델</p>
                <p className="font-semibold text-gray-900">Google Gemini 2.5 Flash</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">데이터베이스</p>
                <p className="font-semibold text-gray-900">Cloudflare D1 (SQLite)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">배포 환경</p>
                <p className="font-semibold text-gray-900">Cloudflare Pages + Workers</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Link
              href="/builder"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              ✍️ 새 OPS 만들기 →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
