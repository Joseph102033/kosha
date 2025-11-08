interface PublishSuccessModalProps {
  publishedUrl: string | null;
  onClose: () => void;
  onCopyUrl: () => void;
  onSendEmail: () => void;
  hasAccessKey: boolean;
}

/**
 * Modal displayed when OPS document is successfully published
 *
 * Features:
 * - Displays the public URL
 * - Provides "Copy Link" button
 * - Provides "View Published Page" link
 * - Provides "Send via Email" button (admin only)
 */
export default function PublishSuccessModal({
  publishedUrl,
  onClose,
  onCopyUrl,
  onSendEmail,
  hasAccessKey,
}: PublishSuccessModalProps) {
  if (!publishedUrl) return null;

  // Workers now returns frontend URL directly
  // Just validate and use it
  let displayUrl: string;
  let linkUrl: string;

  if (publishedUrl.startsWith('http://') || publishedUrl.startsWith('https://')) {
    // Already an absolute URL, use as-is
    displayUrl = publishedUrl;
    linkUrl = publishedUrl;
  } else if (publishedUrl.startsWith('/')) {
    // Relative path, prepend origin
    displayUrl = `${window.location.origin}${publishedUrl}`;
    linkUrl = displayUrl;
  } else {
    // Fallback: assume relative path
    displayUrl = `${window.location.origin}/${publishedUrl}`;
    linkUrl = displayUrl;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">✅ OPS 문서 발행 완료!</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          OPS 문서가 성공적으로 발행되었습니다. 아래 공개 URL로 접근할 수 있습니다.
        </p>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">공개 URL:</p>
          <p className="text-sm sm:text-base text-blue-600 break-all">{displayUrl}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
          <button
            onClick={onCopyUrl}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-base"
          >
            📋 링크 복사
          </button>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-center text-base"
          >
            👁️ 페이지 보기
          </a>
        </div>

        {/* Email Send Button - Admin Only */}
        {hasAccessKey && (
          <button
            onClick={onSendEmail}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium mb-3 text-base"
          >
            📧 이메일로 공유 (관리자 전용)
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
