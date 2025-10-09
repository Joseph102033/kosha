import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface LawReference {
  title: string;
  url: string;
}

interface OPSDocument {
  summary: string;
  causes: {
    direct: string[];
    indirect: string[];
  };
  checklist: string[];
  laws: LawReference[];
  imageMeta?: {
    type: 'placeholder' | 'generated';
    url?: string;
  };
}

interface OPSData {
  id: string;
  slug: string;
  title: string;
  incidentDate: string;
  location: string;
  opsDocument: OPSDocument;
  createdAt: string;
}

interface PublicOPSPageProps {
  opsData: OPSData | null;
  slug: string;
}

export default function PublicOPSPage({ opsData, slug }: PublicOPSPageProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  if (!opsData) {
    return (
      <>
        <Head>
          <title>OPS Not Found | Safe OPS Studio</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">OPS Document Not Found</p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Go Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { title, incidentDate, location, opsDocument } = opsData;
  const formattedDate = new Date(incidentDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Head>
        <title>{title} | Safe OPS Studio</title>
        <meta name="description" content={opsDocument.summary.substring(0, 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={opsDocument.summary.substring(0, 160)} />
        <meta property="og:type" content="article" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📅 {formattedDate}</span>
              <span>📍 {location}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px space-x-4">
                {(['summary', 'causes', 'checklist', 'laws'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'summary' && '요약'}
                    {tab === 'causes' && '원인 분석'}
                    {tab === 'checklist' && '재발방지 체크리스트'}
                    {tab === 'laws' && '관련 법령'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="prose prose-sm max-w-none">
              {activeTab === 'summary' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">사고 개요</h2>
                  <p className="whitespace-pre-line text-gray-700">{opsDocument.summary}</p>
                </div>
              )}

              {activeTab === 'causes' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">직접 원인</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {opsDocument.causes.direct.map((cause, idx) => (
                        <li key={idx} className="text-gray-700">{cause}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">간접 원인</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {opsDocument.causes.indirect.map((cause, idx) => (
                        <li key={idx} className="text-gray-700">{cause}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'checklist' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">재발방지 체크리스트</h2>
                  <ul className="space-y-3">
                    {opsDocument.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" id={`check-${idx}`} />
                        <label htmlFor={`check-${idx}`} className="text-gray-700 cursor-pointer">
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'laws' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">관련 법령 및 규정</h2>
                  <ul className="space-y-3">
                    {opsDocument.laws.map((law, idx) => (
                      <li key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                        <a
                          href={law.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          {law.title} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Print/Download Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">문서 내보내기</h3>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🖨️ 인쇄하기
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                🔗 링크 복사
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 mt-12">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Safe OPS Studio. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // For static export, return empty paths
  // Pages will be generated on-demand in production
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PublicOPSPageProps> = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const response = await fetch(`${API_URL}/api/ops/${slug}`);

    if (!response.ok) {
      return {
        props: {
          opsData: null,
          slug,
        },
        revalidate: 60, // Revalidate every 60 seconds
      };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return {
        props: {
          opsData: null,
          slug,
        },
        revalidate: 60,
      };
    }

    return {
      props: {
        opsData: data.data,
        slug,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching OPS data:', error);
    return {
      props: {
        opsData: null,
        slug,
      },
      revalidate: 60,
    };
  }
};
