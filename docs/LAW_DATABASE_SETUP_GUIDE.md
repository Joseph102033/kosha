# Law Database Setup Guide

## 개요

Safe OPS Studio의 산업안전보건 법령 데이터베이스 설정 가이드입니다. 이 가이드는 D1 데이터베이스에 법령 테이블을 생성하고, FTS5 전문 검색 인덱스를 설정하며, 샘플 데이터(42개 조문)를 입력하는 전체 과정을 다룹니다.

## 사전 준비

### 필수 요구사항
- **Wrangler CLI** 설치 (`npm install -g wrangler`)
- **Cloudflare 계정** 및 로그인 (`wrangler login`)
- **D1 데이터베이스** 생성 완료

### 현재 D1 데이터베이스 정보
- **Database ID**: `4409b768-3430-4d91-8665-391c977897c7`
- **Database Name**: `kosha-db`

## 1단계: 마이그레이션 파일 확인

다음 마이그레이션 파일들이 준비되어 있습니다:

```
apps/workers/migrations/
├── 0001_initial_schema.sql       # 기존 스키마 (subscribers, ops_documents, etc.)
├── 0002_seed_law_rules.sql       # 기존 law_rules 데이터
├── 0003_laws_full_text.sql       # ✅ 신규: laws 테이블 + FTS5
└── 0004_seed_laws.sql            # ✅ 신규: 42개 샘플 법령 데이터
```

### 마이그레이션 0003 내용
- `laws` 테이블 생성 (id, law_code, law_title, article_no, clause_no, text, effective_date, keywords, source_url)
- `laws_fts` FTS5 virtual table 생성 (unicode61 토크나이저)
- FTS5 동기화 트리거 3개 (insert, delete, update)
- `laws_search` view 생성

### 마이그레이션 0004 내용
- 42개 샘플 법령 조문 INSERT
- 법령 종류:
  - 산업안전보건법 (기본법)
  - 산업안전보건기준에 관한 규칙
- 주제별 분류:
  - 추락 방지 (7개)
  - 전기 안전 (4개)
  - 화학물질/폭발 (5개)
  - 화재 예방 (2개)
  - 건설 안전 (3개)
  - 중장비/양중기 (3개)
  - 밀폐공간 (3개)
  - 안전교육 (2개)
  - 작업환경 측정 (2개)
  - 건강검진 (2개)
  - 안전보건관리책임자 (3개)
  - 유해위험 방지계획서 (2개)
  - 위험성 평가 (2개)

## 2단계: 로컬 환경에서 마이그레이션 실행

### 방법 1: 개별 마이그레이션 실행 (권장)

```bash
# 프로젝트 루트로 이동
cd apps/workers

# 법령 테이블 생성 (FTS5 포함)
npx wrangler d1 execute kosha-db --local --file=./migrations/0003_laws_full_text.sql

# 샘플 데이터 입력
npx wrangler d1 execute kosha-db --local --file=./migrations/0004_seed_laws.sql
```

### 방법 2: 한 번에 실행

```bash
cd apps/workers
npx wrangler d1 execute kosha-db --local --file=./migrations/0003_laws_full_text.sql && \
npx wrangler d1 execute kosha-db --local --file=./migrations/0004_seed_laws.sql
```

### 예상 출력

```
🌀 Executing on kosha-db (local):
🚣 Executed 8 commands in 0.123s
✅ Success
```

## 3단계: 마이그레이션 검증

### 테이블 생성 확인

```bash
cd apps/workers
npx wrangler d1 execute kosha-db --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'laws%';"
```

예상 결과:
```
laws
laws_fts
laws_fts_data
laws_fts_idx
laws_fts_docsize
laws_fts_config
```

### 데이터 삽입 확인

```bash
# 총 레코드 수 확인
npx wrangler d1 execute kosha-db --local --command="SELECT COUNT(*) as total FROM laws;"

# 법령별 조문 수 확인
npx wrangler d1 execute kosha-db --local --command="SELECT law_title, COUNT(*) as count FROM laws GROUP BY law_title;"
```

예상 결과:
```
total: 42

산업안전보건법: 12
산업안전보건기준에 관한 규칙: 30
```

### FTS5 검색 테스트

