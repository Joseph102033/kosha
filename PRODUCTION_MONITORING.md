# 📊 Safe OPS Studio - 프로덕션 모니터링 가이드

## 🎯 배포 완료 기준

### 필수 체크리스트 (MVP)
- [ ] Workers API 정상 작동 (https://safe-ops-studio-workers.yosep102033.workers.dev)
- [ ] Pages 프론트엔드 접속 가능
- [ ] 랜딩 페이지 정상 표시
- [ ] Builder에서 OPS 생성 가능
- [ ] Gemini API 호출 성공
- [ ] 에러 없이 10회 연속 OPS 생성 성공

---

## 🔍 즉시 테스트 항목 (배포 후 30분 이내)

### 1. Workers API 헬스체크
```bash
# Health endpoint
curl https://safe-ops-studio-workers.yosep102033.workers.dev/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-10-16T..."}
```

### 2. OPS 생성 테스트
```bash
# 테스트 요청
curl -X POST https://safe-ops-studio-workers.yosep102033.workers.dev/api/ops/generate \
  -H "Content-Type: application/json" \
  -d '{
    "incidentDate": "2025-10-16T10:00:00",
    "location": "테스트 현장",
    "incidentType": "Fall",
    "incidentCause": "추락 사고 테스트"
  }'

# 성공 기준:
# - success: true
# - summary 한글로 생성됨
# - causes.direct 배열 3개
# - causes.indirect 배열 4개
# - checklist 배열 4-12개
# - 응답 시간 < 5초
```

### 3. 프론트엔드 페이지 테스트

#### 랜딩 페이지 (/)
- [ ] 페이지 로드 < 2초
- [ ] 구독 폼 표시
- [ ] 체험 모드 버튼 표시
- [ ] 데모 영상 섹션 표시
- [ ] 법령 버전 배지 표시

#### Builder 페이지 (/builder)
- [ ] 폼 입력 필드 모두 표시
- [ ] 미리보기 패널 표시
- [ ] 사고 유형 선택 가능
- [ ] 입력 시 실시간 미리보기 생성
- [ ] 발행 버튼 활성화

#### Admin 페이지
- [ ] /admin/eval 접속 가능
- [ ] /admin/laws 접속 가능
- [ ] 골든 데이터셋 로드

### 4. 통합 테스트 (End-to-End)

**시나리오: 사고 보고서 생성 전체 플로우**

1. Builder 페이지 접속
2. 폼 작성:
   - 사고 일시: 2025-10-16 10:00
   - 장소: 서울 건설 현장
   - 유형: 추락
   - 원인: 안전 고리 미착용
3. 미리보기 생성 확인
   - Skeleton → Dummy → Real 전환
   - 요약 탭 한글 표시
   - 원인 분석 탭 직접/간접 원인
   - 체크리스트 탭 7-12개 항목
4. 발행 버튼 클릭
5. 공개 URL 생성 확인
6. 공개 페이지 접속 테스트

---

## 📈 24시간 모니터링 항목

### API 사용량 확인

**Cloudflare Dashboard → Workers & Pages → safe-ops-studio-workers → Metrics**

모니터링 지표:
- **Requests**: 총 요청 수
- **Errors**: 에러 발생률 (목표: <5%)
- **CPU Time**: 평균 실행 시간 (목표: <500ms)
- **Invocation Status**: 성공/실패 비율

### Gemini API 할당량

**Google AI Studio → API Keys → Usage**

- Free tier: 1,500 requests/day
- 현재 사용량 모니터링
- 80% 도달 시 알림 설정 권장

### D1 데이터베이스

**Cloudflare Dashboard → D1 → safe-ops-studio-db**

- Read queries: 25M/day (Free tier)
- Write queries: 100K/day (Free tier)
- 현재 사용량 < 10% 유지

### Pages 트래픽

**Cloudflare Dashboard → Pages → kosha-8ad → Analytics**

- Unique visitors
- Page views
- Bandwidth usage
- Geographic distribution

---

## 🚨 알려진 제한사항

### Cloudflare Free Tier 제한

1. **Workers**
   - 100,000 requests/day
   - CPU time: 10ms per invocation
   - 초과 시: 일시적인 503 에러 가능

2. **D1 Database**
   - 25M reads/day
   - 100K writes/day
   - 5 GB storage

3. **KV Storage**
   - 100,000 reads/day
   - 1,000 writes/day
   - 1 GB storage

4. **Pages**
   - 500 builds/month
   - Unlimited requests
   - Unlimited bandwidth

### Gemini API 제한

- **Free tier**: 1,500 requests/day
- **Rate limit**: 15 requests/minute
- **Timeout**: 30초 후 자동 실패

**대응 방안:**
- 중복 요청 방지 (클라이언트 debounce)
- 에러 발생 시 재시도 로직 (최대 3회)
- 사용자에게 명확한 에러 메시지 표시

---

## 📊 성능 벤치마크

### 목표 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 랜딩 페이지 로드 | < 2초 | Lighthouse |
| Builder 페이지 로드 | < 3초 | Lighthouse |
| OPS 생성 시간 | < 5초 | API 응답 시간 |
| 에러율 | < 5% | Cloudflare Analytics |
| Lighthouse 점수 | ≥ 80 | Chrome DevTools |

### Lighthouse 테스트

```bash
# Chrome DevTools
1. F12 → Lighthouse 탭
2. "Analyze page load" 클릭
3. 점수 확인:
   - Performance: ≥ 80
   - Accessibility: ≥ 90
   - Best Practices: ≥ 90
   - SEO: ≥ 80
```

---

## 🔧 트러블슈팅 가이드

### 1. Workers API 응답 없음

**증상**: 504 Gateway Timeout 또는 무응답

**확인 사항:**
```bash
# 1. Workers 상태 확인
curl https://safe-ops-studio-workers.yosep102033.workers.dev/health

# 2. Wrangler tail로 로그 확인
cd apps/workers && npx wrangler tail

# 3. Dashboard에서 Errors 확인
```

**해결 방법:**
- Cloudflare Dashboard → Workers → Rollback to previous version
- 또는 재배포: `npx wrangler deploy`

### 2. Gemini API 에러

**증상**: "Failed to generate OPS" 에러

**확인 사항:**
```bash
# 1. API 키 확인
npx wrangler secret list

# 2. Gemini API 할당량 확인
# Google AI Studio → API Keys → Usage

# 3. 로그 확인
npx wrangler tail
```

**해결 방법:**
- API 키 재설정: `npx wrangler secret put GEMINI_API_KEY`
- 할당량 초과 시: 24시간 대기 또는 유료 플랜 전환

### 3. Pages 빌드 실패

**증상**: Deployment failed, 빌드 에러

**확인 사항:**
```bash
# Dashboard → Pages → Deployments → Failed build → View logs
```

**해결 방법:**
- 로컬에서 빌드 테스트: `npm run build`
- package.json 의존성 확인
- 환경 변수 확인
- Build cache 클리어 후 재시도

### 4. CORS 에러

**증상**: "Access to fetch blocked by CORS policy"

**해결 방법:**
```typescript
// apps/workers/src/index.ts
// CORS 헤더 추가 확인
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

---

## 📝 일일 체크리스트

### 매일 오전 (09:00)

- [ ] Workers API 헬스체크
- [ ] Gemini API 할당량 확인 (< 1,200/1,500)
- [ ] 에러율 확인 (< 5%)
- [ ] 구독자 수 확인

### 매일 오후 (18:00)

- [ ] 오늘 OPS 생성 건수 확인
- [ ] 평균 응답 시간 확인 (< 3초)
- [ ] 이상 트래픽 패턴 확인
- [ ] 사용자 피드백 확인

---

## 🎯 1주일 체크리스트

### 주간 리뷰 (매주 월요일)

- [ ] 전주 총 요청 수
- [ ] 평균 응답 시간 추이
- [ ] 에러 패턴 분석
- [ ] 사용자 피드백 정리
- [ ] 개선 사항 도출

### 주간 백업

- [ ] D1 데이터베이스 export
- [ ] KV 데이터 확인
- [ ] 환경 변수 문서화
- [ ] 배포 로그 아카이브

---

## 📞 긴급 연락 체계

### Critical (서비스 다운)
- Workers 전체 장애
- Pages 접속 불가
- Gemini API 완전 실패

**대응:**
1. Cloudflare Status 확인: https://www.cloudflarestatus.com
2. Rollback to last known good deployment
3. 사용자 공지 (예상 복구 시간 안내)

### High (기능 제한)
- 일부 API 에러
- 느린 응답 시간
- 간헐적 실패

**대응:**
1. 로그 분석
2. Hotfix 배포
3. 모니터링 강화

### Medium (UX 문제)
- UI 버그
- 스타일 깨짐
- 오타/번역 오류

**대응:**
1. 이슈 등록
2. 다음 배포에 포함
3. 사용자 피드백 수집

---

## 🚀 다음 단계 (배포 완료 후)

### 우선순위 1 (1주일 이내)

- [ ] 법령 추천 시스템 활성화 (/api/laws/suggest)
- [ ] 에러 모니터링 설정 (Sentry or Cloudflare Analytics)
- [ ] Rate Limiting 설정 (Worker → 100 req/min per IP)

### 우선순위 2 (2주일 이내)

- [ ] 이메일 템플릿 디자인 개선
- [ ] SEO 최적화 (meta 태그, sitemap.xml)
- [ ] Google Analytics 연동

### 우선순위 3 (1개월 이내)

- [ ] 사용자 피드백 시스템
- [ ] A/B 테스트 설정
- [ ] 성능 최적화 (이미지, code splitting)

---

**작성일**: 2025-10-16
**최종 업데이트**: 배포 완료 시
**담당**: Safe OPS Studio Team
