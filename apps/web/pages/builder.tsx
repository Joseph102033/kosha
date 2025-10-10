import { useState, useEffect } from 'react';
import Head from 'next/head';
import { fetchWithAuth, getAccessKey, setAccessKey } from '../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface OPSFormData {
  title: string;
  incidentDate: string;
  location: string;
  agentObject: string;
  hazardObject: string;
  incidentType: string;
  incidentCause: string;
}

interface LawReference {
  title: string;
  url: string;
}

interface OPSDocument {
  summary: string;
  causes: {
    direct: string[];
    indirect: string[];
  };
  checklist: string[];
  laws: LawReference[];
  imageMeta?: {
    type: 'placeholder' | 'generated';
    url?: string;
  };
}

export default function Builder() {
  const [formData, setFormData] = useState<OPSFormData>({
    title: '',
    incidentDate: '',
    location: '',
    agentObject: '',
    hazardObject: '',
    incidentType: '',
    incidentCause: '',
  });

  const [preview, setPreview] = useState<OPSDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  // Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAccessKey, setHasAccessKey] = useState(false);

  // Check for access key on mount
  useEffect(() => {
    setHasAccessKey(!!getAccessKey());
  }, []);

  // Debounced preview generation
  useEffect(() => {
    const generatePreview = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetchWithAuth(`${API_URL}/api/ops/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.status === 401) {
          setError('Unauthorized: Please enter your access key');
          setShowAuthModal(true);
          return;
        }

        const data = await response.json();

        if (data.success && data.data) {
          setPreview(data.data);
        } else {
          setError(data.error || 'Failed to generate preview');
        }
      } catch (err) {
        setError('Network error: Unable to connect to API');
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(() => {
      if (formData.incidentDate && formData.location && formData.incidentType && formData.incidentCause) {
        generatePreview();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (field: keyof OPSFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = async () => {
    if (!preview) {
      setPublishError('Please wait for preview to generate');
      return;
    }

    if (!formData.title.trim()) {
      setPublishError('Please enter a title for this OPS document');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await fetchWithAuth(`${API_URL}/api/ops/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          incidentDate: formData.incidentDate,
          location: formData.location,
          agentObject: formData.agentObject,
          hazardObject: formData.hazardObject,
          incidentType: formData.incidentType,
          incidentCause: formData.incidentCause,
          opsDocument: preview,
        }),
      });

      if (response.status === 401) {
        setPublishError('Unauthorized: Please enter your access key');
        setShowAuthModal(true);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setPublishedUrl(data.data.publicUrl);
      } else {
        setPublishError(data.error || 'Failed to publish OPS document');
      }
    } catch (err) {
      setPublishError('Network error: Unable to publish OPS document');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (publishedUrl) {
      const fullUrl = `${window.location.origin}${publishedUrl}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  const handleSaveAccessKey = () => {
    if (accessKeyInput.trim()) {
      setAccessKey(accessKeyInput.trim());
      setHasAccessKey(true);
      setShowAuthModal(false);
      setAccessKeyInput('');
    }
  };

  return (
    <>
      <Head>
        <title>OPS 작성 도구 | 안전 OPS 뉴스레터</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OPS 작성 도구</h1>
                <p className="text-sm text-gray-600 mt-1">재해 정보를 입력하여 OPS 자료를 자동 생성합니다</p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {hasAccessKey ? '🔑 키 변경' : '🔑 액세스 키 입력'}
              </button>
            </div>
          </div>
        </header>

        {/* OPS Introduction Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                중대재해 개요를 손쉽게 OPS 요약자료로 편집하세요
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                중대재해 개요를 입력하시면 10분만에 관련 법령 / 근본 원인 / 재발방지 체크리스트를 작성해 드립니다
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  빠른 자동 작성
                </h3>
                <p className="text-gray-600">
                  10분 이내에 종합적인 OPS 자료를 생성합니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  관련 법령 조회
                </h3>
                <p className="text-gray-600">
                  산업안전보건법 등 관련 법령을 자동으로 매칭합니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  재발방지 체크리스트
                </h3>
                <p className="text-gray-600">
                  유사 재해 예방을 위한 실행 가능한 체크리스트를 제공합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">재해 정보 입력</h2>

              <form className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    OPS 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="예: 비계 추락사고 - 2025년 1월"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Incident Date */}
                <div>
                  <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    재해 발생 일시 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="incidentDate"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    재해 발생 장소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="예: 서울 건설현장 A동"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Agent Object (Optional) */}
                <div>
                  <label htmlFor="agentObject" className="block text-sm font-medium text-gray-700 mb-1">
                    재해자 <span className="text-gray-400">(선택)</span>
                  </label>
                  <input
                    type="text"
                    id="agentObject"
                    value={formData.agentObject}
                    onChange={(e) => handleInputChange('agentObject', e.target.value)}
                    placeholder="예: 작업자, 기계 조작자"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Hazard Object (Optional) */}
                <div>
                  <label htmlFor="hazardObject" className="block text-sm font-medium text-gray-700 mb-1">
                    기인물 <span className="text-gray-400">(선택)</span>
                  </label>
                  <input
                    type="text"
                    id="hazardObject"
                    value={formData.hazardObject}
                    onChange={(e) => handleInputChange('hazardObject', e.target.value)}
                    placeholder="예: 비계, 화학물질 용기"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Incident Type */}
                <div>
                  <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 mb-1">
                    재해 발생 형태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="incidentType"
                    value={formData.incidentType}
                    onChange={(e) => handleInputChange('incidentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">재해 유형 선택</option>
                    <option value="Fall">추락</option>
                    <option value="Chemical Spill">화학물질 누출</option>
                    <option value="Fire">화재</option>
                    <option value="Explosion">폭발</option>
                    <option value="Equipment Failure">장비 고장</option>
                    <option value="Other">기타</option>
                  </select>
                </div>

                {/* Incident Cause */}
                <div>
                  <label htmlFor="incidentCause" className="block text-sm font-medium text-gray-700 mb-1">
                    재해 발생 원인 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="incidentCause"
                    value={formData.incidentCause}
                    onChange={(e) => handleInputChange('incidentCause', e.target.value)}
                    placeholder="재해의 주요 원인을 상세히 기술해 주세요..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {isGenerating && (
                    <span className="text-blue-600">⏳ 미리보기 생성 중...</span>
                  )}
                  {error && (
                    <span className="text-red-600">⚠️ {error}</span>
                  )}
                  {preview && !isGenerating && !error && (
                    <span className="text-green-600">✓ 미리보기 생성 완료</span>
                  )}
                </div>

                {/* Publish Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || !preview || !formData.title.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isPublishing ? '📤 발행 중...' : '📤 OPS 문서 발행'}
                  </button>
                  {publishError && (
                    <p className="text-red-600 text-sm mt-2">⚠️ {publishError}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Live Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">실시간 미리보기</h2>

              {!preview && (
                <div className="text-center py-12 text-gray-400">
                  <p>폼을 작성하면 미리보기가 표시됩니다</p>
                </div>
              )}

              {preview && (
                <div>
                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="flex -mb-px space-x-4">
                      {(['summary', 'causes', 'checklist', 'laws'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
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
                        <p className="whitespace-pre-line text-gray-700">{preview.summary}</p>
                      </div>
                    )}

                    {activeTab === 'causes' && (
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">직접 원인</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {preview.causes.direct.map((cause, idx) => (
                              <li key={idx} className="text-gray-700">{cause}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">간접 원인</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {preview.causes.indirect.map((cause, idx) => (
                              <li key={idx} className="text-gray-700">{cause}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === 'checklist' && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">재발방지 체크리스트</h3>
                        <ul className="space-y-2">
                          {preview.checklist.map((item, idx) => (
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
                        <ul className="space-y-2">
                          {preview.laws.map((law, idx) => (
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
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 액세스 키 필요</h3>
              <p className="text-gray-600 mb-6">
                OPS 문서를 생성하고 발행하려면 관리자 액세스 키가 필요합니다.
              </p>
              <input
                type="password"
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAccessKey()}
                placeholder="액세스 키를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAccessKey}
                  disabled={!accessKeyInput.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAccessKeyInput('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                💡 액세스 키는 브라우저에 로컬 저장되며, 인증 목적으로만 서버에 전송됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {publishedUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ OPS 문서 발행 완료!</h3>
              <p className="text-gray-600 mb-6">
                OPS 문서가 성공적으로 발행되었습니다. 아래 공개 URL로 접근할 수 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">공개 URL:</p>
                <p className="text-blue-600 break-all">{window.location.origin}{publishedUrl}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyPublicUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📋 링크 복사
                </button>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
                >
                  👁️ 페이지 보기
                </a>
              </div>
              <button
                onClick={() => setPublishedUrl(null)}
                className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
