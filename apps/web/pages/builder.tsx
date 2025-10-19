import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { fetchWithAuth, getAccessKey, setAccessKey } from '../lib/auth';
import type { OPSFormData, OPSDocument } from '../lib/schemas/ops';
import { isFormReadyForPreview, validateOPSDocument } from '../lib/schemas/ops';
import { generateDummyOPS } from '../lib/dummy-ops';
import { demoSamples } from '../lib/demo-samples';
import Preview, { PreviewState } from '../components/Preview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

export default function Builder() {
  const [formData, setFormData] = useState<Partial<OPSFormData>>({
    title: '',
    incidentDate: '',
    location: '',
    agentObject: '',
    hazardObject: '',
    incidentType: '',
    incidentCause: '',
  });

  // Preview state machine: idle → skeleton → dummy → generating → ready/error
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const [preview, setPreview] = useState<OPSDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dummyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedOpsId, setPublishedOpsId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Email sending state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Subscriber list state
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string }>>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAccessKey, setHasAccessKey] = useState(false);

  // Check for access key on mount
  useEffect(() => {
    setHasAccessKey(!!getAccessKey());
  }, []);

  // Preview generation with skeleton → dummy → real data flow
  useEffect(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (dummyTimerRef.current) {
      clearTimeout(dummyTimerRef.current);
    }

    // Check if form is ready for preview
    if (!isFormReadyForPreview(formData)) {
      setPreviewState('idle');
      setPreview(null);
      setError(null);
      return;
    }

    // Step 1: Show skeleton immediately
    setPreviewState('skeleton');
    setError(null);

    // Step 2: Show dummy data after 300ms (fast feedback)
    dummyTimerRef.current = setTimeout(() => {
      const dummyData = generateDummyOPS(formData);
      setPreview(dummyData);
      setPreviewState('dummy');
    }, 300);

    // Step 3: Generate real data after 1 second debounce
    debounceTimerRef.current = setTimeout(async () => {
      setPreviewState('generating');

      try {
        const response = await fetch(`${API_URL}/api/ops/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success && data.data) {
          // Validate with Zod schema
          const validation = validateOPSDocument(data.data);
          if (validation.success) {
            setPreview(validation.data);
            setPreviewState('ready');
            setError(null);
          } else {
            console.error('OPS validation failed:', validation.error);
            // Fall back to dummy data on validation error
            setPreviewState('dummy');
            setError('Data validation warning: ' + validation.error);
          }
        } else {
          // API error: keep dummy data and show error
          setError(data.error || 'Failed to generate preview');
          setPreviewState('dummy');
        }
      } catch (err) {
        console.error('Preview generation error:', err);
        // Network error: keep dummy data as fallback
        setError('Network error: Using offline preview');
        setPreviewState('dummy');
      }
    }, 1000);

    // Cleanup timers
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (dummyTimerRef.current) {
        clearTimeout(dummyTimerRef.current);
      }
    };
  }, [formData]);

  const handleInputChange = (field: keyof OPSFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadDemoSample = (sampleId: string) => {
    const sample = demoSamples.find(s => s.id === sampleId);
    if (sample) {
      setFormData(sample.formData);
    }
  };

  const handlePublish = async () => {
    if (!preview) {
      setPublishError('Please wait for preview to generate');
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      setPublishError('Please enter a title for this OPS document');
      return;
    }

    // Ensure all required fields are present
    if (!formData.incidentDate || !formData.location || !formData.incidentType || !formData.incidentCause) {
      setPublishError('Please fill all required fields');
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
          agentObject: formData.agentObject || '',
          hazardObject: formData.hazardObject || '',
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
        setPublishedOpsId(data.data.opsId);
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

  const loadSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/subscribers`, {
        method: 'GET',
      });

      if (response.status === 401) {
        setEmailError('인증 오류: 액세스 키를 확인해주세요');
        setShowAuthModal(true);
        return;
      }

      const data = await response.json();

      if (data.success && data.data && data.data.subscribers) {
        setSubscribers(data.data.subscribers);
      } else {
        setEmailError('구독자 목록을 불러올 수 없습니다');
      }
    } catch (err) {
      setEmailError('네트워크 오류: 구독자 목록을 불러올 수 없습니다');
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const toggleSubscriber = (email: string) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedSubscribers(newSelected);
  };

  const toggleAllSubscribers = () => {
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map(s => s.email)));
    }
  };

  const handleSendEmail = async () => {
    if (!publishedUrl || !publishedOpsId) {
      setEmailError('발행된 OPS 문서가 없습니다');
      return;
    }

    // Combine selected subscribers + manual input emails
    const manualEmails = emailRecipients
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const emails = [
      ...Array.from(selectedSubscribers),
      ...manualEmails,
    ];

    // Remove duplicates
    const uniqueEmails = Array.from(new Set(emails));

    if (uniqueEmails.length === 0) {
      setEmailError('이메일 주소를 입력하거나 구독자를 선택해주세요');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = uniqueEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setEmailError(`잘못된 이메일 주소: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSendingEmail(true);
    setEmailError(null);
    setEmailSendResult(null);

    try {
      const fullUrl = `${window.location.origin}${publishedUrl}`;

      const response = await fetchWithAuth(`${API_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opsId: publishedOpsId,
          publicUrl: fullUrl,
          recipients: uniqueEmails,
        }),
      });

      if (response.status === 401) {
        setEmailError('인증 오류: 액세스 키를 확인해주세요');
        setShowAuthModal(true);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setEmailSendResult({
          sent: data.data.sent,
          failed: data.data.failed,
        });
        setEmailRecipients(''); // Clear input on success
      } else {
        setEmailError(data.error || '이메일 발송 실패');
      }
    } catch (err) {
      setEmailError('네트워크 오류: 이메일을 발송할 수 없습니다');
    } finally {
      setIsSendingEmail(false);
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
          {/* Demo Samples Section */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  실제 사례로 빠르게 시작하기
                </h3>
                <p className="text-sm text-gray-600">
                  아래 버튼을 클릭하면 실제 재해 사례 데이터가 자동으로 입력됩니다
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {demoSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadDemoSample(sample.id)}
                  className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg transition-all text-left group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{sample.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{sample.label}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{sample.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
                    value={formData.title || ''}
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
                    value={formData.incidentDate || ''}
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
                    value={formData.location || ''}
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
                    value={formData.agentObject || ''}
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
                    value={formData.hazardObject || ''}
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
                    value={formData.incidentType || ''}
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
                    value={formData.incidentCause || ''}
                    onChange={(e) => handleInputChange('incidentCause', e.target.value)}
                    placeholder="재해의 주요 원인을 상세히 기술해 주세요..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Status Indicator */}
                {error && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    ⚠️ {error}
                  </div>
                )}

                {/* Publish Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || !preview || !formData.title?.trim()}
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

            {/* Right: Live Preview - Use Preview Component */}
            <Preview
              state={previewState}
              data={preview}
              error={error}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
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
              <div className="flex gap-3 mb-3">
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

              {/* Email Send Button - Admin Only */}
              {hasAccessKey && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-3"
                >
                  📧 이메일로 공유 (관리자 전용)
                </button>
              )}

              <button
                onClick={() => {
                  setPublishedUrl(null);
                  setPublishedOpsId(null);
                }}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Email Send Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📧 이메일로 OPS 공유</h3>

              {/* Subscriber List Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900">뉴스레터 구독자</h4>
                  <button
                    onClick={loadSubscribers}
                    disabled={isLoadingSubscribers}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                  >
                    {isLoadingSubscribers ? '⏳ 로딩 중...' : '🔄 구독자 불러오기'}
                  </button>
                </div>

                {subscribers.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                    <div className="mb-3">
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                          onChange={toggleAllSubscribers}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-700">
                          전체 선택 ({subscribers.length}명)
                        </span>
                      </label>
                    </div>
                    <div className="space-y-1">
                      {subscribers.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.has(sub.email)}
                            onChange={() => toggleSubscriber(sub.email)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{sub.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {subscribers.length === 0 && !isLoadingSubscribers && (
                  <p className="text-sm text-gray-500 italic">
                    구독자 목록을 불러오려면 위 버튼을 클릭하세요
                  </p>
                )}
              </div>

              {/* Manual Email Input Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">추가 이메일 주소 (선택)</h4>
                <p className="text-sm text-gray-600 mb-2">
                  여러 주소는 쉼표(,) 또는 줄바꿈으로 구분합니다.
                </p>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="예:&#10;hong@example.com,&#10;kim@example.com&#10;lee@example.com"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Selected Count */}
              {(selectedSubscribers.size > 0 || emailRecipients.trim()) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📮 총 <strong>{selectedSubscribers.size + emailRecipients.split(/[,\n]/).filter(e => e.trim()).length}</strong>명에게 발송됩니다
                  </p>
                </div>
              )}

              {emailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">⚠️ {emailError}</p>
                </div>
              )}

              {emailSendResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 text-sm font-medium">
                    ✅ 발송 완료: {emailSendResult.sent}건
                    {emailSendResult.failed > 0 && ` / 실패: ${emailSendResult.failed}건`}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || (selectedSubscribers.size === 0 && !emailRecipients.trim())}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSendingEmail ? '📤 발송 중...' : '📤 이메일 발송'}
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailRecipients('');
                    setEmailError(null);
                    setEmailSendResult(null);
                    setSelectedSubscribers(new Set());
                    setSubscribers([]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  취소
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                💡 이메일에는 OPS 문서 링크와 요약 정보가 포함됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
