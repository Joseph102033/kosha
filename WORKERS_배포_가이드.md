# 🚀 Workers 수동 배포 가이드 (초보자용)

**목적**: 한국어 OPS 생성 기능을 프로덕션에 배포하기

---

## 📋 사전 준비 (이미 완료된 항목)

- ✅ Wrangler CLI 설치됨 (`npm install -g wrangler`)
- ✅ Cloudflare 계정 로그인 (`wrangler login` 실행 완료)
- ✅ `wrangler.toml` 설정 완료
- ✅ 최신 코드 Git에 푸시됨

---

## 🖥️ 방법 1: CMD 사용 (Windows 추천)

### 1단계: CMD 열기
1. **Windows 키** 누르기
2. **"cmd"** 타이핑
3. **Enter** (관리자 권한 필요 없음)

### 2단계: 프로젝트 디렉토리로 이동
CMD에 다음 명령어 입력:
```cmd
cd C:\Users\s\Code\kosha\apps\workers
```

**확인**: 프롬프트가 다음처럼 바뀌어야 합니다:
```
C:\Users\s\Code\kosha\apps\workers>
```

### 3단계: 배포 실행
```cmd
npm run deploy
```

### 4단계: 배포 완료 확인
다음과 같은 메시지가 나오면 **성공**:
```
⛅️ wrangler 3.114.15
-----------------------------------------------

Total Upload: 1234.56 KiB / gzip: 234.56 KiB
Uploaded safe-ops-studio-workers (2.34 sec)
Deployed safe-ops-studio-workers triggers (0.45 sec)
  https://safe-ops-studio-workers.yosep102033.workers.dev

✨ Successfully published your Worker to
   https://safe-ops-studio-workers.yosep102033.workers.dev

Current Version ID: 12345678-90ab-cdef-1234-567890abcdef
```

**✅ 배포 완료!** 이 URL을 복사해두세요:
```
https://safe-ops-studio-workers.yosep102033.workers.dev
```

---

## 🖥️ 방법 2: Git Bash 사용 (개발자 선호)

### 1단계: Git Bash 열기
1. **Windows 키** 누르기
2. **"Git Bash"** 타이핑
3. **Enter**

### 2단계: 프로젝트 디렉토리로 이동
```bash
cd /c/Users/s/Code/kosha/apps/workers
```

### 3단계: 배포 실행
```bash
npm run deploy
```

나머지는 방법 1과 동일합니다.

---

## ⚠️ 발생 가능한 오류와 해결 방법

### 오류 1: "CLOUDFLARE_API_TOKEN not set"
```
ERROR: In a non-interactive environment, it's necessary to set
a CLOUDFLARE_API_TOKEN environment variable
```

**원인**: Wrangler가 로그인되지 않음

**해결 방법**:
```cmd
wrangler login
```
- 브라우저가 열리면 Cloudflare 로그인
- "Allow" 버튼 클릭
- 터미널로 돌아와서 다시 `npm run deploy` 실행

---

### 오류 2: "'wrangler'은(는) 내부 또는 외부 명령이 아닙니다"
```
'wrangler' is not recognized as an internal or external command
```

**원인**: Wrangler가 설치되지 않았거나 PATH에 없음

**해결 방법**:
```cmd
# 로컬 프로젝트 디렉토리에서 실행
npx wrangler deploy
```

또는 전역 설치:
```cmd
npm install -g wrangler
```

---

### 오류 3: "npm: command not found"
**원인**: Node.js가 설치되지 않음

**해결 방법**:
1. https://nodejs.org/ 접속
2. LTS 버전 다운로드 및 설치
3. CMD 재시작 후 다시 시도

---

### 오류 4: "Access denied" 또는 권한 오류
**해결 방법**: **관리자 권한**으로 CMD 실행
1. **Windows 키** 누르기
2. **"cmd"** 타이핑
3. **Ctrl + Shift + Enter** (관리자로 실행)
4. 다시 배포 시도

---

## 🧪 배포 후 즉시 테스트

### 테스트 1: Health Check
CMD에서 실행:
```cmd
curl https://safe-ops-studio-workers.yosep102033.workers.dev/health
```

**예상 결과**:
```json
{"status":"ok","timestamp":"2025-10-10T..."}
```

---

### 테스트 2: 한국어 OPS 생성 (중요!)
```cmd
curl -X POST https://safe-ops-studio-workers.yosep102033.workers.dev/api/ops/generate -H "Content-Type: application/json" -H "X-Access-Key: YOUR_ACCESS_KEY" -d "{\"incidentDate\":\"2025-01-15T10:00:00\",\"location\":\"서울 건설현장\",\"incidentType\":\"추락\",\"incidentCause\":\"안전난간 미설치\"}"
```

**주의**: `YOUR_ACCESS_KEY`를 실제 액세스 키로 교체하세요!

**예상 결과** (한국어 확인):
```json
{
  "success": true,
  "data": {
    "summary": "2025년 1월 15일에 추락 재해가 발생했습니다...",
    "causes": {
      "direct": ["안전난간 미설치", "부적절한 추락 방지 조치"]
    },
    "checklist": ["작업 시작 전 종합적인 위험성 평가 실시", ...]
  }
}
```

**✅ "2025년", "재해가 발생했습니다", "안전난간" 같은 한국어가 보이면 성공!**

---

### 테스트 3: 브라우저에서 확인
1. https://kosha-8ad.pages.dev/builder 접속
2. 우측 상단 "🔑 액세스 키 입력" 클릭
3. 재해 정보 입력
4. 미리보기가 **한국어**로 생성되는지 확인

---

## 📊 배포 완료 체크리스트

배포 후 다음 항목을 모두 확인하세요:

- [ ] CMD에서 "Successfully published" 메시지 확인
- [ ] Health check 응답 정상 (`{"status":"ok"}`)
- [ ] curl 테스트에서 한국어 응답 확인
- [ ] Builder 페이지에서 한국어 미리보기 생성 확인
- [ ] OPS 발행 → 공개 페이지 접속 → **404 오류 없음**

**모두 체크되면 배포 완료!** 🎉

---

## 🎯 빠른 명령어 요약

```cmd
# 1. 디렉토리 이동
cd C:\Users\s\Code\kosha\apps\workers

# 2. 배포 실행
npm run deploy

# 3. 테스트
curl https://safe-ops-studio-workers.yosep102033.workers.dev/health
```

**3단계면 끝!**

---

## 💡 추가 팁

### Wrangler 로그인 상태 확인
```cmd
wrangler whoami
```

**예상 출력**:
```
You are logged in with an OAuth Token, associated with the email 'Yosep102033@gmail.com'.
```

### 배포 히스토리 확인
```cmd
wrangler deployments list
```

### 특정 환경으로 배포 (production)
```cmd
wrangler deploy --env production
```

---

## 📞 도움이 더 필요하면?

1. **배포 로그 전체 복사** (CMD 출력 전체)
2. **에러 메시지 스크린샷**
3. **실행한 명령어**

위 정보와 함께 질문해주세요!

---

**지금 바로 시작하세요!** ⬇️

```cmd
cd C:\Users\s\Code\kosha\apps\workers
npm run deploy
```
