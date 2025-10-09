# Vooster MCP 연동 이슈

**작성일**: 2025-10-08
**상태**: ❌ 연동 안됨

## 문제 상황

Claude Code에서 Vooster MCP 도구를 사용할 수 없습니다.

### 증상
- Vooster MCP 도구가 Claude Code의 사용 가능한 도구 목록에 표시되지 않음
- `mcp__vooster__*` 패턴의 도구가 전혀 없음

### 확인된 정보

**Vooster CLI 상태**:
- ✅ 설치됨 (버전 0.1.21)
- ✅ 인증됨 (yosep102033@gmail.com)
- ✅ 프로젝트 연결됨 (UID: UNMR)
- ✅ API Key 존재: `ak_osfjsgwvkbiasx9xq10ahd8r`

**사용 가능한 MCP 서버**:
- ✅ `mcp__cloudflare-bindings__*` (D1, KV, R2, Workers 등)
- ✅ `mcp__cloudflare-docs__*` (문서 검색)
- ✅ `mcp__cloudflare-observability__*` (Workers 로그/메트릭)
- ❌ `mcp__vooster__*` (존재하지 않음)

**Vooster CLI 작동 확인**:
```bash
$ vooster tasks:download
# ✅ 성공: 9개 작업 다운로드됨
# 파일 생성: .vooster/tasks/T-001.txt ~ T-009.txt
```

## 원인 분석

Vooster MCP 서버가 Claude Code에 연결되어 있지 않습니다.

**가능한 원인**:
1. Vooster MCP 서버가 별도로 설치/설정되어야 함
2. Claude Code 설정 파일에서 MCP 서버 추가 필요
3. Vooster가 아직 MCP 프로토콜을 지원하지 않을 수 있음

## 현재 대안 방법

### 1. Vooster CLI 사용
```bash
# 작업 목록 다운로드
vooster tasks:download

# 작업 파일 확인
cat .vooster/tasks/T-001.txt
cat .vooster/tasks.json
```

### 2. 수동 파일 확인
- `.vooster/tasks.json` - 전체 작업 메타데이터
- `.vooster/tasks/T-XXX.txt` - 개별 작업 상세 내역
- `.vooster/progress.md` - 진행 상황 리포트 (직접 생성)

### 3. Vooster 웹사이트
https://vooster.ai/project/UNMR

## 해결 방법 (조사 필요)

### 옵션 1: MCP 서버 설정 확인
Claude Code의 MCP 서버 설정 파일 위치 확인:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json` (가능성)
- 또는 Claude Code 설정 메뉴에서 MCP 서버 추가

### 옵션 2: Vooster에 문의
- Vooster MCP 서버가 제공되는지 확인
- 제공된다면 설치/설정 방법 문의
- 이메일: yosep102033@gmail.com

### 옵션 3: 현재 방식 유지
- Vooster CLI로 작업 관리
- Claude Code는 코드 작성에만 사용
- 수동으로 진행 상황 동기화

## 영향

**현재 워크플로우**:
- ❌ Vooster.ai에서 실시간 진행 상황 확인 불가
- ✅ 로컬에서는 모든 작업 정보 확인 가능
- ✅ 작업 진행에는 문제 없음 (CLI로 대체 가능)

**권장 사항**:
현재는 **옵션 3 (현재 방식 유지)**를 권장합니다.
- `vooster tasks:download`로 최신 작업 받기
- `notes.md`로 진행 상황 추적
- 필요시 Vooster 웹사이트에서 수동 업데이트

---

**다음 업데이트**: MCP 서버 설정 방법 확인 후
