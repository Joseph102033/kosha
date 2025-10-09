import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PdfButton from '../../components/PdfButton';

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
  ops: OPSData | null;
  error?: string;
}

export default function PublicOPSPage({ ops, error }: PublicOPSPageProps) {
  if (error || !ops) {
    return (
      <>
        <Head>
          <title>OPS Not Found | Safe OPS Studio</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">OPS Document Not Found</h1>
            <p className="text-gray-600">{error || 'The requested OPS document does not exist.'}</p>
          </div>
        </div>
      </>
    );
  }

  const { title, incidentDate, location, opsDocument } = ops;
  const formattedDate = new Date(incidentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Head>
        <title>{title} | Safe OPS Studio</title>
        <meta name="description" content={opsDocument.summary.substring(0, 160)} />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-900 text-white py-6 print:bg-white print:text-black print:border-b">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <div className="text-sm text-gray-300 print:text-gray-600">
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <span>{location}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="ops-content" className="max-w-4xl mx-auto px-4 py-8">
          {/* Summary Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              Executive Summary
            </h2>
            <p className="whitespace-pre-line text-gray-700 leading-relaxed">
              {opsDocument.summary}
            </p>
          </section>

          {/* Causes Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              Root Cause Analysis
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Direct Causes</h3>
              <ul className="space-y-2">
                {opsDocument.causes.direct.map((cause, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1">▸</span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Indirect Causes (Contributing Factors)</h3>
              <ul className="space-y-2">
                {opsDocument.causes.indirect.map((cause, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">▸</span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Prevention Checklist */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              Prevention Checklist
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg print:bg-white print:border">
              <ul className="space-y-3">
                {opsDocument.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-3 h-5 w-5 text-blue-600 print:hidden"
                      disabled
                    />
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Related Laws & Regulations */}
          {opsDocument.laws.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                Related Laws & Regulations
              </h2>
              <ul className="space-y-3">
                {opsDocument.laws.map((law, idx) => (
                  <li key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                    <a
                      href={law.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium print:text-gray-900"
                    >
                      {law.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Actions */}
          <section className="mt-12 pt-6 border-t print:hidden">
            <div className="flex gap-4">
              <PdfButton
                targetElementId="ops-content"
                filename={`ops-${ops.slug}.pdf`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              />
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                🔗 Copy Link
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 py-6 mt-12 print:hidden">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p>Generated by Safe OPS Studio</p>
            <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    // Fetch OPS from Worker API
    const response = await fetch(`http://localhost:8787/api/ops/${slug}`);

    if (!response.ok) {
      return {
        props: {
          ops: null,
          error: 'OPS document not found',
        },
      };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return {
        props: {
          ops: null,
          error: 'Failed to load OPS document',
        },
      };
    }

    return {
      props: {
        ops: data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching OPS:', error);
    return {
      props: {
        ops: null,
        error: 'Failed to load OPS document',
      },
    };
  }
};
