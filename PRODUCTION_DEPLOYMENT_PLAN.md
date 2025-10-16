# 🚀 Safe OPS Studio - Production Deployment Plan

## 📋 현재 상태 분석 (2025-10-16)

### ✅ 완료된 기능
1. **Frontend (Next.js)**
   - 랜딩 페이지 (구독 폼, 데모 영상 섹션)
   - Builder 페이지 (OPS 생성 도구)
   - 미리보기 시스템 (Skeleton → Dummy → Real)
   - 평가 시스템 (/admin/eval)
   - 체험 모드 준비

2. **Backend (Cloudflare Workers)**
   - Gemini AI 통합 (OPS 생성)
   - OPS 저장 및 공개 페이지
   - 이메일 발송 준비
   - D1 데이터베이스 스키마

3. **평가 시스템**
   - 골든 데이터셋 (20건)
   - 5개 메트릭 (Precision, Recall, F1, MRR, NDCG)
   - SVG 추세 차트

### ⚠️ 미완성/확인 필요
1. **환경변수**
   - GEMINI_API_KEY (Workers)
   - D1 바인딩 확인
   - KV 바인딩 확인

2. **데이터베이스**
   - D1 마이그레이션 상태
   - law_rules 데이터 시딩 필요

3. **API 엔드포인트**
   - /api/law/suggest 구현 필요 (평가 시스템 의존)
   - /api/subscribe 테스트 필요

4. **프로덕션 설정**
   - wrangler.toml 검증
   - package.json 빌드 스크립트
   - CORS 설정

---

## 🎯 배포 목표

**목표**: 안정적인 프로토타입 상용 서비스 런칭

**성공 기준**:
- [ ] 랜딩 페이지 접속 가능
- [ ] OPS 생성 전체 플로우 동작 (입력→생성→발행)
- [ ] 이메일 구독 가능
- [ ] 공개 OPS 페이지 접근 가능
- [ ] Gemini API 정상 작동
- [ ] 에러 없이 24시간 운영

---

## 📅 Phase별 배포 계획

### Phase 1: 인프라 준비 (30분)
**목표**: 배포 가능한 상태 만들기

#### 1.1 환경변수 확인 및 설정 ⏱️ 10분
```bash
# Workers 환경변수 확인
npx wrangler secret list

# 필요 시 설정
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ACCESS_KEY
```

**체크리스트**:
- [ ] GEMINI_API_KEY 설정 확인
- [ ] ACCESS_KEY 설정 (Builder 인증용)
- [ ] D1 바인딩 확인 (wrangler.toml)
- [ ] KV 바인딩 확인 (wrangler.toml)

#### 1.2 D1 데이터베이스 설정 ⏱️ 15분
```bash
# D1 상태 확인
npx wrangler d1 list

# 마이그레이션 적용
cd apps/workers
npx wrangler d1 migrations apply kosha-ops-db --remote

# 테이블 확인
npx wrangler d1 execute kosha-ops-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

**체크리스트**:
- [ ] D1 데이터베이스 존재 확인
- [ ] 마이그레이션 적용 완료
- [ ] subscribers, ops_documents, deliveries 테이블 확인
- [ ] law_rules 테이블 확인

#### 1.3 wrangler.toml 검증 ⏱️ 5분
```bash
# wrangler.toml 읽기 및 검증
cat apps/workers/wrangler.toml
```

**체크리스트**:
- [ ] name 확인
- [ ] compatibility_date 최신
- [ ] D1 바인딩 올바름
- [ ] KV 바인딩 올바름

---

### Phase 2: 로컬 테스트 (30분)
**목표**: 프로덕션 배포 전 로컬에서 완전 검증

#### 2.1 Workers 로컬 테스트 ⏱️ 15분
```bash
cd apps/workers
npx wrangler dev --remote

# 별도 터미널에서 테스트
curl http://localhost:8787/health
curl -X POST http://localhost:8787/api/ops/generate \
  -H "Content-Type: application/json" \
  -d '{"incidentType":"Fall","incidentCause":"추락 사고 테스트"}'
```

**체크리스트**:
- [ ] /health 엔드포인트 200 OK
- [ ] /api/ops/generate Gemini 호출 성공
- [ ] 에러 로그 없음

#### 2.2 Next.js 프로덕션 빌드 테스트 ⏱️ 10분
```bash
cd apps/web
npm run build

