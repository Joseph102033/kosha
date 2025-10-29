# Safe OPS Studio - Development Notes

**Last Updated**: 2025-10-19
**Vooster Project UID**: UNMR
**Current Phase**: Week 1 - M1 (MVP Implementation)

---

## 🎯 Current Status

- **Completed Tasks**: T-001 ✅, T-002 ✅, Major Updates (2025-10-10) ✅, Deployment (2025-10-11) ✅, Gemini Integration (2025-10-19) ✅, Frontend Illustration Display (2025-10-19) ✅
- **Current Task**: Ready for next feature development
- **Overall Progress**: 2/9 tasks completed + 5 major improvements + Gemini full deployment (22% + enhancements)

---

## 🔑 Critical Information - CLOUDFLARE RESOURCES

### Database & Storage
| Resource | ID | Name |
|----------|----|----- |
| **D1 Database** | `4409b768-3430-4d91-8665-391c977897c7` | `safe-ops-studio-db` |
| **KV Namespace** | `03757fc4bf2e4a0e99ee6cc7eb5fa1ad` | `safe-ops-studio-cache` |
| **Account ID** | `bcf10cbd3d1507209b845be49c0c0407` | Yosep102033@gmail.com's Account |

### D1 Database Schema
Created tables with indexes:

1. **subscribers** - Email subscription management
   - `id` (TEXT PRIMARY KEY)
   - `email` (TEXT UNIQUE)
   - `status` (pending|active|unsub)
   - `created_at` (DATETIME)
   - Indexes: email, status

2. **ops_documents** - OPS document storage
   - `id` (TEXT PRIMARY KEY)
   - `title`, `incident_date`, `location`
   - `agent_object`, `hazard_object`, `incident_type`, `incident_cause`
   - `ops_json` (TEXT - JSON string)
   - `created_by`, `created_at`
   - Indexes: created_at, incident_type

3. **deliveries** - Email delivery tracking
   - `id` (TEXT PRIMARY KEY)
   - `ops_id`, `to_email`, `provider_msg_id`
   - `status` (queued|sent|failed)
   - `sent_at`, `created_at`
   - Indexes: ops_id, status, sent_at

4. **law_rules** - Law keyword mappings
   - `id` (TEXT PRIMARY KEY)
   - `keyword`, `law_title`, `url`
   - `created_at`
   - Indexes: keyword

---

## 📂 Project Structure

```
C:\Users\s\Code\kosha\
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── _app.tsx             # App wrapper
│   │   │   ├── _document.tsx        # HTML document
│   │   │   └── index.tsx            # Landing page ✅
│   │   ├── components/              # React components (empty)
│   │   ├── styles/
│   │   │   └── globals.css          # Tailwind CSS v3
│   │   ├── tests/                   # Frontend tests (empty)
│   │   ├── package.json             # Next.js 15.5.4, React 19, Tailwind 3.4
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   └── tailwind.config.js
│   │
│   └── workers/                      # Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts             # Main entry point ✅
│       │   ├── subscriptions/       # Domain folders (empty)
│       │   ├── ops/
│       │   ├── law/
│       │   ├── delivery/
│       │   ├── db/
│       │   ├── cache/
│       │   └── utils/
│       ├── migrations/
│       │   └── 0001_initial_schema.sql  # D1 migration ✅
│       ├── package.json             # Wrangler 3.94, TypeScript 5.9
│       ├── tsconfig.json
│       ├── wrangler.toml            # D1 & KV bindings ✅
│       └── .dev.vars.example        # Environment template
│
├── vooster-docs/                    # Project documentation
│   ├── prd.md                       # PRD & TRD
│   ├── architecture.md
│   ├── guideline.md
│   ├── step-by-step.md
│   ├── tdd.md
│   ├── clean-code.md
│   └── isms-p.md
│
├── .vooster/                        # Vooster task management
│   ├── vooster.json                 # API key & email
│   ├── project.json                 # Project UID: UNMR
│   ├── tasks.json                   # 9 tasks metadata
│   ├── tasks/                       # Task files (T-001 ~ T-009)
│   └── progress.md                  # Progress report
│
├── CLAUDE.md                        # Claude Code instructions
├── README.md                        # Project overview
├── notes.md                         # This file
└── .gitignore
```

---

## ✅ T-001: Project Infrastructure Setup (COMPLETED)

### What Was Done:

#### 1. Next.js Project ✅
- Created with Pages Router (NOT App Router as per requirements)
- Installed: TypeScript, Tailwind CSS v3.4.18, ESLint
- Configuration files: tsconfig.json, next.config.js, tailwind.config.js, postcss.config.js
- Basic landing page with Safe OPS Studio branding
- **Build Status**: ✅ Passing (optimized production build successful)

#### 2. Cloudflare Workers ✅
- Domain-based directory structure (subscriptions, ops, law, delivery, db, cache, utils)
- TypeScript configuration
- Main entry point (src/index.ts) with:
  - CORS headers
  - Health check endpoint (`/health`)
  - Error handling
  - Environment type definitions (Env interface)

#### 3. Cloudflare D1 Database ✅
- Created database via Cloudflare MCP
- Applied migration with all 4 tables + indexes
- **Region**: APAC
- **Tables**: 4 (subscribers, ops_documents, deliveries, law_rules)
- **Total rows written**: 13 (schema setup)

#### 4. Cloudflare KV Namespace ✅
- Created for OPS caching
- Supports URL encoding
- Bound in wrangler.toml

#### 5. Configuration Files ✅
- `wrangler.toml`: D1 and KV bindings configured
- `.gitignore`: Root and per-app exclusions
- `.dev.vars.example`: Environment variable template
- `README.md`: Project overview and setup instructions

### Technical Details:

**Dependencies Installed**:
- Next.js: 15.5.4
- React: 19.2.0
- Tailwind CSS: 3.4.18 (downgraded from v4 due to compatibility)
- TypeScript: 5.9.3
- Wrangler: 3.94.0

**Environment Setup**:
- Node.js: v22.19.0
- npm: 10.9.3
- Platform: Windows (MINGW64_NT)

