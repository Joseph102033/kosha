interface AuthModalProps {
  isOpen: boolean;
  accessKeyInput: string;
  onAccessKeyChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  accessKeyInput,
  onAccessKeyChange,
  onSave,
  onClose,
}: AuthModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    onAccessKeyChange('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
          🔑 액세스 키 필요
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          OPS 문서를 생성하고 발행하려면 관리자 액세스 키가 필요합니다.
        </p>
        <input
          type="password"
          value={accessKeyInput}
          onChange={(e) => onAccessKeyChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          placeholder="액세스 키를 입력하세요"
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          autoFocus
        />
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onSave}
            disabled={!accessKeyInput.trim()}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-base"
          >
            저장
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-base"
          >
            취소
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 액세스 키는 브라우저에 로컬 저장되며, 인증 목적으로만 서버에 전송됩니다.
        </p>
      </div>
    </div>
  );
}
