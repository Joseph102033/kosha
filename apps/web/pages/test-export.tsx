/**
 * Test page for generating sample exports
 * Visit /test-export in dev mode to generate sample files
 */

import React from 'react';
import ExportMenu from '../components/ExportMenu';
import { SAMPLE_OPS_DATA } from '../utils/exporters/sample-data';

export default function TestExportPage() {
  const [lastExport, setLastExport] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📄 Export Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            이 페이지에서 샘플 OPS 데이터를 사용하여 3가지 형식(PDF, Markdown, Docx)으로 내보내기를 테스트할 수 있습니다.
          </p>

          {lastExport && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✓ <strong>{lastExport}</strong> 형식으로 내보내기 완료!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                ✗ 오류: {error}
              </p>
            </div>
          )}
        </div>

        <ExportMenu
          data={SAMPLE_OPS_DATA}
          onExportStart={(format) => {
            setLastExport(null);
            setError(null);
            console.log(`Starting export: ${format}`);
          }}
          onExportComplete={(format) => {
            setLastExport(format.toUpperCase());
            console.log(`Export completed: ${format}`);
          }}
          onExportError={(format, err) => {
            setError(`${format} 내보내기 실패: ${err.message}`);
            console.error(`Export failed: ${format}`, err);
          }}
        />

        {/* Sample Data Preview */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 샘플 데이터 미리보기
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900">제목</h3>
              <p className="text-gray-600">{SAMPLE_OPS_DATA.title}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">사고 정보</h3>
              <ul className="text-gray-600 space-y-1">
                <li>발생일시: {SAMPLE_OPS_DATA.incident_date}</li>
                <li>발생장소: {SAMPLE_OPS_DATA.location}</li>
                <li>기인물: {SAMPLE_OPS_DATA.agent_object}</li>
                <li>가해물: {SAMPLE_OPS_DATA.hazard_object}</li>
                <li>사고형태: {SAMPLE_OPS_DATA.incident_type}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">발생개요</h3>
              <p className="text-gray-600">{SAMPLE_OPS_DATA.incident_cause}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">사고 요약</h3>
              <p className="text-gray-600">{SAMPLE_OPS_DATA.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">근본 원인 분석</h3>
              <ol className="text-gray-600 list-decimal list-inside space-y-1">
                {SAMPLE_OPS_DATA.root_causes.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">재발 방지 체크리스트</h3>
              <ul className="text-gray-600 space-y-1">
                {SAMPLE_OPS_DATA.prevention_checklist.map((item, i) => (
                  <li key={i}>☐ {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">관련 법령 ({SAMPLE_OPS_DATA.suggested_laws?.length || 0}건)</h3>
              <div className="space-y-2 mt-2">
                {SAMPLE_OPS_DATA.suggested_laws?.map((law, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium text-gray-900">
                      {law.law_title} {law.article_no}
                    </div>
                    <div className="text-xs text-gray-500">
                      신뢰도: {law.confidence}% ({law.confidence_level})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">문서 해시</h3>
              <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {SAMPLE_OPS_DATA.document_hash}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
