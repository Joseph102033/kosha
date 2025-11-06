interface EmailSendModalProps {
  showModal: boolean;
  onClose: () => void;

  // Subscriber list state
  subscribers: Array<{ id: string; email: string }>;
  selectedSubscribers: Set<string>;
  isLoadingSubscribers: boolean;
  onLoadSubscribers: () => void;
  onToggleSubscriber: (email: string) => void;
  onToggleAllSubscribers: () => void;

  // Manual email input
  emailRecipients: string;
  onEmailRecipientsChange: (value: string) => void;

  // Send state
  isSendingEmail: boolean;
  emailSendResult: { sent: number; failed: number } | null;
  emailError: string | null;
  onSendEmail: () => void;
}

/**
 * Modal for sending OPS documents via email
 *
 * Features:
 * - Load and display newsletter subscriber list
 * - Select individual subscribers or all at once
 * - Add additional recipients manually (comma or newline separated)
 * - Validate email addresses before sending
 * - Display send results and errors
 *
 * This is the most complex modal with subscriber management logic
 */
export default function EmailSendModal({
  showModal,
  onClose,
  subscribers,
  selectedSubscribers,
  isLoadingSubscribers,
  onLoadSubscribers,
  onToggleSubscriber,
  onToggleAllSubscribers,
  emailRecipients,
  onEmailRecipientsChange,
  isSendingEmail,
  emailSendResult,
  emailError,
  onSendEmail,
}: EmailSendModalProps) {
  if (!showModal) return null;

  // Calculate total recipient count
  const manualEmailCount = emailRecipients.split(/[,\n]/).filter(e => e.trim()).length;
  const totalRecipients = selectedSubscribers.size + manualEmailCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📧 이메일로 OPS 공유</h3>

        {/* Subscriber List Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-900">뉴스레터 구독자</h4>
            <button
              onClick={onLoadSubscribers}
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
                    onChange={onToggleAllSubscribers}
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
                      onChange={() => onToggleSubscriber(sub.email)}
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
            onChange={(e) => onEmailRecipientsChange(e.target.value)}
            placeholder="예:&#10;hong@example.com,&#10;kim@example.com&#10;lee@example.com"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Selected Count */}
        {totalRecipients > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📮 총 <strong>{totalRecipients}</strong>명에게 발송됩니다
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
            onClick={onSendEmail}
            disabled={isSendingEmail || totalRecipients === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSendingEmail ? '📤 발송 중...' : '📤 이메일 발송'}
          </button>
          <button
            onClick={onClose}
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
  );
}