```bash
# 키워드 검색 테스트: "추락"
npx wrangler d1 execute kosha-db --local --command="SELECT law_title, article_no, text FROM laws WHERE rowid IN (SELECT rowid FROM laws_fts WHERE laws_fts MATCH '추락') LIMIT 5;"

# 키워드 검색 테스트: "감전"
npx wrangler d1 execute kosha-db --local --command="SELECT law_title, article_no, text FROM laws WHERE rowid IN (SELECT rowid FROM laws_fts WHERE laws_fts MATCH '감전') LIMIT 5;"
```

## 4단계: 프로덕션 환경으로 마이그레이션

### 주의사항
⚠️ **프로덕션 마이그레이션은 되돌릴 수 없습니다!**
- 로컬 환경에서 충분히 테스트 후 진행하세요
- 가능하면 백업을 먼저 수행하세요

### 프로덕션 마이그레이션 실행

```bash
cd apps/workers

# 법령 테이블 생성 (FTS5 포함)
npx wrangler d1 execute kosha-db --remote --file=./migrations/0003_laws_full_text.sql

# 샘플 데이터 입력
npx wrangler d1 execute kosha-db --remote --file=./migrations/0004_seed_laws.sql
```

### 프로덕션 검증

```bash
# 프로덕션 데이터 확인
npx wrangler d1 execute kosha-db --remote --command="SELECT COUNT(*) as total FROM laws;"
npx wrangler d1 execute kosha-db --remote --command="SELECT law_title, COUNT(*) as count FROM laws GROUP BY law_title;"
```

## 5단계: Workers 배포

마이그레이션 완료 후 Workers를 배포하여 API 엔드포인트를 활성화합니다:

```bash
cd apps/workers
npx wrangler deploy
```

## 6단계: API 테스트

### 로컬 환경 테스트

```bash
# Workers 로컬 서버 시작
cd apps/workers
npm run dev

# 다른 터미널에서 API 테스트
# 전체 법령 목록 (첫 20개)
curl http://localhost:8787/api/laws/search

# 키워드 검색: "추락"
curl "http://localhost:8787/api/laws/search?query=추락"

# 법령명 필터: "산업안전보건법"
curl "http://localhost:8787/api/laws/search?law_title=산업안전보건법"

# 페이지네이션
curl "http://localhost:8787/api/laws/search?page=2&limit=10"

# 통계 조회
curl http://localhost:8787/api/laws/stats

# 법령명 목록
curl http://localhost:8787/api/laws/titles

# 특정 법령 조회
curl http://localhost:8787/api/laws/law-001
```

### 프로덕션 환경 테스트

배포 후 실제 URL로 동일한 테스트 수행:

```bash
# 예시 (실제 도메인으로 교체)
curl https://your-worker.your-domain.workers.dev/api/laws/search?query=감전
```

## 7단계: 프론트엔드 테스트

### Next.js 개발 서버 시작

```bash
cd apps/web
npm run dev
```

### Admin Laws 페이지 접속

브라우저에서 다음 URL로 접속:
```
http://localhost:3000/admin/laws
```

### 기능 테스트 체크리스트

- [ ] **페이지 로딩**: 통계 카드 3개 표시 확인
- [ ] **전체 목록 조회**: 초기 로딩 시 20개 법령 표시
- [ ] **키워드 검색**: "추락" 검색 시 관련 조문 표시
- [ ] **법령명 필터**: 드롭다운에서 법령 선택 시 필터링
- [ ] **페이지네이션**: 이전/다음 버튼 동작 확인
- [ ] **페이지 크기 변경**: 10/20/50/100 옵션 선택 시 변경
- [ ] **상세 보기**: 조문 클릭 시 모달 팝업 표시
- [ ] **외부 링크**: 원문 링크 클릭 시 새 탭에서 열림
- [ ] **검색 결과 없음**: 존재하지 않는 키워드 검색 시 안내 메시지
- [ ] **초기화 버튼**: 모든 필터 초기화

## 8단계: 스크린샷 캡처

관리자 페이지의 스크린샷을 캡처하여 문서화:

### 캡처 대상 (2장)

1. **검색 결과 화면**
   - 파일명: `admin_laws_search_result.png`
   - 내용: 키워드 "추락" 검색 후 결과 목록
   - 위치: `docs/images/admin/`