# 빌드 성공 확인
ls -la .next/

# 프로덕션 모드 실행
npm start
```

**체크리스트**:
- [ ] 빌드 에러 없음
- [ ] TypeScript 에러 없음
- [ ] 모든 페이지 정상 렌더링
- [ ] console 에러 없음

#### 2.3 통합 테스트 ⏱️ 5분
```bash
# Frontend → Workers API 호출 테스트
# http://localhost:3000/builder 접속
# 1. 사고 정보 입력
# 2. 미리보기 생성 확인
# 3. 발행 버튼 클릭
# 4. 공개 URL 생성 확인
```

**체크리스트**:
- [ ] Builder에서 OPS 생성 완료
- [ ] 미리보기 정상 표시
- [ ] 발행 성공
- [ ] 공개 페이지 접근 가능

---

### Phase 3: Workers 배포 (15분)
**목표**: API 레이어 먼저 배포

#### 3.1 Workers 배포 ⏱️ 5분
```bash
cd apps/workers
npx wrangler deploy
```

**배포 완료 후 확인**:
- [ ] 배포 성공 메시지 확인
- [ ] Workers URL 복사 (예: https://safe-ops-studio-workers.xxx.workers.dev)

#### 3.2 프로덕션 API 테스트 ⏱️ 10분
```bash
# Health check
curl https://safe-ops-studio-workers.xxx.workers.dev/health

# OPS 생성 테스트
curl -X POST https://safe-ops-studio-workers.xxx.workers.dev/api/ops/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 OPS",
    "incidentDate": "2025-10-16T10:00:00",
    "location": "테스트 현장",
    "incidentType": "Fall",
    "incidentCause": "추락 사고 테스트"
  }'
```

**체크리스트**:
- [ ] /health 200 OK
- [ ] /api/ops/generate 성공
- [ ] Gemini API 호출 확인 (로그)
- [ ] 응답 시간 < 5초

---

### Phase 4: Pages 배포 (20분)
**목표**: Frontend 배포 및 Workers 연동

#### 4.1 환경변수 설정 ⏱️ 5분
```bash
cd apps/web

# .env.production 생성 (또는 수정)
echo "NEXT_PUBLIC_API_URL=https://safe-ops-studio-workers.xxx.workers.dev" > .env.production
```

#### 4.2 빌드 및 배포 ⏱️ 10분
```bash
# 프로덕션 빌드
npm run build

# Cloudflare Pages 배포
npx wrangler pages deploy .next --project-name kosha-8ad

# 또는 Git 푸시 (자동 배포)
git add .
git commit -m "Production deployment ready"
git push origin main
```

**체크리스트**:
- [ ] 빌드 성공
- [ ] 배포 성공
- [ ] 배포 URL 확인 (예: https://kosha-8ad.pages.dev)

#### 4.3 프로덕션 Frontend 테스트 ⏱️ 5분
```bash
# 브라우저에서 접속
# https://kosha-8ad.pages.dev

# 테스트 시나리오:
# 1. 랜딩 페이지 로드
# 2. Builder 페이지 이동
# 3. OPS 생성 테스트
# 4. 공개 페이지 확인
```

**체크리스트**:
- [ ] 랜딩 페이지 정상 표시
- [ ] Builder 페이지 로드
- [ ] Workers API 통신 성공
- [ ] OPS 생성 및 발행 가능

---

### Phase 5: 검증 및 모니터링 (30분)
**목표**: 프로덕션 안정성 확인

#### 5.1 전체 플로우 End-to-End 테스트 ⏱️ 15분
```bash
# 1. 랜딩 페이지 → 이메일 구독
# 2. Builder → OPS 생성
# 3. OPS 발행 → 공개 페이지 접근
# 4. /admin/eval → 평가 실행 (법령 API 구현 후)
```

**체크리스트**:
- [ ] 이메일 구독 폼 동작
- [ ] OPS 생성 전체 플로우 완료
- [ ] 공개 OPS 페이지 SSR 동작
- [ ] PDF 다운로드 가능 (클라이언트)
- [ ] 이메일 발송 테스트 (구독자에게)

#### 5.2 에러 로그 모니터링 ⏱️ 10분
```bash
# Workers 로그 확인
npx wrangler tail