---

## ✅ T-002: Landing Page with Email Subscription (COMPLETED)

### What Was Done:

#### 1. Backend Implementation (TDD Approach) ✅
- **RED Phase**: Created failing tests first
  - Unit tests for email validation (apps/workers/tests/utils/validation.test.ts)
  - Integration tests for /api/subscribe endpoint (apps/workers/tests/subscriptions/subscribe.test.ts)
  - Test setup with D1 schema initialization (apps/workers/tests/setup.ts)

- **GREEN Phase**: Implemented features to pass tests
  - Email validation utility (apps/workers/src/utils/validation.ts)
    - RFC 5322 compliant regex
    - 254 character limit
    - Lowercase normalization
    - Consecutive dot checks
  - Subscription models (apps/workers/src/subscriptions/models.ts)
  - Subscribe handler (apps/workers/src/subscriptions/subscribe.ts)
    - POST /api/subscribe endpoint
    - Email format validation
    - Idempotent duplicate handling
    - Parameterized D1 queries (SQL injection protection)
    - Proper error handling with HTTP status codes
  - Updated main router (apps/workers/src/index.ts) with /api/subscribe route

- **Test Results**: ✅ 10/10 tests passing
  - 4 email validation tests
  - 6 subscription endpoint tests

#### 2. Frontend Implementation ✅
- Created SubscriptionForm component (apps/web/components/SubscriptionForm.tsx)
  - Client-side email validation
  - Loading states with spinner
  - Success/error messaging
  - Responsive design (mobile-first)
  - Accessibility attributes (aria-label, aria-invalid, role="alert")
  - Tailwind CSS styling with hover/focus states

- Updated landing page (apps/web/pages/index.tsx)
  - Hero section with project description
  - Integrated subscription form
  - Features grid (⚡ Fast, ⚖️ Law Mapping, ✅ Checklists)
  - Responsive layout
  - Footer with copyright

- **Build Status**: ✅ Passing (optimized production build successful)

#### 3. Testing Infrastructure ✅
- Set up Vitest with Cloudflare Workers pool
- Configured wrangler.toml with `compatibility_flags = ["nodejs_compat"]`
- Created vitest.config.ts with D1 bindings
- Test database schema setup in beforeAll hook
- package.json with test scripts

### Technical Details:

**API Endpoint**:
- `POST /api/subscribe`
- Request: `{ email: string }`
- Response: `{ success: boolean, message?: string, error?: string }`
- Status Codes: 200 (success/duplicate), 400 (validation error), 405 (method not allowed), 500 (server error)

**Database Operations**:
- Parameterized queries for security
- Unique constraint on email field
- Status: 'active' (auto-set on subscription)
- Idempotent: Returns success for duplicate emails

**Frontend Features**:
- Real-time client-side validation
- Debounced API calls
- Accessible form controls
- Mobile-responsive design
- Loading indicators

### Testing Coverage:
- ✅ Unit tests: Email validation edge cases
- ✅ Integration tests: D1 database operations
- ✅ HTTP method validation
- ✅ Duplicate email handling
- ✅ Error scenarios

---

## ✅ 2025-10-10 Major Updates (COMPLETED)

### What Was Done:

#### 1. 한국어 응답 구현 ✅ (Task 1)
**파일 수정**: `apps/workers/src/ops/composer.ts`

**변경 내용**:
- `generateSummary()`: 모든 영어 텍스트를 한국어로 변환
  - "incident occurred on" → "에 재해가 발생했습니다"
  - "Location:" → "장소:"
  - "Primary cause:" → "주요 원인:"
- `extractDirectCauses()`: 직접 원인 한국어화
  - "Inadequate fall protection measures" → "부적절한 추락 방지 조치"
  - "Scaffolding structural failure" → "비계 구조적 결함"
- `extractIndirectCauses()`: 간접 원인 한국어화
  - "Insufficient safety training" → "불충분한 안전 교육 또는 인식"
  - "Inadequate risk assessment" → "부적절한 위험성 평가 절차"
- `generateChecklist()`: 체크리스트 항목 한국어화 (10개 항목)
  - "Conduct comprehensive risk assessment" → "작업 시작 전 종합적인 위험성 평가 실시"

**테스트 결과**: ✅ 로컬 테스트 통과 (curl로 확인)

#### 2. OPS 소개 섹션 Builder로 이동 ✅ (Task 3)
**파일 수정**: `apps/web/pages/builder.tsx`

**추가된 섹션** (204-249번 줄):
- 상단에 OPS 기능 소개 영역 추가
- 제목: "중대재해 개요를 손쉽게 OPS 요약자료로 편집하세요"
- 3개 Feature 카드:
  - ⚡ 빠른 자동 작성
  - ⚖️ 관련 법령 조회
  - ✅ 재발방지 체크리스트
- 그라데이션 배경 (blue-50 to indigo-50)

#### 3. Landing 페이지 뉴스레터 중심 재디자인 ✅ (Task 4)
**파일 수정**: `apps/web/pages/index.tsx`

**변경 내용**:
- 제목 변경: "안전보건공단 중대재해사례 OPS 뉴스레터"
- 서브헤더: "중대재해사례 OPS를 이메일로 받아보세요"
- OPS 제작 관련 내용 제거 (Builder로 이동)
- 새로운 "제공 내용" 섹션 추가:
  - 🖼️ 재해발생상황 삽화
  - ✅ 재발방지 체크리스트
  - ⚖️ 관련 법령
- Builder로의 CTA 버튼 추가 (하단 파란색 박스)

#### 4. 404 오류 진단 완료 ✅ (Task 2a)

**진단 결과**:
- ✅ Workers API 정상 작동 중 (`https://safe-ops-studio-workers.yosep102033.workers.dev/health`)
- ✅ KV Namespace 정상 존재 (`safe-ops-studio-cache`)
- ✅ OpenNext Cloudflare 설정 완료 (`@opennextjs/cloudflare@1.9.2`)
- ❌ **Workers 코드가 구버전** (2025-10-09) - 한국어 변경사항 미반영

