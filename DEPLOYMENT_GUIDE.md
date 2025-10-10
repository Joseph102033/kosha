# 🚀 Safe OPS Studio - 배포 가이드

**작성일**: 2025-10-10
**작성자**: Claude Code
**프로젝트**: Safe OPS Studio

---

## 📋 배포 전 체크리스트

### 완료된 변경사항 확인

- [x] ✅ **한국어 응답 구현** (`apps/workers/src/ops/composer.ts`)
- [x] ✅ **OPS 소개 섹션 이동** (`apps/web/pages/builder.tsx`)
- [x] ✅ **Landing 페이지 재디자인** (`apps/web/pages/index.tsx`)
- [x] ✅ **404 오류 진단 완료** (Workers 재배포 필요)
- [x] ✅ **작업 기록 업데이트** (`notes.md`)

---

## 🎯 배포 순서

### 1단계: Workers API 배포 (필수)

#### 배포 명령어
```bash
cd apps/workers
npm run deploy
```

#### 예상 출력
```
⛅️ wrangler 3.114.15
-----------------------------------------------
✨ Successfully published your Worker to
   https://safe-ops-studio-workers.yosep102033.workers.dev
```

#### 배포 확인
```bash
# Health check
curl https://safe-ops-studio-workers.yosep102033.workers.dev/health

# 예상 응답
{"status":"ok","timestamp":"2025-10-10T..."}
```

---

### 2단계: 한국어 응답 테스트

#### 테스트 요청
```bash
curl -X POST https://safe-ops-studio-workers.yosep102033.workers.dev/api/ops/generate \
  -H "Content-Type: application/json" \
  -H "X-Access-Key: YOUR_ACCESS_KEY" \
  -d '{
    "incidentDate": "2025-01-15T10:00:00",
    "location": "서울 건설현장",
    "incidentType": "추락",
    "incidentCause": "안전난간 미설치"
  }'
```

#### 예상 응답 (한국어)
```json
{
  "success": true,
  "data": {
    "summary": "2025년 1월 15일에 추락 재해가 발생했습니다.\n장소: 서울 건설현장\n주요 원인: 안전난간 미설치\n이 재해는 즉각적인 조사와 예방 조치가 필요합니다.\n모든 관련 이해관계자는 이 OPS 자료를 검토해야 합니다.",
    "causes": {
      "direct": [
        "안전난간 미설치",
        "부적절한 추락 방지 조치"
      ],
      "indirect": [
        "불충분한 안전 교육 또는 인식",
        "부적절한 위험성 평가 절차",
        "정기적인 안전 장비 점검 부족",
        "고위험 작업에 대한 부적절한 감독"
      ]
    },
    "checklist": [
      "작업 시작 전 종합적인 위험성 평가 실시",
      "모든 근로자가 필수 안전 교육을 이수했는지 확인",
      "모든 안전 장비가 사용 가능하고 양호한 상태인지 확인",
      "비상 상황을 위한 명확한 의사소통 체계 구축",
      "모든 팀원과 표준 작업 절차 검토",
      "작업 구역의 잠재적 위험 요소 점검",
      "비상 대피 경로 설정",
      "고위험 작업을 위한 전담 안전 관찰자 지정"
    ],
    "laws": [
      {
        "title": "산업안전보건법 제38조 (안전조치)",
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=231390"
      }
    ]
  }
}
```

---

### 3단계: Frontend 페이지 확인

#### Landing 페이지
**URL**: https://kosha-8ad.pages.dev/

**확인 사항**:
- [ ] 제목: "안전보건공단 중대재해사례 OPS 뉴스레터"
- [ ] 뉴스레터 구독 폼 정상 표시
- [ ] "제공 내용" 섹션:
  - [ ] 🖼️ 재해발생상황 삽화
  - [ ] ✅ 재발방지 체크리스트
  - [ ] ⚖️ 관련 법령
- [ ] "직접 OPS 자료를 만들고 싶으신가요?" CTA 버튼
- [ ] /builder 링크 작동

#### Builder 페이지
**URL**: https://kosha-8ad.pages.dev/builder

