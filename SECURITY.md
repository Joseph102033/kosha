# 🔒 Security Best Practices

## API 키 관리

### ✅ 올바른 방법

1. **환경 변수 사용**
   ```bash
   # .dev.vars (로컬 개발용 - .gitignore에 포함됨)
   GEMINI_API_KEY=your_actual_key_here
   ```

2. **Cloudflare Workers Secrets**
   ```bash
   # 프로덕션 배포용
   echo "YOUR_ACTUAL_KEY" | npx wrangler secret put GEMINI_API_KEY
   ```

3. **문서화 시 플레이스홀더 사용**
   ```bash
   # ✅ 올바른 예시 (문서에 작성할 때)
   echo "YOUR_GEMINI_API_KEY_HERE" | npx wrangler secret put GEMINI_API_KEY

   # ❌ 잘못된 예시 (실제 키 노출)
   echo "AIzaSyCR86W1Pes..." | npx wrangler secret put GEMINI_API_KEY
   ```

---

### ❌ 피해야 할 실수

1. **문서에 실제 키 작성**
   - README.md, notes.md, 가이드 문서 등에 실제 API 키 포함 금지
   - 항상 `YOUR_API_KEY_HERE` 같은 플레이스홀더 사용

2. **코드에 하드코딩**
   ```typescript
   // ❌ 절대 금지
   const API_KEY = "AIzaSyCR86W1Pes...";

   // ✅ 환경 변수 사용
   const API_KEY = env.GEMINI_API_KEY;
   ```

3. **커밋 메시지에 키 포함**
   - 커밋 메시지, PR 설명에 API 키 작성 금지

4. **로그/콘솔에 출력**
   ```typescript
   // ❌ 위험
   console.log('API Key:', env.GEMINI_API_KEY);

   // ✅ 안전
   console.log('API Key configured:', !!env.GEMINI_API_KEY);
   ```

---

## 🔧 Git History에서 민감 정보 제거

### 이미 커밋된 API 키 제거 방법

```bash
# 1. BFG Repo-Cleaner 사용 (권장)
git clone --mirror https://github.com/your-repo/kosha.git
java -jar bfg.jar --replace-text passwords.txt kosha.git
cd kosha.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# 2. git-filter-repo 사용
pip install git-filter-repo
git filter-repo --replace-text replace.txt

# 3. 수동 방법 (특정 파일)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch notes.md" \
  --prune-empty --tag-name-filter cat -- --all
```

**주의**: 이 작업 후에는 **force push**가 필요하며, 팀원들과 협업 중이라면 조율 필요

---

## 🚨 자동 탐지 설정

### 1. Pre-commit Hook 설정

`.git/hooks/pre-commit` 파일 생성:

```bash
#!/bin/sh
# API 키 패턴 검사

if git diff --cached | grep -E "AIza[0-9A-Za-z_-]{35}"; then
  echo "❌ ERROR: Gemini API key detected in commit!"
  echo "Please remove the API key before committing."
  exit 1
fi

if git diff --cached | grep -E "(api[_-]?key|secret[_-]?key|password).*=.*['\"][^'\"]{20,}"; then
  echo "⚠️  WARNING: Possible secret detected in commit!"
  echo "Please review your changes carefully."
  exit 1
fi

exit 0
```

### 2. GitHub Secret Scanning

GitHub 저장소 설정:
1. **Settings** → **Security** → **Code security and analysis**
2. **Secret scanning** 활성화
3. **Push protection** 활성화 (실시간 차단)

### 3. git-secrets 도구 사용

```bash
# 설치
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# 프로젝트 설정
cd /path/to/kosha
git secrets --install
git secrets --register-aws  # AWS 키 패턴
git secrets --add 'AIza[0-9A-Za-z_-]{35}'  # Gemini API 키 패턴
```

---

## 📋 체크리스트

배포 전 확인 사항:

- [ ] `.gitignore`에 `.dev.vars`, `.env*` 포함 확인
- [ ] 문서에 플레이스홀더만 사용 (실제 키 제거)
- [ ] 코드에 하드코딩된 키 없음
- [ ] 로그/콘솔 출력에 키 없음
- [ ] Git history 스캔 완료
- [ ] Pre-commit hook 설정 완료
- [ ] GitHub Secret Scanning 활성화

---

## 🔄 키가 노출된 경우 조치 방법

1. **즉시 키 폐기**
   - Google AI Studio에서 노출된 키 삭제
   - 새 키 생성

2. **Git History 정리**
   - 위의 BFG/git-filter-repo 방법 사용
   - Force push로 업데이트

3. **새 키 안전하게 설정**
   ```bash
   # Cloudflare Workers
   echo "NEW_KEY" | npx wrangler secret put GEMINI_API_KEY

   # 로컬 개발
   # .dev.vars 파일 업데이트 (.gitignore에 포함되어 있음)
   ```

4. **모니터링**
   - GitHub Security 알림 확인
   - API 사용량 모니터링

---

## 📚 참고 자료

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

---

**마지막 업데이트**: 2025-11-20
