/**
 * 법제처(Ministry of Justice) Open API 클라이언트
 * @link https://open.law.go.kr/LSO/openApi/guideList.do
 *
 * 인증 방식: 도메인 기반 (OC 파라미터 사용)
 * 지원 형식: JSON, XML, HTML
 */

const LAW_API_BASE_URL = 'http://www.law.go.kr'; // HTTP (not HTTPS!)
const OC = 'yosep102033'; // 법제처 이메일 ID (yosep102033@gmail.com)

/**
 * 법령 검색 응답 타입
 */
export interface LawSearchResult {
  법령ID: string;
  법령명한글: string;
  법령명한자?: string;
  법령약칭명?: string;
  제개정구분명?: string;
  공포일자?: string;
  공포번호?: string;
  시행일자?: string;
  소관부처명?: string;
  법령구분명?: string;
}

export interface LawSearchResponse {
  target: string;
  totalCnt: number;
  page: number;
  법령?: LawSearchResult[];
}

/**
 * 법령 목록 검색
 * @param query 검색어 (법령명)
 * @param options 검색 옵션
 * @returns 법령 목록
 */
export async function searchLaws(
  query: string,
  options: {
    display?: number; // 한 페이지에 표시할 개수 (기본: 20, 최대: 100)
    page?: number; // 페이지 번호 (기본: 1)
  } = {}
): Promise<LawSearchResponse> {
  const { display = 20, page = 1 } = options;

  // URL 파라미터 구성
  const params = new URLSearchParams({
    OC,
    target: 'law', // 법령 검색
    type: 'JSON',
    query,
    display: display.toString(),
    page: page.toString(),
  });

  const url = `${LAW_API_BASE_URL}/DRF/lawSearch.do?${params.toString()}`;

  console.log('[MOJ Law API] Searching laws:', { query, display, page, url });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Referer': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
      'Origin': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[MOJ Law API] Search failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 500),
    });
    throw new Error(`법제처 API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[MOJ Law API] Search result:', {
    totalCnt: data.totalCnt,
    page: data.page,
    lawCount: data.법령?.length || 0,
  });

  return data;
}

/**
 * 법령 본문 조회
 * @param lawId 법령 ID
 * @returns 법령 본문 HTML
 */
export async function getLawContent(lawId: string): Promise<string> {
  const params = new URLSearchParams({
    OC,
    target: 'eflaw',
    type: 'HTML',
    ID: lawId,
  });

  const url = `${LAW_API_BASE_URL}/DRF/lawService.do?${params.toString()}`;

  console.log('[MOJ Law API] Getting law content:', { lawId, url });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
      'Referer': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
      'Origin': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[MOJ Law API] Get content failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 500),
    });
    throw new Error(`법제처 API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  console.log('[MOJ Law API] Content retrieved:', {
    lawId,
    contentLength: html.length,
  });

  return html;
}

/**
 * 산업안전보건 관련 법령 검색
 * @returns 산업안전보건법, 시행령, 시행규칙 등
 */
export async function searchOccupationalSafetyLaws(): Promise<LawSearchResult[]> {
  const queries = [
    '산업안전보건법',
    '산업안전보건법 시행령',
    '산업안전보건법 시행규칙',
    '산업안전보건기준에 관한 규칙',
    '중대재해 처벌 등에 관한 법률',
  ];

  const allLaws: LawSearchResult[] = [];

  for (const query of queries) {
    try {
      const result = await searchLaws(query, { display: 10 });
      if (result.법령 && result.법령.length > 0) {
        allLaws.push(...result.법령);
      }
    } catch (error) {
      console.error(`[MOJ Law API] Failed to search "${query}":`, error);
    }
  }

  // 중복 제거 (법령ID 기준)
  const uniqueLaws = Array.from(
    new Map(allLaws.map((law) => [law.법령ID, law])).values()
  );

  console.log('[MOJ Law API] Found occupational safety laws:', uniqueLaws.length);

  return uniqueLaws;
}
