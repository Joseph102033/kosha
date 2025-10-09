import Head from 'next/head';
import SubscriptionForm from '../components/SubscriptionForm';

export default function Home() {
  return (
    <>
      <Head>
        <title>Safe OPS Studio - One-Page OPS Brief Generator</title>
        <meta name="description" content="Turn accident overviews into comprehensive OPS briefs with law mappings, root causes, and prevention checklists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Safe OPS Studio
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Transform Accident Overviews into Comprehensive OPS Briefs
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Generate one-page safety documents with law mappings, root cause analysis, and prevention checklists in under 10 minutes
            </p>

            {/* Subscription Form */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-600 mb-6">
                Get the latest OPS briefs and safety insights delivered to your inbox
              </p>
              <SubscriptionForm workerUrl="/api/subscribe" />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Fast Generation
                </h3>
                <p className="text-gray-600">
                  Create comprehensive OPS briefs in less than 10 minutes
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Law Mapping
                </h3>
                <p className="text-gray-600">
                  Automatic mapping to relevant safety regulations and laws
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Prevention Checklists
                </h3>
                <p className="text-gray-600">
                  Actionable checklists to prevent similar incidents
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