**근본 원인**:
배포된 Workers에 최신 `composer.ts` 변경사항이 반영되지 않음

---

## ✅ 2025-10-11 Workers Deployment (COMPLETED)

### What Was Done:

#### 1. 배포 상태 확인 ✅
**확인 내용**:
- 웹사이트 (kosha-8ad.pages.dev): 한국어 정상 표시 확인
- Workers API: 한국어 코드는 작성되었으나 배포 필요
- 마지막 배포: 2025-10-10 14:51 (구버전)

#### 2. Workers 재배포 ✅
**배포 정보**:
- 시간: 2025-10-11 00:52 KST
- Version ID: `dee43273-a3b1-4980-9d93-7320a2fe2ed1`
- URL: https://safe-ops-studio-workers.yosep102033.workers.dev
- Wrangler: 3.114.15 사용
- Upload Size: 52.05 KiB / gzip: 11.02 KiB
- Startup Time: 12 ms

#### 3. 한국어 응답 검증 ✅
**테스트 결과**:
```bash
# 입력: 영어 재해 정보
# 출력: 한국어 OPS 문서 (정상)
{
  "success": true,
  "data": {
    "summary": "2025년 1월 15일에 Fall 재해가 발생했습니다.\n장소: Seoul Construction Site\n주요 원인: Worker fell from 3rd floor without safety harness\n이 재해는 즉각적인 조사와 예방 조치가 필요합니다.\n모든 관련 이해관계자는 이 OPS 자료를 검토해야 합니다.",
    "causes": {
      "direct": ["Worker fell from 3rd floor without safety harness", "부적절한 추락 방지 조치"],
      "indirect": ["불충분한 안전 교육 또는 인식", "부적절한 위험성 평가 절차", "정기적인 안전 장비 점검 부족", "고위험 작업에 대한 부적절한 감독"]
    },
    "checklist": [
      "작업 시작 전 종합적인 위험성 평가 실시",
      "모든 근로자가 필수 안전 교육을 이수했는지 확인",
      "모든 안전 장비가 사용 가능하고 양호한 상태인지 확인",
      "비상 상황을 위한 명확한 의사소통 체계 구축",
      "모든 추락 방지 시스템 및 고정점 점검",
      "개인 추락방지시스템의 적절한 사용 확인",
      "안전난간 및 안전장벽이 안전하게 설치되었는지 확인",
      "높은 곳 작업 구역의 적절한 조명 확보"
    ],
    "laws": [
      {"title": "산업안전보건법 제38조 (추락 등의 위험 방지)", "url": "..."},
      {"title": "산업안전보건기준에 관한 규칙 제42조 (개구부 등의 방호 조치)", "url": "..."}
    ]
  }
}
```

#### 4. 배포 완료 확인 ✅
**현재 상태**:
- ✅ Frontend (Pages): 한국어 UI 정상 작동
- ✅ Backend (Workers): 한국어 OPS 생성 정상 작동
- ✅ API 응답: UTF-8 인코딩 정상
- ✅ 법령 매칭: 한국 법령 정상 표시

---

## ✅ 2025-10-11 Dynamic Route Fix (COMPLETED)

### What Was Done:

#### 1. Deployment Architecture Change ✅
**변경 사항**:
- OpenNext → Next.js Static Export로 전환 완료 (이전 세션)
- GitHub Actions workflow 수정: `.open-next` → `out` 경로
- `next.config.js`: `output: 'export'` 설정
- `package.json`: OpenNext 빌드 스크립트 제거

#### 2. Dynamic Route 404 Issue Diagnosis ✅
**문제 확인**:
- 사용자가 OPS 발행 시 404 오류 발생 (예: `/p/mglnfd7r-q3lh2`)
- 스크린샷: "OPS 문서 발행 완료" 모달 표시되지만 링크 접근 불가
- 삽화도 생성되지 않음

**근본 원인**:
- Next.js static export는 `fallback: 'blocking'`을 지원하지 않음
- `getStaticPaths`에서 빈 paths 반환 시 동적 경로 생성 불가
- SSG는 빌드 타임에 모든 경로를 알아야 하지만, OPS 문서는 런타임에 생성됨

#### 3. Client-Side Rendering으로 전환 ✅
**파일 수정**: `apps/web/pages/p/[slug].tsx`

**변경 내용**:
- `getStaticPaths` 및 `getStaticProps` 완전 제거
- `useRouter`로 동적 slug 파라미터 추출
- `useState` + `useEffect`로 클라이언트 사이드 데이터 페칭 구현
- 로딩 상태 추가 (스피너 애니메이션)
- 에러 핸들링 개선

**코드 구조**:
```typescript
export default function PublicOPSPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [opsData, setOpsData] = useState<OPSData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    // Fetch OPS data from API
    fetch(`${API_URL}/api/ops/${slug}`)...
  }, [slug]);

  // Render loading, error, or content
}
```

#### 4. 빌드 및 배포 ✅
**빌드 결과**:
```
✓ Compiled successfully in 5.7s
✓ Generating static pages (5/5)
✓ Exporting (5/5)

Route (pages)                    Size  First Load JS
├ ○ / (314 ms)                2.78 kB         103 kB
├ ○ /404                      2.28 kB          99 kB
├ ○ /builder (303 ms)         5.49 kB         102 kB
└ ○ /p/[slug] (301 ms)        2.18 kB         102 kB
```

**커밋 정보**:
- Commit: `69470d2`
- Message: "Fix dynamic route 404 by converting to client-side rendering"
- Push: `main` 브랜치에 성공적으로 푸시됨

#### 5. 현재 배포 대기 중 ✅
**GitHub Actions**:
- 배포 트리거됨 (커밋 `69470d2`)
- 두 개의 Job 실행 중:
  1. `deploy-web`: Next.js → Cloudflare Pages
  2. `deploy-workers`: Cloudflare Workers

**예상 결과**:
- ✅ 발행된 OPS 문서 URL 접근 가능 (예: `/p/mglnfd7r-q3lh2`)
- ✅ 동적 경로가 클라이언트 사이드에서 렌더링
- ✅ Workers API에서 OPS 데이터 페칭

