/**
 * Illustration Demo Page
 * Showcases all accident type illustrations for documentation
 */

import { useState } from 'react';
import Illustration, { type IllustrationScenario } from '../components/ops/Illustration';

const DEMO_SCENARIOS: IllustrationScenario[] = [
  {
    incidentType: '추락',
    location: '서울시 강남구 건설현장 A동 3층',
    hazardObject: 'A형 사다리',
    agentObject: '작업 발판',
    ppe: ['안전모', '안전벨트', '안전화'],
  },
  {
    incidentType: '끼임',
    location: '부산 제조공장 프레스 작업장',
    hazardObject: '프레스 기계',
    agentObject: '금속 성형틀',
    ppe: ['보호장갑', '안전화', '보안경'],
  },
  {
    incidentType: '감전',
    location: '인천 물류센터 전기실',
    hazardObject: '고압 전기 패널',
    agentObject: '노출된 전선',
    ppe: ['절연장갑', '절연화', '안전모'],
  },
  {
    incidentType: '화재',
    location: '대전 화학공장 저장창고',
    hazardObject: '인화성 물질 저장탱크',
    agentObject: '용접 스파크',
    ppe: ['방화복', '방독면', '내열장갑'],
  },
  {
    incidentType: '화학물질',
    location: '광주 정밀화학 제조라인',
    hazardObject: '염산 저장 드럼',
    agentObject: '부식된 배관',
    ppe: ['화학보호복', '방독면', '화학장갑'],
  },
  {
    incidentType: '폭발',
    location: '울산 석유화학단지 반응기',
    hazardObject: '고압 반응 용기',
    agentObject: '압력 밸브',
    ppe: ['방폭복', '안전모', '안전화'],
  },
  {
    incidentType: '전도',
    location: '제주 건설현장 비계 작업장',
    hazardObject: '비계 구조물',
    agentObject: '미고정 지지대',
    ppe: ['안전모', '안전벨트', '안전화'],
  },
];

export default function IllustrationDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Safe OPS Studio - 사고 형태별 삽화 시스템
          </h1>
          <p className="text-gray-600">
            결정론적 SVG 생성 · 투명 배경 PNG 다운로드 · 일관성 보장
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar: Scenario selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">사고 형태 선택</h2>
              <div className="space-y-2">
                {DEMO_SCENARIOS.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedIndex === index
                        ? 'bg-blue-50 text-blue-700 border border-blue-300 font-medium'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-semibold">{scenario.incidentType}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{scenario.location}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">✓ 시스템 특징</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 동일 입력 → 동일 출력 (100% 결정론)</li>
                  <li>• 투명 배경 PNG 다운로드</li>
                  <li>• 외부 폰트 불필요 (시스템 폰트)</li>
                  <li>• 텍스트 자동 줄바꿈 (2줄 제한)</li>
                  <li>• Safe OPS Studio 워터마크</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right panel: Illustration display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {DEMO_SCENARIOS[selectedIndex].incidentType} 사고 삽화
                </h2>
                <p className="text-sm text-gray-600">
                  {DEMO_SCENARIOS[selectedIndex].location}
                </p>
              </div>

              <Illustration
                scenario={DEMO_SCENARIOS[selectedIndex]}
                width={600}
                height={400}
                showDownloadButton={true}
              />

              {/* Scenario details */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">기인물</h3>
                  <p className="text-sm text-gray-700">
                    {DEMO_SCENARIOS[selectedIndex].hazardObject}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">가해물</h3>
                  <p className="text-sm text-gray-700">
                    {DEMO_SCENARIOS[selectedIndex].agentObject}
                  </p>
                </div>
              </div>

              {DEMO_SCENARIOS[selectedIndex].ppe && (
                <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">🛡️ 필수 보호구</h3>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_SCENARIOS[selectedIndex].ppe!.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white text-green-700 rounded-full text-xs font-medium border border-green-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Usage example */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">사용 방법</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100 font-mono">
                  {`import Illustration from '@/components/ops/Illustration';

const scenario = ${JSON.stringify(DEMO_SCENARIOS[selectedIndex], null, 2)};

<Illustration
  scenario={scenario}
  width={600}
  height={400}
  showDownloadButton={true}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Safe OPS Studio - 결정론적 안전 사고 삽화 생성 시스템</p>
          <p className="mt-1">모든 그림은 동일한 입력에 대해 항상 동일한 결과를 생성합니다</p>
        </div>
      </div>
    </div>
  );
}
