/**
 * ExportMenu Component
 * Provides UI for exporting OPS documents in multiple formats
 */

import React, { useState } from 'react';
import {
  OPSExportData,
  ExportOptions,
  downloadPDF,
  downloadMarkdown,
  downloadDocx,
} from '../utils/exporters';

interface ExportMenuProps {
  data: OPSExportData;
  options?: ExportOptions;
  onExportStart?: (format: 'pdf' | 'markdown' | 'docx') => void;
  onExportComplete?: (format: 'pdf' | 'markdown' | 'docx') => void;
  onExportError?: (format: 'pdf' | 'markdown' | 'docx', error: Error) => void;
}

export function ExportMenu({
  data,
  options,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'markdown' | 'docx') => {
    try {
      setIsExporting(format);
      onExportStart?.(format);

      switch (format) {
        case 'pdf':
          await downloadPDF(data, undefined, options);
          break;
        case 'markdown':
          downloadMarkdown(data, undefined, options);
          break;
        case 'docx':
          await downloadDocx(data, undefined, options);
          break;
      }

      onExportComplete?.(format);
    } catch (error) {
      console.error(`Export failed for ${format}:`, error);
      onExportError?.(format, error as Error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        문서 내보내기
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        OPS 문서를 다양한 형식으로 다운로드하세요. 모든 파일에는 워터마크와 문서 해시가 포함됩니다.
      </p>

      <div className="space-y-3">
        {/* PDF Export */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
          className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">PDF</div>
              <div className="text-xs text-gray-600">
                요약 + 부록 (A4 페이지)
              </div>
            </div>
          </div>
          {isExporting === 'pdf' ? (
            <div className="text-sm text-red-600">내보내는 중...</div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </button>

        {/* Markdown Export */}
        <button
          onClick={() => handleExport('markdown')}
          disabled={isExporting !== null}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Markdown</div>
              <div className="text-xs text-gray-600">
                텍스트 형식 (.md 파일)
              </div>
            </div>
          </div>
          {isExporting === 'markdown' ? (
            <div className="text-sm text-blue-600">내보내는 중...</div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </button>

        {/* Docx Export */}
        <button
          onClick={() => handleExport('docx')}
          disabled={isExporting !== null}
          className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Word (.docx)</div>
              <div className="text-xs text-gray-600">
                한글/MS Word 호환
              </div>
            </div>
          </div>
          {isExporting === 'docx' ? (
            <div className="text-sm text-indigo-600">내보내는 중...</div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Format details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          포맷 상세 정보
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>PDF:</strong> 프린트 및 공식 문서 보관에 적합</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Markdown:</strong> 버전 관리 및 텍스트 편집에 적합</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Docx:</strong> 한글/MS Word에서 편집 가능</span>
          </li>
        </ul>
      </div>

      {/* Legal notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ 중요:</strong> 모든 산출물에는 생성 도구 워터마크와 문서 해시가 포함됩니다. 이는 문서의 신뢰성과 추적성을 보장하기 위한 것입니다.
        </p>
      </div>
    </div>
  );
}

export default ExportMenu;