# Cloudflare Dashboard에서 확인
# - Real-time logs
# - Analytics
# - Error rate
```

**체크리스트**:
- [ ] 에러 로그 없음
- [ ] Gemini API 호출 성공률 확인
- [ ] 응답 시간 모니터링

#### 5.3 성능 테스트 ⏱️ 5분
```bash
# Lighthouse 점수 확인 (Chrome DevTools)
# - Performance
# - Accessibility
# - Best Practices
# - SEO

# 목표:
# - Performance: ≥ 80
# - Accessibility: ≥ 90
```

**체크리스트**:
- [ ] Lighthouse 점수 양호
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s

---

## 🚨 롤백 계획

### 문제 발생 시 즉시 조치

#### Workers 문제
```bash
# 이전 버전으로 롤백
npx wrangler rollback
```

#### Pages 문제
```bash
# Cloudflare Dashboard → Pages → Deployments
# 이전 배포 선택 → "Rollback to this deployment"
```

#### 데이터베이스 문제
```bash
# 마이그레이션 롤백 (수동)
npx wrangler d1 execute kosha-ops-db --remote --command "DROP TABLE IF EXISTS ..."
```

---

## 📊 배포 후 모니터링 체크리스트

### 24시간 이내
- [ ] 에러 발생 없음
- [ ] Gemini API 할당량 확인 (1,500/day)
- [ ] D1 쿼리 수 확인 (Free tier: 25M reads/day)
- [ ] Pages 트래픽 확인

### 1주일 이내
- [ ] 이메일 구독자 수 확인
- [ ] OPS 생성 건수 확인
- [ ] 평균 응답 시간 < 3초 유지
- [ ] 사용자 피드백 수집

---

## 🔧 배포 후 즉시 개선 항목

### 우선순위 1 (필수)
1. **법령 추천 API 구현**
   - `/api/law/suggest` 엔드포인트
   - law_rules 테이블 시딩 (50-100건)
   - 평가 시스템 활성화

2. **에러 모니터링 설정**
   - Sentry 또는 Cloudflare Analytics
   - 알림 설정 (이메일/Slack)

3. **Rate Limiting**
   - Gemini API 호출 제한
   - Builder 사용 제한 (체험 모드)

### 우선순위 2 (중요)
4. **이메일 템플릿 개선**
   - 뉴스레터 디자인
   - OPS 공유 이메일

5. **SEO 최적화**
   - meta 태그 완성
   - sitemap.xml
   - robots.txt

6. **성능 최적화**
   - 이미지 최적화
   - Code splitting
   - CDN 캐싱

### 우선순위 3 (개선)
7. **사용자 피드백**
   - 피드백 폼 추가
   - 평가 시스템 공개

8. **분석 도구**
   - Google Analytics
   - Hotjar (사용자 행동)

---

## 📝 배포 실행 순서 요약

```
1. [30분] Phase 1: 인프라 준비
   └─ 환경변수, D1, wrangler.toml 검증

2. [30분] Phase 2: 로컬 테스트
   └─ Workers, Next.js, 통합 테스트

3. [15분] Phase 3: Workers 배포
   └─ API 레이어 배포 및 검증

4. [20분] Phase 4: Pages 배포
   └─ Frontend 배포 및 연동 확인

5. [30분] Phase 5: 검증 및 모니터링
   └─ E2E 테스트, 에러 확인, 성능 측정

총 예상 시간: 약 2시간
```

---

## ✅ 배포 완료 기준

### 최소 기준 (MVP)
- [ ] https://kosha-8ad.pages.dev 접속 가능
- [ ] 랜딩 페이지 정상 표시
- [ ] Builder에서 OPS 생성 가능
- [ ] 공개 OPS 페이지 접근 가능
- [ ] 에러 없이 10회 연속 OPS 생성 성공

### 이상적 기준
- [ ] 위 최소 기준 모두 충족
- [ ] 이메일 구독 기능 동작
- [ ] 법령 추천 시스템 활성화
- [ ] 평가 시스템 (/admin/eval) 사용 가능
- [ ] Lighthouse 점수 ≥ 80

---

**작성일**: 2025-10-16
**예상 배포 시간**: 2시간
**목표**: 안정적인 프로토타입 상용 서비스

**다음 단계**: Phase 1 인프라 준비부터 시작