**확인 사항**:
- [ ] 상단에 OPS 소개 섹션 표시
- [ ] 제목: "중대재해 개요를 손쉽게 OPS 요약자료로 편집하세요"
- [ ] 3개 Feature 카드:
  - [ ] ⚡ 빠른 자동 작성
  - [ ] ⚖️ 관련 법령 조회
  - [ ] ✅ 재발방지 체크리스트
- [ ] 재해 정보 입력란 정상 표시
- [ ] 입력 시 한국어 미리보기 생성

---

### 4단계: 전체 플로우 테스트

#### OPS 생성 → 발행 → 공개 페이지 접속

1. **Builder 페이지 접속**
   - https://kosha-8ad.pages.dev/builder

2. **액세스 키 입력**
   - 우측 상단 "🔑 액세스 키 입력" 클릭
   - 관리자 키 입력

3. **재해 정보 입력**
   ```
   OPS 제목: 비계 추락사고 테스트
   재해 발생 일시: 2025-01-15 10:00
   재해 발생 장소: 서울 건설현장 A동
   재해자: 작업자
   기인물: 비계
   재해 발생 형태: 추락
   재해 발생 원인: 안전난간 미설치로 인한 3층 높이에서 추락
   ```

4. **미리보기 확인**
   - 1초 후 실시간 미리보기 생성
   - 모든 내용이 한국어로 표시되는지 확인

5. **OPS 문서 발행**
   - "📤 OPS 문서 발행" 버튼 클릭
   - 성공 모달에서 공개 URL 확인

6. **공개 페이지 접속**
   - 생성된 URL로 이동 (예: `/p/abc123-xyz`)
   - **404 오류 없이** 정상 표시되는지 확인
   - 모든 콘텐츠가 한국어로 표시되는지 확인

---

## 🐛 트러블슈팅

### 문제 1: Workers 배포 실패
**증상**:
```
Error: CLOUDFLARE_API_TOKEN not set
```

**해결 방법**:
1. Cloudflare 대시보드에서 API 토큰 생성
2. 환경 변수 설정:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   ```
3. 재배포 시도

---

### 문제 2: 한국어가 깨져 보임
**증상**: 터미널에서 한글이 깨져 보임

**원인**: Windows 터미널 인코딩 문제

**해결 방법**:
- 실제 브라우저에서 확인 (브라우저에서는 정상 표시됨)
- 또는 PowerShell 사용:
  ```powershell
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  ```

---

### 문제 3: 404 오류 계속 발생
**증상**: `/p/[slug]` 접속 시 404

**확인 사항**:
1. Workers가 최신 버전으로 배포되었는지 확인
2. KV에 데이터가 저장되었는지 확인:
   ```bash
   wrangler kv:key list --namespace-id=03757fc4bf2e4a0e99ee6cc7eb5fa1ad
   ```
3. slug가 올바른지 확인 (save API 응답의 publicUrl 확인)

---

### 문제 4: 미리보기가 생성되지 않음
**증상**: 입력 후 1초 대기해도 미리보기가 나타나지 않음

**확인 사항**:
1. 브라우저 콘솔에서 에러 확인 (F12)
2. 네트워크 탭에서 API 요청 상태 확인
3. 액세스 키가 올바르게 입력되었는지 확인
4. Workers API가 정상 작동하는지 확인

---

## 📞 지원

문제가 계속되면 다음 정보와 함께 문의:

1. **에러 메시지** (브라우저 콘솔 또는 터미널)
2. **배포 로그** (wrangler deploy 출력)
3. **브라우저 네트워크 탭** 스크린샷
4. **재현 단계**

---

## ✅ 배포 완료 체크리스트

- [ ] Workers 배포 완료
- [ ] 한국어 응답 테스트 통과
- [ ] Landing 페이지 확인
- [ ] Builder 페이지 확인
- [ ] OPS 생성 → 발행 → 공개 페이지 플로우 테스트
- [ ] 404 오류 해결 확인

**모든 항목이 체크되면 배포 완료!** 🎉

---

**배포 일시**: _____________
**배포자**: _____________
**비고**: _____________
