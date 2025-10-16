/**
 * Preview component with skeleton → dummy → real data flow
 * Ensures users always see "something" in the preview area
 */

import { useState, useEffect } from 'react';
import type { OPSDocument } from '../lib/schemas/ops';

export type PreviewState = 'idle' | 'skeleton' | 'dummy' | 'generating' | 'ready' | 'error';

interface PreviewProps {
  state: PreviewState;
  data: OPSDocument | null;
  error: string | null;
  activeTab: 'summary' | 'causes' | 'checklist' | 'laws';
  onTabChange: (tab: 'summary' | 'causes' | 'checklist' | 'laws') => void;
}

/**
 * Skeleton loader component
 */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

/**
 * Skeleton UI for different tabs
 */
function SkeletonContent({ activeTab }: { activeTab: string }) {
  if (activeTab === 'summary') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Skeleton className="h-32 w-full mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (activeTab === 'causes') {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'checklist') {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 mb-3" />
        {[...Array(7)].map((_, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
            <div className="h-4 flex-1 animate-pulse bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'laws') {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 mb-3" />
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="border-l-2 border-gray-300 pl-3">
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Main Preview component
 */
export default function Preview({ state, data, error, activeTab, onTabChange }: PreviewProps) {
  const [showDummyTimer, setShowDummyTimer] = useState(false);

  // Show timer when generating (after 1 second)
  useEffect(() => {
    if (state === 'generating') {
      const timer = setTimeout(() => setShowDummyTimer(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowDummyTimer(false);
    }
  }, [state]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">실시간 미리보기</h2>
        {state === 'generating' && showDummyTimer && (
          <span className="text-xs text-blue-600 animate-pulse">⏱️ AI 분석 중...</span>
        )}
        {state === 'dummy' && (
          <span className="text-xs text-amber-600">📝 초안 (더미 데이터)</span>
        )}
        {state === 'ready' && (
          <span className="text-xs text-green-600">✓ 생성 완료</span>
        )}
      </div>

      {/* Idle state: Empty prompt */}
      {state === 'idle' && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-base font-medium mb-2">폼을 작성하면 미리보기가 표시됩니다</p>
          <p className="text-sm">재해 발생 일시, 장소, 유형, 원인을 입력하세요</p>
        </div>
      )}

      {/* Skeleton state: Loading animation */}
      {state === 'skeleton' && (
        <div>
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px space-x-4">
              {(['summary', 'causes', 'checklist', 'laws'] as const).map((tab) => (
                <div
                  key={tab}
                  className="py-2 px-3 text-sm font-medium border-b-2 border-transparent text-gray-400"
                >
                  {tab === 'summary' && '요약'}
                  {tab === 'causes' && '원인 분석'}
                  {tab === 'checklist' && '재발방지 체크리스트'}
                  {tab === 'laws' && '관련 법령'}
                </div>
              ))}
            </nav>
          </div>
          <SkeletonContent activeTab={activeTab} />
        </div>
      )}

      {/* Dummy/Generating/Ready state: Show data with tabs */}
      {(state === 'dummy' || state === 'generating' || state === 'ready') && data && (
        <div>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px space-x-4">
              {(['summary', 'causes', 'checklist', 'laws'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'summary' && '요약'}
                  {tab === 'causes' && '원인 분석'}
                  {tab === 'checklist' && '재발방지 체크리스트'}
                  {tab === 'laws' && '관련 법령'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="prose prose-sm max-w-none">
            {activeTab === 'summary' && (
              <div>
                <h3 className="text-base font-semibold mb-2">사고 개요</h3>

                {/* Illustration */}
                {data.imageMeta && data.imageMeta.type === 'generated' && data.imageMeta.url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={data.imageMeta.url}
                      alt="재해 상황 삽화"
                      className="w-full h-auto"
                    />
                    <p className="text-xs text-gray-500 p-2 bg-gray-50">
                      🤖 AI 생성 안전 교육 삽화
                    </p>
                  </div>
                )}

                {data.imageMeta && data.imageMeta.type === 'placeholder' && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 p-8 text-center">
                    <div className="text-6xl mb-2">🏗️</div>
                    <p className="text-sm text-gray-600">
                      {state === 'generating'
                        ? '삽화 생성 중... (AI 이미지 생성에는 시간이 걸릴 수 있습니다)'
                        : '삽화는 실제 데이터 생성 시 표시됩니다'}
                    </p>
                  </div>
                )}

                <p className="whitespace-pre-line text-gray-700">{data.summary}</p>
              </div>
            )}

            {activeTab === 'causes' && (
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">직접 원인</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.causes.direct.map((cause, idx) => (
                      <li key={idx} className="text-gray-700">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">간접 원인</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.causes.indirect.map((cause, idx) => (
                      <li key={idx} className="text-gray-700">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div>
                <h3 className="text-base font-semibold mb-2">재발방지 체크리스트</h3>
                <ul className="space-y-2">
                  {data.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" disabled />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'laws' && (
              <div>
                <h3 className="text-base font-semibold mb-2">관련 법령 및 규정</h3>
                {data.laws.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">관련 법령을 찾는 중입니다...</p>
                ) : (
                  <ul className="space-y-2">
                    {data.laws.map((law, idx) => (
                      <li key={idx} className="border-l-2 border-blue-500 pl-3">
                        <a
                          href={law.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {law.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">미리보기 생성 실패</p>
          <p className="text-sm text-gray-600">{error || '알 수 없는 오류가 발생했습니다'}</p>
          <p className="text-xs text-gray-500 mt-4">
            폼 내용을 확인하고 다시 시도해주세요
          </p>
        </div>
      )}
    </div>
  );
}
