import Head from 'next/head';
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
              안전 OPS 뉴스레터
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              중대재해 개요를 손쉽게 OPS 요약자료로 편집하세요
            </p>
            <p className="text-lg text-gray-500 mb-12">
              중대재해 개요를 입력하시면 10분만에 관련 법령 / 근본 원인 / 재발방지 체크리스트를 작성해 드립니다
            </p>

            {/* Subscription Form */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                안전보건공단 중대재해사례 OPS 받아보기
              </h2>
              <p className="text-gray-600 mb-6">
                최신 중대재해 사례를 메일로 받아보세요
              </p>
              <SubscriptionForm />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  빠른 자동 작성
                </h3>
                <p className="text-gray-600">
                  10분 이내에 종합적인 OPS 자료를 생성합니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  관련 법령 조회
                </h3>
                <p className="text-gray-600">
                  산업안전보건법 등 관련 법령을 자동으로 매칭합니다
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">✅</div>
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
