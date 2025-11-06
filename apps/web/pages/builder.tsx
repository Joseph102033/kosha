import { useState } from 'react';
import Head from 'next/head';
import Preview from '../components/Preview';
import { demoSamples } from '../lib/demo-samples';

// Custom hooks
import { useAuth } from '../hooks/useAuth';
import { useOPSForm } from '../hooks/useOPSForm';
import { useOPSPublish } from '../hooks/useOPSPublish';
import { useOPSPreview } from '../hooks/useOPSPreview';
import { useEmailSend } from '../hooks/useEmailSend';

// Modal components
import AuthModal from '../components/modals/AuthModal';
import PublishSuccessModal from '../components/modals/PublishSuccessModal';
import EmailSendModal from '../components/modals/EmailSendModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

export default function Builder() {
  // Initialize custom hooks
  const auth = useAuth();
  const form = useOPSForm();
  const preview = useOPSPreview(form.formData, API_URL);
  const publish = useOPSPublish(API_URL, () => auth.setShowAuthModal(true));
  const email = useEmailSend(API_URL, () => auth.setShowAuthModal(true));

  // Keep activeTab state for UI (if needed separately, otherwise use preview.activeTab)
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  return (
    <>
      <Head>
        <title>OPS 작성 도구 | 안전 OPS 뉴스레터</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">OPS 작성 도구</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">재해 정보를 입력하여 OPS 자료를 자동 생성합니다</p>
              </div>
              <button
                onClick={() => auth.setShowAuthModal(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap self-end sm:self-auto"
              >
                {auth.hasAccessKey ? '🔑 키 변경' : '🔑 액세스 키 입력'}
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
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3 mb-4">
              <span className="text-xl sm:text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  실제 사례로 빠르게 시작하기
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  아래 버튼을 클릭하면 실제 재해 사례 데이터가 자동으로 입력됩니다
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {demoSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => form.loadDemoSample(sample.id)}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-200 hover:border-blue-400 rounded-lg transition-all text-left group"
                >
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform flex-shrink-0">{sample.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{sample.label}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{sample.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Input Form */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">재해 정보 입력</h2>

              <form className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    OPS 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={form.formData.title || ''}
                    onChange={(e) => form.handleInputChange('title', e.target.value)}
                    placeholder="예: 비계 추락사고 - 2025년 1월"
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={form.formData.incidentDate || ''}
                    onChange={(e) => form.handleInputChange('incidentDate', e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={form.formData.location || ''}
                    onChange={(e) => form.handleInputChange('location', e.target.value)}
                    placeholder="예: 서울 건설현장 A동"
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={form.formData.agentObject || ''}
                    onChange={(e) => form.handleInputChange('agentObject', e.target.value)}
                    placeholder="예: 작업자, 기계 조작자"
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={form.formData.hazardObject || ''}
                    onChange={(e) => form.handleInputChange('hazardObject', e.target.value)}
                    placeholder="예: 비계, 화학물질 용기"
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Incident Type */}
                <div>
                  <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 mb-1">
                    재해 발생 형태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="incidentType"
                    value={form.formData.incidentType || ''}
                    onChange={(e) => form.handleInputChange('incidentType', e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={form.formData.incidentCause || ''}
                    onChange={(e) => form.handleInputChange('incidentCause', e.target.value)}
                    placeholder="재해의 주요 원인을 상세히 기술해 주세요..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Status Indicator */}
                {preview.error && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    ⚠️ {preview.error}
                  </div>
                )}

                {/* Publish Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => publish.handlePublish(preview.preview, form.formData)}
                    disabled={publish.isPublishing || !preview.preview || !form.formData.title?.trim()}
                    className="w-full px-6 py-3.5 text-base sm:text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    {publish.isPublishing ? '📤 발행 중...' : '📤 OPS 문서 발행'}
                  </button>
                  {publish.publishError && (
                    <p className="text-red-600 text-sm mt-2">⚠️ {publish.publishError}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Live Preview - Use Preview Component */}
            <Preview
              state={preview.previewState}
              data={preview.preview}
              error={preview.error}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={auth.showAuthModal}
          accessKeyInput={auth.accessKeyInput}
          onAccessKeyChange={auth.setAccessKeyInput}
          onSave={auth.handleSaveAccessKey}
          onClose={() => auth.setShowAuthModal(false)}
        />

        {/* Success Modal */}
        <PublishSuccessModal
          publishedUrl={publish.publishedUrl}
          hasAccessKey={auth.hasAccessKey}
          onCopyUrl={publish.copyPublicUrl}
          onSendEmail={() => email.setShowEmailModal(true)}
          onClose={() => publish.resetPublishState()}
        />

        {/* Email Send Modal */}
        <EmailSendModal
          showModal={email.showEmailModal}
          emailRecipients={email.emailRecipients}
          onEmailRecipientsChange={(value) => email.setEmailRecipients(value)}
          isSendingEmail={email.isSendingEmail}
          emailSendResult={email.emailSendResult}
          emailError={email.emailError}
          subscribers={email.subscribers}
          selectedSubscribers={email.selectedSubscribers}
          isLoadingSubscribers={email.isLoadingSubscribers}
          onLoadSubscribers={email.loadSubscribers}
          onToggleSubscriber={email.toggleSubscriber}
          onToggleAllSubscribers={email.toggleAllSubscribers}
          onSendEmail={() => email.handleSendEmail(publish.publishedUrl!, publish.publishedOpsId!)}
          onClose={() => {
            email.setShowEmailModal(false);
            email.resetEmailState();
          }}
        />
      </div>
    </>
  );
}