2. **상세 보기 모달**
   - 파일명: `admin_laws_detail_modal.png`
   - 내용: 특정 조문 클릭 후 상세 정보 표시
   - 위치: `docs/images/admin/`

### 캡처 방법

1. 브라우저에서 `http://localhost:3000/admin/laws` 접속
2. F12 개발자 도구 → Device Toolbar (Ctrl+Shift+M)
3. 해상도: 1920×1080 또는 1440×900
4. 스크린샷 도구 사용 또는 Print Screen

## 문제 해결 (Troubleshooting)

### 문제 1: "table laws already exists"

**원인**: 마이그레이션을 중복 실행

**해결**:
```bash
# 테이블 삭제 후 재생성 (로컬만)
npx wrangler d1 execute kosha-db --local --command="DROP TABLE IF EXISTS laws;"
npx wrangler d1 execute kosha-db --local --command="DROP TABLE IF EXISTS laws_fts;"
# 마이그레이션 재실행
npx wrangler d1 execute kosha-db --local --file=./migrations/0003_laws_full_text.sql
```

### 문제 2: FTS5 검색 결과 없음

**원인**: FTS5 테이블이 제대로 동기화되지 않음

**해결**:
```bash
# FTS5 테이블 재구축
npx wrangler d1 execute kosha-db --local --command="INSERT INTO laws_fts(laws_fts) VALUES('rebuild');"
```

### 문제 3: API 호출 시 404 에러

**원인**: Workers가 배포되지 않음 또는 잘못된 URL

**해결**:
```bash
# Workers 재배포
cd apps/workers
npx wrangler deploy

# wrangler.toml에서 routes 확인
```

### 문제 4: CORS 에러

**원인**: CORS 헤더가 제대로 설정되지 않음

**해결**:
- `apps/workers/src/index.ts`에서 `corsHeaders` 확인
- 모든 응답에 CORS 헤더가 포함되어 있는지 확인

### 문제 5: 한글 검색 안 됨

**원인**: FTS5 토크나이저 설정 오류

**해결**:
```bash
# unicode61 토크나이저 사용 확인
npx wrangler d1 execute kosha-db --local --command="SELECT * FROM laws_fts_config WHERE k='tokenize';"
# 결과: v = 'unicode61'
```

## 추가 리소스

### 관련 파일
- Migration: `apps/workers/migrations/0003_laws_full_text.sql`
- Seed Data: `apps/workers/migrations/0004_seed_laws.sql`
- Search Module: `apps/workers/src/law/search.ts`
- Admin Page: `apps/web/pages/admin/laws.tsx`
- Worker Routes: `apps/workers/src/index.ts`

### Cloudflare 문서
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [FTS5 in SQLite](https://www.sqlite.org/fts5.html)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

### API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/laws/search` | 법령 검색 (FTS5 + 필터) | 불필요 |
| GET | `/api/laws/:id` | 특정 법령 조회 | 불필요 |
| GET | `/api/laws/titles` | 법령명 목록 | 불필요 |
| GET | `/api/laws/stats` | 통계 정보 | 불필요 |

### 검색 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `query` | string | - | 검색 키워드 (FTS5) |
| `page` | number | 1 | 페이지 번호 (1부터 시작) |
| `limit` | number | 20 | 페이지 크기 (최대 100) |
| `law_title` | string | - | 법령명 필터 (정확히 일치) |
| `article_no` | string | - | 조항 번호 필터 |

## 완료 확인

다음 항목을 모두 확인하면 설정이 완료된 것입니다:

- [ ] `laws` 테이블 생성 완료
- [ ] `laws_fts` FTS5 테이블 생성 완료
- [ ] 42개 샘플 데이터 삽입 완료
- [ ] FTS5 검색 정상 동작 (한글 키워드)
- [ ] Workers API 엔드포인트 4개 모두 정상 응답
- [ ] `/admin/laws` 페이지 정상 로딩
- [ ] 키워드 검색 기능 정상 동작
- [ ] 페이지네이션 정상 동작
- [ ] 스크린샷 2장 캡처 완료

---

**작성일**: 2025-01-15
**작성자**: Safe OPS Studio Development Team
**버전**: 1.0

문의사항이나 문제 발생 시 GitHub Issues에 보고해주세요.
