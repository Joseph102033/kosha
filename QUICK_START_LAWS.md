# 법령 데이터베이스 빠른 시작 가이드

## 5분 만에 시작하기

### 1. 마이그레이션 실행 (로컬)

```bash
cd apps/workers

# 테이블 생성
npx wrangler d1 execute kosha-db --local --file=./migrations/0003_laws_full_text.sql

# 데이터 삽입
npx wrangler d1 execute kosha-db --local --file=./migrations/0004_seed_laws.sql
```

### 2. Workers 시작

```bash
cd apps/workers
npm run dev
```

### 3. Next.js 시작 (새 터미널)

```bash
cd apps/web
npm run dev
```

### 4. 테스트

브라우저에서 접속:
```
http://localhost:3000/admin/laws
```

## API 테스트 (curl)

```bash
# 전체 목록
curl http://localhost:8787/api/laws/search

# 키워드 검색
curl "http://localhost:8787/api/laws/search?query=추락"

# 통계
curl http://localhost:8787/api/laws/stats
```

## 스크린샷 캡처

1. `http://localhost:3000/admin/laws` 접속
2. "추락" 검색
3. 스크린샷 캡처 → `docs/images/admin/admin_laws_search_result.png`
4. 조문 클릭하여 상세 보기
5. 스크린샷 캡처 → `docs/images/admin/admin_laws_detail_modal.png`

## 완료! 🎉

더 자세한 내용은 `docs/LAW_DATABASE_SETUP_GUIDE.md` 참조
