import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const WORKERS_URL = 'https://safe-ops-studio-workers.yosep102033.workers.dev';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a /p/* or /api/* route
    const path = window.location.pathname;

    if (path.startsWith('/p/') || path.startsWith('/api/')) {
      // Redirect to Workers
      const workerUrl = `${WORKERS_URL}${path}${window.location.search}`;
      window.location.replace(workerUrl);
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Safe OPS Studio</title>
      </Head>
      <div style={{
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        height: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{
          display: 'inline-block',
          margin: '0 20px 0 0',
          paddingRight: '23px',
          fontSize: '24px',
          fontWeight: 500,
          verticalAlign: 'top',
          borderRight: '1px solid rgba(0, 0, 0, .3)'
        }}>404</h1>
        <div style={{ display: 'inline-block' }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '28px'
          }}>
            This page could not be found.
          </h2>
        </div>
      </div>
    </>
  );
}