### Technical Details:

**Before (SSG with getStaticPaths)**:
- ❌ `fallback: 'blocking'` - static export와 호환 불가
- ❌ 빌드 타임에 경로를 알 수 없어 404 발생
- ❌ `revalidate` - ISR 기능 static export에서 미지원

**After (CSR with useEffect)**:
- ✅ 클라이언트 사이드에서 런타임에 데이터 페칭
- ✅ 사용자가 생성한 동적 콘텐츠 지원
- ✅ 로딩/에러 상태 UX 개선
- ✅ Next.js static export와 완전 호환

**Trade-offs**:
- SEO: SSR/SSG보다 낮음 (하지만 공개 OPS는 검색엔진 최적화가 필수 요구사항 아님)
- 성능: 초기 로딩 시 API 요청 필요 (하지만 Workers API는 빠름)
- UX: 로딩 스피너 표시됨 (명확한 피드백 제공)

---

## ⚠️ Known Issues

### 1. Vooster MCP Not Connected
**Status**: ❌ Not Working
**Symptom**: Vooster MCP 도구가 Claude Code에서 사용 불가
**Current Workaround**:
- Vooster CLI 사용 (`vooster tasks:download`)
- 수동으로 `.vooster/tasks.json` 확인

**Available MCP Servers**:
- ✅ `mcp__cloudflare-bindings__*`
- ✅ `mcp__cloudflare-docs__*`
- ✅ `mcp__cloudflare-observability__*`
- ❌ `mcp__vooster__*` (NOT AVAILABLE)

**Investigation Needed**:
- [ ] Check MCP server configuration in Claude Code settings
- [ ] Verify Vooster MCP server installation
- [ ] Review Vooster CLI authentication status

### 2. Wrangler Authentication
**Status**: ⚠️ Requires Manual Setup
**Issue**: `CLOUDFLARE_API_TOKEN` not set for non-interactive environment
**Workaround**: Using Cloudflare MCP for D1/KV operations instead of Wrangler CLI

### 3. Workers Deployment (RESOLVED ✅ 2025-10-11)
**Status**: ✅ RESOLVED
**Issue**: 최신 한국어 변경사항이 프로덕션에 미배포됨
**Resolution**:
- Workers 재배포 완료 (2025-10-11 00:52 KST)
- Version ID: `dee43273-a3b1-4980-9d93-7320a2fe2ed1`
- 한국어 응답 정상 작동 확인 완료

**Test Results**:
```json
{
  "summary": "2025년 1월 15일에 Fall 재해가 발생했습니다...",
  "causes": {
    "direct": [...],
    "indirect": ["불충분한 안전 교육 또는 인식", ...]
  },
  "checklist": ["작업 시작 전 종합적인 위험성 평가 실시", ...],
  "laws": [...]
}
```

---

## ✅ 2025-10-19 Frontend Illustration Display (COMPLETED)

### What Was Done:

#### 1. Frontend Implementation ✅
**목표**: Builder 및 Public OPS 페이지에 Gemini 생성 삽화 표시

**변경 파일**:
1. `apps/web/components/Preview.tsx` - 미리보기 컴포넌트 로딩 UX 개선
2. `apps/web/pages/p/[slug].tsx` - Public OPS 페이지에 삽화 표시 추가

#### 2. Preview Component 개선 ✅
**파일**: `apps/web/components/Preview.tsx`

**변경 내용**:
- 삽화 placeholder 개선 (lines 209-228)
- 생성 진행 상태 표시 추가
- "Google Gemini 2.5 Flash로 생성 중 (약 30초 소요)" 메시지
- Gradient background + animated pulse 효과
- KOSHA 안전 매뉴얼 스타일 안내 추가

**코드 하이라이트**:
```typescript
{data.imageMeta && data.imageMeta.type === 'placeholder' && (
  <div className="mb-4 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
    <div className="text-6xl mb-3 animate-pulse">🎨</div>
    <p className="text-base font-semibold text-gray-700 mb-2">
      {state === 'generating'
        ? 'AI 안전 교육 삽화 생성 중...'
        : '삽화는 AI 생성 후 표시됩니다'}
    </p>
    {state === 'generating' && (
      <div className="mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          <span>Google Gemini 2.5 Flash로 생성 중 (약 30초 소요)</span>
        </div>
      </div>
    )}
  </div>
)}
```

#### 3. Public OPS Page 업데이트 ✅
**파일**: `apps/web/pages/p/[slug].tsx`

**변경 내용**:
- Summary 탭에 삽화 표시 추가 (lines 190-204)
- 생성된 이미지와 attribution footer
- Responsive 이미지 레이아웃 (border + shadow)

**코드 하이라이트**:
```typescript
{activeTab === 'summary' && (
  <div>
    <h2 className="text-xl font-semibold mb-4">사고 개요</h2>

    {/* Illustration */}
    {opsDocument.imageMeta && opsDocument.imageMeta.type === 'generated' && opsDocument.imageMeta.url && (
      <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <img
          src={opsDocument.imageMeta.url}
          alt="재해 상황 삽화"
          className="w-full h-auto"
        />
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            🤖 AI 생성 안전 교육 삽화 (Google Gemini 2.5 Flash)
          </p>
        </div>
      </div>
    )}

    <p className="whitespace-pre-line text-gray-700">{opsDocument.summary}</p>
  </div>
)}
```

#### 4. 빌드 및 배포 ✅
**빌드 결과**:
```bash
npm run build
✓ Compiled successfully
Route (pages)              Size     First Load JS
├ ○ /                      2.78 kB        103 kB
├ ○ /404                   2.28 kB         99 kB
├ ○ /analytics (320 ms)    1.54 kB         99 kB
├ ○ /builder (323 ms)      5.49 kB        102 kB
└ ○ /p/[slug] (298 ms)     2.39 kB        102 kB  # 삽화 표시 추가
```

