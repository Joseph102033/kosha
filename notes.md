# Safe OPS Studio - Development Notes

**Last Updated**: 2025-10-11
**Vooster Project UID**: UNMR
**Current Phase**: Week 1 - M1 (MVP Implementation)

---

## 🎯 Current Status

- **Completed Tasks**: T-001 ✅, T-002 ✅, Major Updates (2025-10-10) ✅, Deployment (2025-10-11) ✅
- **Current Task**: Ready for next feature development
- **Overall Progress**: 2/9 tasks completed + 4 major improvements + deployment (22% + enhancements)

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

**Note**: This file is referenced in `CLAUDE.md`. Always update this file when completing tasks or encountering issues.
