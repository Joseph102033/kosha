/**
 * GET /p/:slug Handler
 * Renders public OPS page as HTML (server-side rendered)
 */

import type { Env } from '../index';

/**
 * Generate HTML for public OPS page
 */
function generateOPSPageHTML(data: any): string {
  const { title, incidentDate, location, opsDocument } = data;

  const formattedDate = new Date(incidentDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Safe OPS Studio</title>
  <meta name="description" content="${opsDocument.summary.substring(0, 160)}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${opsDocument.summary.substring(0, 160)}">
  <meta property="og:type" content="article">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <a href="https://kosha-8ad.pages.dev/" class="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Home
      </a>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${title}</h1>
      <div class="flex gap-4 text-sm text-gray-600">
        <span>📅 ${formattedDate}</span>
        <span>📍 ${location}</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Tabs Container -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex -mb-px space-x-4">
          <button onclick="showTab('summary')" id="tab-summary" class="tab-button py-2 px-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
            요약
          </button>
          <button onclick="showTab('causes')" id="tab-causes" class="tab-button py-2 px-3 text-sm font-medium border-b-2 border-transparent text-gray-500">
            원인 분석
          </button>
          <button onclick="showTab('checklist')" id="tab-checklist" class="tab-button py-2 px-3 text-sm font-medium border-b-2 border-transparent text-gray-500">
            재발방지 체크리스트
          </button>
          <button onclick="showTab('laws')" id="tab-laws" class="tab-button py-2 px-3 text-sm font-medium border-b-2 border-transparent text-gray-500">
            관련 법령
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="prose prose-sm max-w-none">
        <!-- Summary Tab -->
        <div id="content-summary" class="tab-content">
          <h2 class="text-xl font-semibold mb-4">사고 개요</h2>
          ${opsDocument.imageMeta && opsDocument.imageMeta.type === 'generated' && opsDocument.imageMeta.url ? `
            <div class="mb-4 rounded-lg overflow-hidden border border-gray-200">
              <img src="${opsDocument.imageMeta.url}" alt="재해 상황 삽화" class="w-full h-auto">
              <p class="text-xs text-gray-500 p-2 bg-gray-50">🤖 AI 생성 안전 교육 삽화</p>
            </div>
          ` : ''}
          <p class="whitespace-pre-line text-gray-700">${opsDocument.summary}</p>
        </div>

        <!-- Causes Tab -->
        <div id="content-causes" class="tab-content hidden">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">직접 원인</h3>
            <ul class="list-disc list-inside space-y-2">
              ${opsDocument.causes.direct.map((cause: string) => `<li class="text-gray-700">${cause}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">간접 원인</h3>
            <ul class="list-disc list-inside space-y-2">
              ${opsDocument.causes.indirect.map((cause: string) => `<li class="text-gray-700">${cause}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Checklist Tab -->
        <div id="content-checklist" class="tab-content hidden">
          <h2 class="text-xl font-semibold mb-4">재발방지 체크리스트</h2>
          <ul class="space-y-3">
            ${opsDocument.checklist.map((item: string, idx: number) => `
              <li class="flex items-start gap-3">
                <input type="checkbox" class="mt-1" id="check-${idx}">
                <label for="check-${idx}" class="text-gray-700 cursor-pointer">${item}</label>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Laws Tab -->
        <div id="content-laws" class="tab-content hidden">
          <h2 class="text-xl font-semibold mb-4">관련 법령 및 규정</h2>
          <ul class="space-y-3">
            ${opsDocument.laws.map((law: any) => `
              <li class="border-l-4 border-blue-500 pl-4 py-2">
                <a href="${law.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  ${law.title} →
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- Print/Download Buttons -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">문서 내보내기</h3>
      <div class="flex gap-3">
        <button onclick="window.print()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          🖨️ 인쇄하기
        </button>
        <button onclick="copyLink()" class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
          🔗 링크 복사
        </button>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-200 py-8 mt-12">
    <div class="max-w-4xl mx-auto px-4 text-center text-gray-600">
      <p>&copy; ${new Date().getFullYear()} Safe OPS Studio. All rights reserved.</p>
    </div>
  </footer>

  <script>
    function showTab(tabName) {
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      // Remove active styles from all buttons
      document.querySelectorAll('.tab-button').forEach(el => {
        el.classList.remove('border-blue-500', 'text-blue-600');
        el.classList.add('border-transparent', 'text-gray-500');
      });

      // Show selected tab content
      document.getElementById('content-' + tabName).classList.remove('hidden');
      // Add active styles to selected button
      const activeTab = document.getElementById('tab-' + tabName);
      activeTab.classList.remove('border-transparent', 'text-gray-500');
      activeTab.classList.add('border-blue-500', 'text-blue-600');
    }

    function copyLink() {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  </script>
</body>
</html>`;
}

/**
 * Handle GET /p/:slug (public OPS page)
 */
export async function handlePublicOPSPage(slug: string, env: Env): Promise<Response> {
  try {
    // Try KV cache first
    const cached = await env.OPS_CACHE.get(`ops:${slug}`, 'json');

    if (!cached) {
      return new Response(
        `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPS Not Found | Safe OPS Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-8">OPS Document Not Found</p>
    <a href="https://kosha-8ad.pages.dev/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
      Go Home
    </a>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    const html = generateOPSPageHTML(cached);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error rendering public OPS page:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