**Cloudflare Pages 배포**:
```bash
npx wrangler pages deploy out --project-name=kosha --commit-dirty=true

✨ Success! Uploaded 13 files (19 already uploaded) (3.20 sec)
✨ Uploading _redirects
🌎 Deploying...
✨ Deployment complete!
🌎 URL: https://ab1f7c5e.kosha-8ad.pages.dev
```

#### 5. Git Commit ✅
**커밋 정보**:
- Commit: `fdbcb3d`
- Message: "Add Gemini illustration display to frontend"
- Files changed: 2 files, 34 insertions, 5 deletions

**커밋 내용**:
```
Add Gemini illustration display to frontend

Major improvements:
1. Enhanced Preview component loading UX
   - Added detailed progress indicator for AI generation
   - Shows "Google Gemini 2.5 Flash로 생성 중 (약 30초 소요)"
   - Improved placeholder with gradient background

2. Added illustration display to public OPS page
   - Shows generated illustration with KOSHA style
   - Attribution footer: "🤖 AI 생성 안전 교육 삽화 (Google Gemini 2.5 Flash)"
   - Responsive image layout with border and shadow

Changes:
- apps/web/components/Preview.tsx: Enhanced loading state with progress indicator
- apps/web/pages/p/[slug].tsx: Added illustration display in summary tab

Deployment:
- Production: https://ab1f7c5e.kosha-8ad.pages.dev
```

### 완료된 기능 요약:

**✅ Gemini 삽화 생성 Full Stack 구현 완료**:
1. **Backend** (2025-10-19 오전):
   - Google Gemini 2.5 Flash Image API 통합
   - KOSHA 안전 매뉴얼 스타일 프롬프트 엔지니어링
   - Cloudflare Workers 배포 + Secrets 설정
   - Production: https://safe-ops-studio-workers.yosep102033.workers.dev

2. **Frontend** (2025-10-19 오후):
   - Builder 미리보기에 삽화 로딩/표시
   - Public OPS 페이지에 삽화 표시
   - 생성 진행 상태 UX 개선
   - Production: https://ab1f7c5e.kosha-8ad.pages.dev

**테스트 시나리오**:
1. Builder에서 OPS 생성 → 실시간 미리보기에 placeholder 표시
2. 약 30초 후 → Gemini가 생성한 삽화로 교체
3. OPS 발행 → Public 페이지에서 삽화 확인
4. 삽화 attribution: "🤖 AI 생성 안전 교육 삽화 (Google Gemini 2.5 Flash)"

**기술 스택**:
- **Image Generation**: Google Gemini 2.5 Flash (500 images/day free)
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`
- **Response Format**: Base64-encoded PNG (data URL)
- **Style**: KOSHA safety manual style (cartoon with outlines, flat colors)
- **Generation Time**: ~30 seconds average

**Production URLs**:
- Backend API: https://safe-ops-studio-workers.yosep102033.workers.dev
- Frontend: https://ab1f7c5e.kosha-8ad.pages.dev

---

## 📝 Development Guidelines (Quick Reference)

### TDD Workflow:
1. **RED**: Write failing test
2. **GREEN**: Minimal code to pass
3. **REFACTOR**: Clean up
4. **COMMIT**: Small, frequent commits

### Code Standards:
- **TypeScript**: No `any` types
- **React**: Pages Router, useState/Context API only (no Redux)
- **API**: RESTful, JSON, proper HTTP status codes
- **Security**: Parameterized queries, input validation, secrets in env vars
- **Cloudflare Free**: Optimize for free tier (client-side PDF, KV caching)

### File Naming:
- Components: `SubscriptionForm.tsx`
- API handlers: `handlers.ts`
- Tests: `*.test.ts`
- Types: `models.ts` or `types.ts`

---

## 🎯 Success Metrics (MVP Goals)

- [ ] First OPS in ≤10 minutes
- [ ] ≥70% law suggestion hit-rate
- [ ] PDF render ≤5s on mobile/desktop
- [ ] Email delivery ≥98% success rate

---

## 📞 Quick Commands

```bash
# Web development
cd apps/web
npm run dev          # http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint

# Workers development
cd apps/workers
npm run dev          # Wrangler dev server
npm run deploy       # Deploy to Cloudflare

# Vooster tasks
vooster tasks:download     # Refresh task list
vooster --help            # Available commands

# Database (via MCP)
# Use Cloudflare MCP tools in Claude Code
```

---

## 🔗 Important Links

- Vooster Project: https://vooster.ai/project/UNMR
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Project Documentation: `./vooster-docs/`
- Task Details: `./.vooster/tasks/`

---

## ✅ 2025-10-19 Gemini 삽화 생성 구현 (COMPLETED)

### What Was Done:

#### 1. API 조사 및 선택 ✅
**무료 API 비교 분석**:
| API | 무료 한도 | 품질 | 통합 난이도 | 선택 |
|-----|---------|------|-----------|------|
| **Google Gemini 2.5 Flash Image** | 500/day | 최고 | 중간 | ✅ 선택됨 |
| Cloudflare Workers AI (FLUX) | 2,083/day | 높음 | 쉬움 | 기존 구현 |
| Together AI (FLUX Schnell) | 무제한 (3개월) | 높음 | 쉬움 | - |
| Hugging Face | ~수백/hour | 중간 | 쉬움 | - |
| Replicate | 50/month | 최고 | 쉬움 | - |

**Gemini 선택 이유**:
- 최신 모델 (2025년 8월 출시)
- 하루 500개 이미지 무료 (월 15,000개)
- 최고 품질 (state-of-the-art)
- 신용카드 등록 불필요

#### 2. 코드 구현 ✅
**파일 수정**: `apps/workers/src/ops/illustration.ts`

**변경 내용**:
- Cloudflare Workers AI → Google Gemini API로 전환
- API 엔드포인트: `gemini-2.0-flash-preview-image-generation`
- Response modalities: `['TEXT', 'IMAGE']` (필수)
- Temperature: 0.4 (일관된 안전 삽화)

**핵심 코드**:
```typescript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.4,
      },
    }),
  }
);
```

#### 3. 환경 변수 설정 ✅
**파일 생성**: `apps/workers/.dev.vars`
```bash
GEMINI_API_KEY=AIzaSyCR86W1Pes7SIIKhTQWEbB8YQ5_1jUIPtU
```

**파일 업데이트**: `.dev.vars.example`
- GEMINI_API_KEY 템플릿 추가

#### 4. 테스트 성공 ✅
**로컬 테스트 결과**:
```json
{
  "success": true,
  "data": {
    "imageMeta": {
      "type": "generated",
      "url": "data:image/png;base64,iVBORw0KG..."
    }
  }
}
```

**성공 확인**:
- ✅ Gemini API 호출 성공
- ✅ Base64 PNG 이미지 생성
- ✅ OPS 문서에 삽화 자동 포함
- ✅ 응답 시간: ~28초 (허용 범위)

### Technical Details:

**API 응답 구조**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "inlineData": {
          "mimeType": "image/png",
          "data": "<base64_encoded_image>"
        }
      }]
    }
  }]
}
```

