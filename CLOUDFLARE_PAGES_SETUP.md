# 🚀 Cloudflare Pages 수동 배포 가이드

## 현재 상태
- ✅ Workers API 배포 완료: https://safe-ops-studio-workers.yosep102033.workers.dev
- ✅ GitHub에 최신 코드 푸시 완료
- ⏳ Pages 프론트엔드 배포 필요

## 1단계: Cloudflare Dashboard 접속

1. 브라우저에서 https://dash.cloudflare.com 접속
2. 로그인 (계정: `bcf10cbd3d1507209b845be49c0c0407`)

## 2단계: Pages 프로젝트 생성

1. 왼쪽 메뉴에서 **"Workers & Pages"** 클릭
2. **"Create application"** 버튼 클릭
3. **"Pages"** 탭 선택
4. **"Connect to Git"** 선택

## 3단계: GitHub 저장소 연결

1. **"Connect GitHub"** 버튼 클릭
2. GitHub 인증 창이 열리면 로그인
3. Repository access 설정:
   - "Only select repositories" 선택
   - **`Joseph102033/kosha`** 저장소 선택
4. **"Install & Authorize"** 클릭
5. Cloudflare로 돌아오면 저장소 목록에서 **`Joseph102033/kosha`** 선택

## 4단계: 빌드 설정

### 기본 설정
- **Project name**: `kosha-8ad` (또는 원하는 이름)
- **Production branch**: `main`

### 빌드 설정
```
Framework preset: Next.js
Build command: cd apps/web && npm install && npm run build
Build output directory: apps/web/.next
Root Directory (advanced): (비워두기)
```

### 환경 변수 (Environment variables)
**Production 탭에서 추가:**
- Variable name: `NEXT_PUBLIC_API_URL`
- Value: `https://safe-ops-studio-workers.yosep102033.workers.dev`

## 5단계: 배포 시작

1. 모든 설정 확인
2. **"Save and Deploy"** 버튼 클릭
3. 배포 진행 상황 모니터링 (약 2-3분 소요)

## 6단계: 배포 완료 확인

배포가 완료되면:
- **Production URL**: `https://kosha-8ad.pages.dev` (실제 URL은 화면에 표시됨)
- 자동으로 SSL 인증서 생성됨

## 7단계: 프로덕션 테스트

다음 페이지들을 브라우저에서 테스트:

1. **랜딩 페이지**: https://kosha-8ad.pages.dev/
   - 구독 폼 동작 확인
   - 체험 모드 버튼 확인

2. **Builder 페이지**: https://kosha-8ad.pages.dev/builder
   - 폼 입력 테스트
   - OPS 생성 테스트
   - 미리보기 표시 확인

3. **평가 시스템**: https://kosha-8ad.pages.dev/admin/eval
   - 골든 데이터셋 로드 확인
   - 메트릭 계산 테스트

4. **법령 관리**: https://kosha-8ad.pages.dev/admin/laws
   - 법령 목록 표시 확인

## 8단계: 자동 배포 확인

설정 완료 후:
- `main` 브랜치에 푸시하면 자동으로 재배포됨
- 각 PR에 대해 Preview 배포 생성됨
- Deployment 탭에서 이전 버전으로 롤백 가능

## 트러블슈팅

### 빌드 실패 시
1. Cloudflare Dashboard → Pages → kosha-8ad → Deployments
2. 실패한 배포 클릭 → "View build log" 확인
3. 에러 메시지 확인 후 수정

### 환경 변수 수정
1. Pages 프로젝트 → Settings → Environment variables
2. 변수 수정 후 "Redeploy" 필요

### 캐시 문제
1. Settings → Builds & deployments
2. "Clear build cache" 클릭
3. "Retry deployment" 실행

## 예상 결과

배포 성공 시:
```
✅ Build successful
✅ Pages deployed to https://kosha-8ad.pages.dev
✅ SSL certificate active
✅ Edge network distribution complete
```

## 배포 후 확인사항

- [ ] 랜딩 페이지 로드 (<2초)
- [ ] Builder에서 OPS 생성 성공
- [ ] Workers API 통신 정상
- [ ] 이메일 구독 폼 동작
- [ ] 모든 정적 리소스 로드
- [ ] 모바일 반응형 확인

---

**작성일**: 2025-10-16
**Workers API**: https://safe-ops-studio-workers.yosep102033.workers.dev
**GitHub Repo**: https://github.com/Joseph102033/kosha
**Branch**: main
