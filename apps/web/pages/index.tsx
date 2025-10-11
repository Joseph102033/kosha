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
            <p className="text-xl md:text-2xl text-gray-600 mb-12">
              중대재해사례 OPS를 이메일로 받아보세요
            </p>

            {/* Subscription Form */}
            <div className="mb-16 bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                📬 뉴스레터 구독하기
              </h2>
              <p className="text-gray-600 mb-6">
                최신 중대재해 사례 분석 자료를 이메일로 받아보세요
              </p>
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
              <Link
                href="/builder"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                OPS 작성 도구 시작하기 →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Safe OPS Studio. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