**에러 해결 이력**:
1. **문제**: `responseModalities: ['IMAGE']` → 400 Error
   - **원인**: Gemini 2.0은 IMAGE만 단독 지원 안 함
   - **해결**: `responseModalities: ['TEXT', 'IMAGE']`로 변경

**이미지 저장 방식**:
- 현재: Base64 data URL (프론트엔드에 직접 전달)
- 향후: R2 Bucket에 저장 가능 (옵션)

### Benefits:

1. **비용**: 완전 무료 (하루 500개 한도)
2. **품질**: 최신 Gemini 모델 (state-of-the-art)
3. **유연성**: 텍스트 + 이미지 동시 생성 가능
4. **확장성**: 필요시 Gemini Pro로 업그레이드 가능

---

## 🚀 Next Tasks (해커톤 개선 계획)

### 계획 수립일: 2025-10-19
### 업데이트: 2025-10-19 (삽화 생성 완료)

#### ~~우선순위 1: 삽화 생성 기능 개선~~ ✅ COMPLETED
(이동됨: 위 섹션 참조)

---

#### 우선순위 2: 법령 DB 확장 (Law Rules Database Expansion)
**목표**: 50개 → 500개 법령 조항으로 확장하여 매핑 정확도 향상

**현재 상태**:
- 법령 개수: 50개 (추정)
- 커버리지: ~10% (주요 사고 유형만)
- 정확도: 낮음 (1~2개 법령만 매핑)

**확장 계획**:
| 단계 | 개수 | 커버리지 | 정확도 | 작업량 |
|-----|------|---------|-------|-------|
| 1단계 (현재) | 50개 | 10% | 낮음 | - |
| 2단계 (목표) | 200개 | 40% | 중간 | 4~6시간 |
| 3단계 (확장) | 500개 | 70% | 높음 | 12~16시간 |

**2단계 법령 구성 (200개)**:
1. **추락 사고** (50개)
   - 산업안전보건법 제38조~제42조 (고소작업, 개구부 등)
   - 시행령 제42조 (안전난간 설치 기준)
   - 시행규칙 제54조~제60조 (안전대, 안전모 등)
   - 건설안전기준 제11조~제20조

2. **협착 사고** (30개)
   - 산업안전보건법 제80조~제85조 (기계 안전)
   - 시행규칙 제80조~제95조 (방호장치)

3. **감전 사고** (40개)
   - 산업안전보건법 제60조~65조 (전기 안전)
   - 시행규칙 제300조~제330조 (전기 설비)

4. **화재/폭발** (40개)
   - 산업안전보건법 제90조~제95조
   - 위험물안전관리법

5. **중독/질식** (40개)
   - 산업안전보건법 제120조~제130조
   - 화학물질관리법

**데이터 수집 방법**:
1. **수동 입력** (초기 100개)
   - 공단 홈페이지에서 주요 조항 복사
   - `scripts/seed-laws.ts` 스크립트 작성
   - SQL INSERT 문 생성

2. **크롤링** (이후 100개)
   - 국가법령정보센터 API 활용
   - 키워드별 관련 법령 자동 매칭
   - 중복 제거 및 검증

**구현 계획**:
1. **Seed 스크립트 작성** (`scripts/seed-laws.ts`)
   ```typescript
   const lawRules = [
     { keyword: '추락', law_title: '산업안전보건법 제38조', url: '...' },
     { keyword: '추락', law_title: '시행령 제42조', url: '...' },
     // ... 200개
   ];
   ```

2. **DB 마이그레이션 실행**
   ```bash
   wrangler d1 execute safe-ops-studio-db --file=scripts/seed-laws.sql
   ```

3. **매핑 로직 개선** (`apps/workers/src/ops/composer.ts`)
   - 다중 키워드 매칭 (예: "3층 추락" → "추락" + "고소작업" + "3m 이상")
   - 가중치 기반 정렬 (정확도 순)

**예상 작업 시간**: 4~6시간 (200개 기준)

---

#### 통합 작업 계획 (추천)
**Day 1 (3시간)**:
1. Cloudflare Workers AI 설정 및 테스트 (30분)
2. 삽화 생성 로직 개발 (1시간)
3. R2 Bucket 생성 및 저장 로직 (30분)
4. 프론트엔드 통합 및 테스트 (1시간)

**Day 2 (6시간)**:
1. 법령 데이터 수집 (100개) (3시간)
2. Seed 스크립트 작성 및 실행 (1시간)
3. 매핑 로직 개선 (1시간)
4. 통합 테스트 및 검증 (1시간)

**총 예상 시간**: 9시간

---

#### 다음 세션 시작 시 할 일
```bash
# 1. 현재 진행 상황 확인
cat notes.md

# 2. 삽화 생성 기능부터 시작
cd apps/workers
# Cloudflare Workers AI 바인딩 확인
cat wrangler.toml

# 3. 또는 법령 DB 확장부터 시작
cd scripts
# Seed 스크립트 작성
touch seed-laws.ts
```

---

#### 참고 자료
- Cloudflare Workers AI 문서: https://developers.cloudflare.com/workers-ai/
- Stable Diffusion 프롬프트 가이드: https://stable-diffusion-art.com/prompt-guide/
- 국가법령정보센터 API: https://www.law.go.kr/

