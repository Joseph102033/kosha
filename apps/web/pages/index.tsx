import Head from 'next/head';
import Link from 'next/link';
import SubscriptionForm from '../components/SubscriptionForm';

export default function Home() {
  return (
    <>
      <Head>
        <title>안전 OPS 뉴스레터 - 중대재해 사례 분석 자료 자동 생성</title>
        <meta name="description" content="중대재해 개요를 입력하면 관련 법령, 근본 원인, 재발방지 체크리스트가 포함된 OPS 자료를 자동으로 생성합니다" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              안전보건공단 중대재해사례 OPS 뉴스레터
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              중대재해사례 OPS를 이메일로 받아보세요
            </p>

            {/* Demo Video/GIF Section */}
            <div className="mb-12 bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🎬 빠른 데모 보기
              </h2>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                {/* Placeholder for demo video/GIF - Replace with actual media */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">▶️</div>
                    <p className="text-gray-600 font-medium">입력 → 미리보기 → 발행</p>
                    <p className="text-sm text-gray-500 mt-2">(30~45초 데모 영상)</p>
                  </div>
                </div>
                {/* Uncomment and use when actual video/GIF is available:
                <video className="absolute inset-0 w-full h-full" controls>
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
                OR for GIF:
                <img src="/demo.gif" alt="OPS 생성 데모" className="absolute inset-0 w-full h-full object-contain" />
                */}
              </div>
            </div>

            {/* Subscription Form */}
            <div className="mb-16 bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                📬 뉴스레터 구독하기
              </h2>
              <p className="text-gray-600 mb-4">
                최신 중대재해 사례 분석 자료를 이메일로 받아보세요
              </p>

              {/* Benefits & Frequency */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">💡 구독 혜택</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>주 1회</strong> 엄선된 중대재해 사례 분석 자료</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>재해발생상황 <strong>시각 자료</strong> 및 근본 원인 분석</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>실무에 적용 가능한 <strong>재발방지 체크리스트</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>산업안전보건법 등 <strong>관련 법령 정보</strong></span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3 italic">
                  📅 발송 빈도: 매주 금요일 / 📧 샘플: 구독 확인 후 최신 OPS 1건 즉시 발송
                </p>
              </div>

              <SubscriptionForm />
            </div>

            {/* What We Provide */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                제공 내용
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    재해발생상황 삽화
                  </h3>
                  <p className="text-gray-600">
                    재해 발생 상황을 이해할 수 있는 시각 자료
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    재발방지 체크리스트
                  </h3>
                  <p className="text-gray-600">
                    유사 재해 예방을 위한 실행 가능한 점검 항목
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    관련 법령
                  </h3>
                  <p className="text-gray-600">
                    산업안전보건법 등 적용 가능한 법령 정보
                  </p>
                </div>
              </div>
            </div>

            {/* CTA to Builder */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">
                직접 OPS 자료를 만들고 싶으신가요?
              </h3>
              <p className="text-blue-100 mb-6">
                OPS 작성 도구를 사용하여 10분 만에 전문적인 OPS 자료를 생성하세요
              </p>

              <div className="space-y-3">
                {/* Main CTA - With Access Key */}
                <Link
                  href="/builder"
                  className="inline-block w-full sm:w-auto px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                >
                  🔑 액세스 키로 시작하기 →
                </Link>

                {/* Demo Mode CTA */}
                <div className="text-center">
                  <Link
                    href="/builder?mode=demo"
                    className="inline-block w-full sm:w-auto px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors border-2 border-blue-400"
                  >
                    🎯 체험 모드로 시작하기
                  </Link>
                  <p className="text-xs text-blue-200 mt-2">
                    * 체험 모드: 저장 제한 및 워터마크 적용 / 액세스 키 불필요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Law Ruleset Badge & Disclaimer */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  ⚖️ 법령 룰셋 v0.1
                  <span className="text-blue-600">({new Date().toISOString().split('T')[0]})</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  ⚠️ 면책고지
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  본 서비스에서 제공하는 법령 정보 및 안전 지침은 <strong>참고 목적</strong>으로만 사용하시기 바랍니다.
                  모든 산업안전보건 관련 결정과 조치에 대한 <strong>최종 책임은 현업 담당자 및 사업주</strong>에게 있으며,
                  본 서비스는 법적 자문을 제공하지 않습니다. 정확한 법령 해석 및 적용은 전문가와 상담하시기 바랍니다.
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-600 text-sm">
              <p>&copy; {new Date().getFullYear()} Safe OPS Studio. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