---

## ✅ 2025-10-19 Gemini 삽화 생성 배포 완료 (PRODUCTION DEPLOYED)

### 배포 완료 사항

**Google Gemini 2.5 Flash Image API 통합 및 프로덕션 배포 성공**

#### 1. 기술 스택 변경
- ❌ 기존: Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`)
- ✅ 신규: **Google Gemini 2.5 Flash Image API**
  - Model: `gemini-2.0-flash-preview-image-generation`
  - Free Tier: 500 images/day
  - API Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`

#### 2. 구현 완료 파일
- `apps/workers/src/ops/illustration.ts` - 완전히 재작성
- `apps/workers/.dev.vars` - GEMINI_API_KEY 추가
- `apps/workers/.dev.vars.example` - 템플릿 업데이트

#### 3. 배포 완료 내역
```bash
# Wrangler Secrets 설정
echo "AIzaSyCR86W1Pes7SIIKhTQWEbB8YQ5_1jUIPtU" | npx wrangler secret put GEMINI_API_KEY
# ✅ Success! Uploaded secret GEMINI_API_KEY

# Workers 배포
npx wrangler deploy
# ✅ Deployed to: https://safe-ops-studio-workers.yosep102033.workers.dev
# Version ID: 7e305f1d-1445-42cc-928f-020f89454bee
```

#### 4. 프로덕션 테스트 성공
```bash
curl -X POST https://safe-ops-studio-workers.yosep102033.workers.dev/api/ops/generate \
  -H "Content-Type: application/json" \
  -d '{"incidentDate":"2025-01-15T10:00:00","location":"서울 건설 현장","incidentType":"추락","incidentCause":"3층 높이에서 안전벨트 미착용으로 추락"}'

# ✅ Response: {"success":true,"data":{..., "imageMeta":{"type":"generated","url":"data:image/png;base64,..."}}}
```

#### 5. 주요 이슈 해결
**문제**: `GEMINI_API_KEY not configured` 에러 (Secret 추가 후에도 발생)
**원인**: `wrangler secret put` 대화형 입력에서 값이 제대로 전달 안됨
**해결**: `echo "API_KEY" | wrangler secret put GEMINI_API_KEY` 방식으로 재설정

#### 6. API 요청 구조
```typescript
{
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ['TEXT', 'IMAGE'], // ⚠️ 필수: TEXT 포함
    temperature: 0.4
  }
}
```

#### 7. 응답 구조
```typescript
{
  candidates: [{
    content: {
      parts: [{
        inlineData: {
          mimeType: 'image/png',
          data: '<base64-encoded-image>'
        }
      }]
    }
  }]
}
```

#### 8. 프로덕션 URL
- **Workers API**: https://safe-ops-studio-workers.yosep102033.workers.dev
- **OPS 생성**: `POST /api/ops/generate`
- **건강 체크**: `GET /health`

#### 9. 사용량 모니터링
- **무료 한도**: 500 images/day (Google AI Studio)
- **현재 사용**: 프로덕션 테스트 2회
- **모니터링**: Google AI Studio Console

#### 10. 다음 단계
- ✅ 프로덕션 배포 완료
- ⏭️ 프론트엔드에서 삽화 표시 기능 구현
- ⏭️ 법령 DB 확장 (산업안전보건법, 산업안전보건기준에 관한 규칙)

---

## ✅ 2025-10-27 법제처 Open API 연결 작업 (IN PROGRESS)

### What Was Done:

#### 1. 법제처 Open API 승인 완료 ✅
**승인 정보**:
- 이메일 ID: `yosep102033` (yosep102033@gmail.com)
- 도메인: `safe-ops-studio-workers.yosep102033.workers.dev`
- 승인 상태: **승인 완료** (2025-10-27)
- API 종류: 대한민국 현행법령 목록/본문 (HTML, XML, JSON)

#### 2. Workers 법령 검색 모듈 구현 ✅
**파일 생성**: `apps/workers/src/law/mojLawApi.ts`

**주요 기능**:
- `searchLaws()`: 법령 검색 (법령명 기반)
- `getLawContent()`: 법령 본문 조회 (법령 ID 기반)
- `searchOccupationalSafetyLaws()`: 산업안전보건 관련 법령 검색

**API 설정**:
- Base URL: `http://www.law.go.kr` (HTTP, not HTTPS)
- 엔드포인트: `/DRF/lawSearch.do?target=law`
- 인증: OC 파라미터 (도메인 기반 인증)
- 응답 형식: JSON, XML, HTML

**요청 헤더**:
```typescript
headers: {
  'Accept': 'application/json',
  'Referer': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
  'Origin': 'https://safe-ops-studio-workers.yosep102033.workers.dev',
}
```

#### 3. 테스트 엔드포인트 추가 ✅
**Workers 라우터 업데이트**: `apps/workers/src/index.ts`

**새로운 엔드포인트**:
- `GET /api/test/moj-law-api?query={법령명}` - 법제처 API 직접 테스트
- `GET /api/test/safety-laws` - 산업안전보건 법령 검색 테스트

#### 4. Workers 배포 완료 ✅
**배포 정보**:
- Version ID: `5f932982-8af6-4a24-84f2-eba447f9795f`
- URL: https://safe-ops-studio-workers.yosep102033.workers.dev
- Upload Size: 132.57 KiB / gzip: 29.16 KiB

### ⚠️ 현재 이슈: 530 에러

**문제**:
법제처 API 호출 시 HTTP 530 에러 발생
```json
{
  "success": false,
  "error": "법제처 API 호출 실패: 530"
}
```

**시도한 해결책**:
1. ✅ HTTP/HTTPS 프로토콜 수정 (https → http)
2. ✅ Referer/Origin 헤더 추가
3. ✅ 도메인 주소 정확성 확인

**가장 가능성 높은 원인**:
- **승인 반영 시간** - 오늘(2025-10-27) 승인 완료
- 일반적으로 공공 API는 **1-24시간** 반영 시간 필요
- 내일(2025-10-28) 재테스트 예정 ⏳

**대안**:
- 법제처 공동활용 유지보수팀 문의: **02-2109-6446**
- 확인 사항:
  - 도메인 등록 시 http/www 포함 여부
  - Cloudflare Workers (*.workers.dev) 지원 여부
  - 승인 후 반영 소요 시간

### 📝 다음 세션 시작 시 할 일 (2025-10-28)

#### 1️⃣ 법제처 API 재테스트 (최우선)
```bash
# Workers에서 직접 테스트
curl "https://safe-ops-studio-workers.yosep102033.workers.dev/api/test/moj-law-api?query=%EC%82%B0%EC%97%85%EC%95%88%EC%A0%84%EB%B3%B4%EA%B1%B4%EB%B2%95"

# 성공하면 다음 단계로:
curl "https://safe-ops-studio-workers.yosep102033.workers.dev/api/test/safety-laws"
```

**예상 결과 (성공 시)**:
```json
{
  "success": true,
  "message": "법제처 API 연결 성공!",
  "data": {
    "target": "law",
    "totalCnt": 5,
    "법령": [
      {
        "법령ID": "...",
        "법령명한글": "산업안전보건법",
        "시행일자": "...",
        "소관부처명": "고용노동부"
      }
    ]
  }
}
```

#### 2️⃣ API 연결 실패 시 (Plan B)
- 법제처에 전화 문의 (02-2109-6446)
- 기존 법령 규칙 DB 사용 (50개)
- 법령 매칭 로직 개선으로 정확도 향상

#### 3️⃣ API 연결 성공 시
- 법령 DB 자동 저장 기능 구현
- 키워드 기반 매칭 로직 개선
- 산업안전보건법 관련 500개 법령 수집

### Technical Details:

**법제처 API 엔드포인트 구조**:
```
http://www.law.go.kr/DRF/lawSearch.do?
  OC=yosep102033&
  target=law&
  type=JSON&
  query={법령명}&
  display=20&
  page=1
```

**응답 필드**:
- 법령ID: 고유 식별자
- 법령명한글: 법령명
- 법령약칭명: 약칭
- 공포일자: 공포일
- 시행일자: 시행일
- 소관부처명: 담당 부처

**코드 위치**:
- API 클라이언트: `apps/workers/src/law/mojLawApi.ts`
- 라우터: `apps/workers/src/index.ts` (lines 224-280)
- 테스트 URL: `https://safe-ops-studio-workers.yosep102033.workers.dev/api/test/moj-law-api`

---

## ✅ 2025-10-29 Critical Fixes (COMPLETED)

### What Was Done:

#### 1. 이미지 생성 오류 수정 ✅
**문제**: "Data validation warning: laws: Too big: expected array to have <=10 items"
- Gemini API가 `laws` 배열을 최대 10개로 제한
- `matchLaws()` 함수가 무제한으로 법령 반환

**해결책**: `apps/workers/src/law/matcher.ts`
- laws 배열을 `.slice(0, 10)`으로 제한 (line 197)
- Gemini API validation 준수

**코드 변경**:
```typescript
// Remove duplicates
const unique = laws.filter((law, index, self) =>
  index === self.findIndex(l => l.title === law.title)
);

// Limit to 10 laws to comply with Gemini API validation
// (Gemini expects laws array to have <=10 items for image generation)
return unique.slice(0, 10);
```

#### 2. 액세스 키 요구 제거 ✅
**문제**: 일반 사용자가 OPS를 저장할 때 액세스 키 요구
- `/api/ops/save` 엔드포인트가 `requireAuth`로 보호됨
- 일반 사용자는 OPS를 생성하고 발행할 수 있어야 함

**해결책**: `apps/workers/src/index.ts`
- `/api/ops/save` 엔드포인트를 public으로 변경 (line 109-120)
- 액세스 키는 관리자 전용 기능에만 사용:
  - `/api/subscribers` (구독자 리스트 조회)
  - `/api/send` (이메일 발송)

**코드 변경**:
```typescript
// OPS save endpoint (public - anyone can save their OPS)
if (path === '/api/ops/save') {
  const response = await handleSaveOPS(request, env);
  // ... CORS headers
}
```

#### 3. 배포 및 테스트 ✅
**배포 정보**:
- Version ID: `5c74d286-f4ad-46db-bfb3-06315bb927ad`
- URL: https://safe-ops-studio-workers.yosep102033.workers.dev
- Upload: 133.99 KiB / gzip: 29.31 KiB
- Startup Time: 13 ms

**프로덕션 테스트 결과**:
```bash
curl -X POST .../api/ops/generate \
  -d '{"incidentDate":"2025-01-15T10:00:00","location":"서울 건설 현장","incidentType":"추락","incidentCause":"3층 높이에서 안전벨트 미착용으로 추락"}'

# ✅ Response:
{
  "success": true,
  "data": {
    "laws": [...], // 정확히 10개
    "imageMeta": {
      "type": "generated",
      "url": "data:image/png;base64,..." // 이미지 생성 성공
    }
  }
}
```

### Technical Details:

**수정된 파일**:
1. `apps/workers/src/law/matcher.ts` (line 195-197)
   - laws 배열 크기 제한 추가

2. `apps/workers/src/index.ts` (line 109-120)
   - `/api/ops/save` 액세스 키 제거

**영향 받는 기능**:
- ✅ 이미지 생성: laws 배열이 10개를 초과해도 오류 없음
- ✅ OPS 저장: 일반 사용자가 액세스 키 없이 저장 가능
- ✅ 법령 매칭: 최대 10개의 가장 관련성 높은 법령 표시

**남아있는 보호된 엔드포인트** (액세스 키 필요):
- `POST /api/law/rules` - 법령 규칙 생성
- `PUT /api/law/rules/:id` - 법령 규칙 수정
- `DELETE /api/law/rules/:id` - 법령 규칙 삭제
- `GET /api/subscribers` - 구독자 리스트 조회
- `POST /api/send` - 이메일 발송

---

**Note**: This file is referenced in `CLAUDE.md`. Always update this file when completing tasks or encountering issues.
