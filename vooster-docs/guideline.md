# Safe OPS Studio 코드 가이드라인

## 1. 프로젝트 개요

Safe OPS Studio는 짧은 사고 개요를 바탕으로 법률 매핑, 근본 원인, 예방 체크리스트를 포함하는 한 페이지짜리 OPS 브리프를 생성합니다. 이 프로젝트는 Cloudflare Free 티어(Pages, Workers, D1, KV)를 활용하며, Next.js 프론트엔드와 TDD(테스트 주도 개발) 워크플로우를 따릅니다. 클라이언트 측 PDF 생성 기능을 통해 30일 이내 구현 가능성 및 개인 정보 보호 원칙을 준수합니다.

**주요 기술 스택:**
*   **프론트엔드**: Next.js (React), Tailwind CSS, shadcn/ui
*   **백엔드**: Cloudflare Workers (API), D1 (SQLite), KV (캐싱)
*   **이메일 서비스**: Resend 또는 Mailgun (REST API)
*   **PDF 생성**: html2pdf.js (클라이언트 측)
*   **테스팅**: Jest, Miniflare, Playwright
*   **배포**: Cloudflare Pages, Wrangler CLI

**핵심 아키텍처 결정:**
*   **서버리스 우선**: Cloudflare Workers를 활용한 경량 API 및 Cloudflare Pages를 통한 정적/SSR UI 호스팅.
*   **클라이언트 측 오프로딩**: PDF 생성 및 일부 이미지 처리(SVG 폴백)를 클라이언트 측에서 처리하여 서버 비용 최소화.
*   **데이터 스토리지 최적화**: D1(관계형 데이터)과 KV(불변 캐시)를 용도에 맞게 사용하여 Cloudflare Free 티어 제약 준수.
*   **TDD 기반 개발**: 모든 기능 개발은 테스트 코드 작성을 선행하여 견고하고 유지보수 가능한 코드베이스 구축.

## 2. 핵심 원칙

1.  **명확성 및 가독성**: 모든 코드는 다른 개발자가 쉽게 이해하고 유지보수할 수 있도록 명확하고 일관성 있게 작성되어야 합니다.
2.  **테스트 가능성**: 모든 기능은 단위, 통합, E2E 테스트가 용이하도록 설계 및 구현되어야 합니다.
3.  **성능 최적화**: Cloudflare Free 티어의 제약을 인지하고, 비용 효율적이며 빠른 응답 시간을 보장하도록 코드를 최적화해야 합니다.
4.  **보안 및 개인 정보 보호**: 사용자 데이터 및 시스템 보안을 최우선으로 고려하여 취약점이 없도록 코드를 작성해야 합니다.
5.  **모듈화 및 재사용성**: 각 컴포넌트, 함수, 모듈은 단일 책임 원칙을 따르고 재사용 가능하도록 설계되어야 합니다.

## 3. 언어별 가이드라인

### 3.1. TypeScript (Next.js & Cloudflare Workers)

*   **파일 및 디렉토리 구조**:
    *   **MUST**: TRD에 명시된 `/apps/web` 및 `/apps/workers` 구조를 따르며, 각 도메인(subscription, ops, law, delivery)별로 폴더를 구성합니다.
    *   **MUST**: 각 도메인 폴더 내에는 `handlers`, `models`, `services`, `utils`, `tests` 등 역할별 서브 폴더를 생성하여 관련 파일을 모읍니다.
    *   **MUST**: Next.js `app` 라우터 대신 `pages` 라우터 구조를 사용합니다.
    *   **MUST NOT**: 단일 파일에 여러 도메인의 로직을 혼합하여 작성합니다.

    ```
    // MUST: 올바른 디렉토리 구조 예시
    // 각 도메인별로 책임이 명확하게 분리되어 있습니다.
    apps/
    └── workers/
        └── src/
            ├── ops/
            │   ├── handlers.ts     // API 핸들러
            │   ├── models.ts       // 데이터 모델 (타입 정의)
            │   ├── services.ts     // 비즈니스 로직
            │   └── tests/
            │       └── ops.test.ts // 단위 테스트
            ├── subscriptions/
            │   ├── handlers.ts
            │   └── ...
            └── db/
                └── schema.ts       // D1 스키마 정의
    ```

*   **타입 정의**:
    *   **MUST**: 모든 변수, 함수 매개변수, 반환 값에 명확한 타입을 명시합니다. `any` 타입 사용은 엄격히 금지됩니다.
    *   **MUST**: API 응답 및 요청 페이로드에 대한 인터페이스 또는 타입을 정의하여 일관성을 유지합니다.
    *   **MUST**: D1 스키마와 일치하는 데이터 모델 타입을 정의하여 데이터 일관성을 확보합니다.

    ```typescript
    // MUST: 명확한 타입 정의 예시
    // API 응답 및 D1 데이터 구조에 대한 타입 정의는 코드의 안정성을 높입니다.
    interface OpsDocument {
      id: string;
      title: string;
      incident_date: string;
      location: string;
      incident_type: 'fall' | 'fire' | 'chemical'; // 예시
      ops_json: OpsContent;
      created_at: Date;
    }

    interface OpsContent {
      summary: string;
      causes: { direct: string[]; indirect: string[] };
      checklist: string[];
      laws: { title: string; url: string }[];
      image_meta?: { url: string; alt: string };
    }

    // MUST NOT: 'any' 타입 남용 예시
    // 타입 추론을 방해하고 런타임 오류의 가능성을 높입니다.
    function processData(data: any): any { /* ... */ }
    ```

*   **임포트/의존성 관리**:
    *   **MUST**: 절대 경로 임포트(예: `@/components/Button`)를 사용하여 가독성을 높입니다.
    *   **MUST**: 필요한 모듈만 임포트하고, 사용하지 않는 임포트는 제거합니다.
    *   **MUST NOT**: 상대 경로 임포트(예: `../../../utils/helper`)를 깊게 사용하는 것을 피합니다.

*   **에러 핸들링**:
    *   **MUST**: API 핸들러 및 서비스 로직에서 발생할 수 있는 모든 예상 가능한 오류를 명확하게 처리합니다.
    *   **MUST**: 사용자에게 의미 있는 에러 메시지를 반환하고, 내부 에러 정보는 로그로만 기록합니다.
    *   **MUST**: Promise 기반 비동기 코드에서는 `try-catch` 블록 또는 `.catch()`를 사용하여 에러를 처리합니다.
    *   **MUST**: Cloudflare Workers에서는 `Response` 객체와 적절한 HTTP 상태 코드(예: 400, 401, 404, 500)를 사용하여 에러를 반환합니다.

    ```typescript
    // MUST: 올바른 에러 핸들링 예시 (Cloudflare Worker)
    // 사용자에게 의미 있는 에러 메시지와 적절한 HTTP 상태 코드를 반환합니다.
    export async function handleSubscribe(request: Request): Promise<Response> {
      try {
        const { email } = await request.json();
        if (!email || !isValidEmail(email)) {
          return new Response(JSON.stringify({ error: '유효하지 않은 이메일 주소입니다.' }), { status: 400 });
        }
        // ... 구독 로직
        return new Response(JSON.stringify({ message: '구독 성공' }), { status: 200 });
      } catch (error) {
        console.error('구독 처리 중 에러 발생:', error);
        return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), { status: 500 });
      }
    }

    // MUST NOT: 에러를 무시하거나 일반적인 에러 메시지를 반환하는 예시
    // 사용자에게 유용한 정보를 제공하지 못하고 디버깅을 어렵게 합니다.
    async function dangerousFunction() {
      try {
        // ...
      } catch (e) {
        return new Response(JSON.stringify({ message: '에러 발생' }), { status: 500 }); // 구체적인 정보 없음
      }
    }
    ```

### 3.2. React (Next.js Frontend)

*   **컴포넌트 구조**:
    *   **MUST**: 단일 책임 원칙에 따라 컴포넌트를 작게 분리합니다.
    *   **MUST**: 재사용 가능한 UI 요소는 `/components/ui`에, 특정 페이지에 종속된 컴포넌트는 해당 페이지 폴더 내에 위치시킵니다.
    *   **MUST**: `props` 드릴링을 피하고, Context API 또는 상태 관리 라이브러리(필요시)를 고려합니다. (MVP에서는 복잡한 상태 관리 패턴 지양)

*   **상태 관리**:
    *   **MUST**: `useState`, `useReducer`와 같은 React 훅을 사용하여 컴포넌트 로컬 상태를 관리합니다.
    *   **MUST**: 전역 상태가 필요한 경우, React Context API를 사용합니다.
    *   **MUST NOT**: 복잡한 전역 상태 관리 라이브러리(예: Redux, Zustand)는 MVP 범위에서 도입하지 않습니다.

    ```typescript
    // MUST: React Context API를 사용한 전역 상태 관리 예시
    // 필요한 경우에만 전역 상태를 사용하고, 그 외에는 컴포넌트 로컬 상태를 유지합니다.
    // context/OpsContext.tsx
    import React, { createContext, useContext, useState, ReactNode } from 'react';

    interface OpsState {
      draftOps: any | null;
      setDraftOps: (ops: any) => void;
    }

    const OpsContext = createContext<OpsState | undefined>(undefined);

    export const OpsProvider = ({ children }: { children: ReactNode }) => {
      const [draftOps, setDraftOps] = useState<any | null>(null);
      return (
        <OpsContext.Provider value={{ draftOps, setDraftOps }}>
          {children}
        </OpsContext.Provider>
      );
    };

    export const useOps = () => {
      const context = useContext(OpsContext);
      if (context === undefined) {
        throw new Error('useOps must be used within an OpsProvider');
      }
      return context;
    };

    // MUST NOT: 복잡한 상태 관리 패턴을 불필요하게 도입하는 예시
    // MVP 단계에서는 오버엔지니어링을 피합니다.
    // import { createStore } from 'zustand'; // MVP에서는 사용하지 않습니다.
    ```

## 4. 코드 스타일 규칙

### 4.1. MUST (필수 사항)

*   **일관된 포맷팅**:
    *   **규칙**: Prettier와 ESLint를 사용하여 코드 포맷팅 및 스타일을 자동화하고, 모든 개발자는 이 도구들을 프로젝트에 적용해야 합니다.
    *   **이유**: 코드 가독성을 높이고, 코드 리뷰 시간을 단축하며, 팀 전체의 생산성을 향상시킵니다.
*   **변수 및 함수명**:
    *   **규칙**: 변수명은 `camelCase`를 사용하고, 상수는 `SCREAMING_SNAKE_CASE`를 사용합니다. 함수명은 동사로 시작하여 해당 함수의 동작을 명확히 설명합니다.
    *   **이유**: 코드의 의미를 명확히 하고, 예측 가능성을 높입니다.
    *   **예시**:
        ```typescript
        // MUST: 명확하고 일관된 명명 규칙
        const incidentDate = new Date();
        const MAX_OPS_SUMMARY_LINES = 6;
        function getOpsDocumentById(id: string): OpsDocument | null { /* ... */ }
        ```
*   **주석**:
    *   **규칙**: 복잡한 로직, 비즈니스 규칙, 또는 특정 디자인 결정에 대한 설명이 필요한 경우에만 주석을 작성합니다. JSDoc 스타일 주석을 사용하여 함수의 목적, 매개변수, 반환 값을 설명합니다.
    *   **이유**: 불필요한 주석은 코드를 지저분하게 만들고, 오래된 주석은 오해를 유발할 수 있습니다. 잘 작성된 코드는 그 자체로 설명되어야 합니다.
*   **비동기 처리**:
    *   **규칙**: `async/await` 구문을 사용하여 비동기 코드를 작성합니다. 콜백 헬(callback hell)을 피하고, 가독성을 높입니다.
    *   **이유**: 비동기 코드의 흐름을 동기 코드처럼 읽기 쉽게 만들어 디버깅 및 유지보수를 용이하게 합니다.
*   **D1 쿼리**:
    *   **규칙**: D1 쿼리 시 반드시 매개변수화된 쿼리를 사용합니다. SQL 인젝션 공격을 방지하기 위함입니다.
    *   **이유**: 보안 취약점을 예방하고 데이터 무결성을 보장합니다.
    *   **예시**:
        ```typescript
        // MUST: 매개변수화된 D1 쿼리 사용
        // SQL 인젝션 공격을 방지하는 안전한 방법입니다.
        async function getSubscriberByEmail(db: D1Database, email: string) {
          const { results } = await db.prepare('SELECT * FROM subscribers WHERE email = ?')
                                      .bind(email)
                                      .all();
          return results[0];
        }

        // MUST NOT: 문자열 연결을 통한 D1 쿼리 (SQL 인젝션 취약)
        // const { results } = await db.prepare(`SELECT * FROM subscribers WHERE email = '${email}'`).all();
        ```
*   **환경 변수 관리**:
    *   **규칙**: API 키, 비밀번호 등 민감한 정보는 환경 변수(`Worker environment variables`)에 저장하고, 클라이언트 측으로 노출되지 않도록 합니다.
    *   **이유**: 보안을 강화하고, 환경별 설정을 유연하게 관리할 수 있습니다.

### 4.2. MUST NOT (금지 사항)

*   **거대 모듈/파일**:
    *   **규칙**: 단일 파일에 너무 많은 책임과 로직을 포함하는 거대한 모듈을 만들지 않습니다.
    *   **이유**: 파일의 크기가 커질수록 이해하기 어렵고, 특정 기능 수정 시 예상치 못한 부작용을 일으킬 수 있으며, 코드 재사용성을 저해합니다.
*   **복잡한 상태 관리 패턴**:
    *   **규칙**: MVP 단계에서 Redux, Zustand와 같은 복잡한 전역 상태 관리 라이브러리를 불필요하게 도입하지 않습니다.
    *   **이유**: 프로젝트의 복잡도를 증가시키고, 학습 곡선을 높여 개발 속도를 저하시킬 수 있습니다. React Context API와 `useState`/`useReducer`로 충분합니다.
*   **하드코딩된 값**:
    *   **규칙**: 매직 넘버, 문자열 리터럴 등 반복되거나 변경될 가능성이 있는 값들을 코드 내에 하드코딩하지 않고, 상수로 정의하거나 설정 파일에서 관리합니다.
    *   **이유**: 유지보수를 어렵게 하고, 오류 발생 가능성을 높입니다.
*   **클라이언트 측 민감 정보 노출**:
    *   **규칙**: API 키, 비밀번호 등 민감한 정보를 클라이언트 측 JavaScript 코드에 직접 포함하거나 환경 변수로 노출하지 않습니다.
    *   **이유**: 보안 취약점의 주요 원인이 됩니다. 모든 민감 정보는 Cloudflare Workers 환경 변수에 저장하고 서버 측에서만 사용해야 합니다.
*   **불필요한 외부 라이브러리**:
    *   **규칙**: 프로젝트에 꼭 필요한 경우가 아니라면 새로운 외부 라이브러리 추가를 지양합니다.
    *   **이유**: 번들 크기를 증가시키고, 잠재적인 보안 취약점을 도입할 수 있으며, 의존성 관리를 복잡하게 만듭니다.

## 5. 아키텍처 패턴

### 5.1. 컴포넌트/모듈 구조 가이드라인

*   **단일 책임 원칙 (SRP)**: 각 컴포넌트나 모듈은 하나의 명확한 책임만을 갖도록 설계합니다.
    *   예: `Button` 컴포넌트는 버튼 UI만 담당하고, `OpsForm` 컴포넌트는 OPS 생성 폼의 로직과 UI를 담당합니다.
*   **재사용성**: UI 컴포넌트, 유틸리티 함수, 타입 정의 등은 여러 곳에서 재사용할 수 있도록 일반화하여 작성합니다.
*   **도메인 기반 모듈화**: TRD에 명시된 대로 `subscriptions`, `ops`, `law`, `delivery`와 같은 도메인별로 코드를 모듈화하여 관리합니다.

### 5.2. 데이터 흐름 패턴

*   **단방향 데이터 흐름**: React 컴포넌트의 상태는 상위 컴포넌트에서 하위 컴포넌트로 `props`를 통해 전달되는 단방향 흐름을 따릅니다.
*   **API를 통한 데이터 변경**: 클라이언트에서 서버의 데이터를 변경할 때는 항상 정의된 REST API 엔드포인트를 통해 요청을 보냅니다. 직접 D1 데이터베이스에 접근하는 것은 금지됩니다.
*   **KV 캐싱 활용**: 공개된 OPS 문서(`ops_json`)와 같이 변경이 적고 자주 읽히는 데이터는 Cloudflare KV에 캐싱하여 D1 데이터베이스의 부하를 줄이고 응답 속도를 향상시킵니다.
    *   **MUST**: KV에 저장되는 데이터는 불변(immutable)이어야 하며, 변경 시 새로운 키로 저장하거나 기존 키의 TTL을 업데이트하여 캐시를 무효화합니다.

### 5.3. 상태 관리 컨벤션

*   **로컬 상태 우선**: 대부분의 UI 상태는 `useState` 또는 `useReducer`를 사용하여 해당 컴포넌트 내에서 관리합니다.
*   **공유 상태는 Context API**: 여러 컴포넌트에서 공유해야 하는 전역 상태(예: 로그인 사용자 정보, OPS 초안 데이터)는 React Context API를 사용하여 관리합니다.

### 5.4. API 설계 표준 (Cloudflare Workers)

*   **RESTful 원칙**: API 엔드포인트는 RESTful 원칙을 따르며, 리소스 기반으로 설계합니다.
    *   예: `GET /api/ops/:id`, `POST /api/subscribe`
*   **JSON 형식**: 모든 API 요청 및 응답은 JSON 형식을 사용합니다.
*   **HTTP 상태 코드**: 적절한 HTTP 상태 코드(예: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error)를 사용하여 API 호출 결과를 명확하게 전달합니다.
*   **인증**: 관리자 API는 TRD에 명시된 대로 간단한 Access Key (헤더) 또는 일회성 매직 링크를 통해 인증합니다.
*   **입력 유효성 검사**: 모든 API 요청의 입력 데이터는 서버 측에서 철저하게 유효성을 검사합니다.
*   **로깅**: Workers에서 발생하는 중요한 이벤트(성공적인 요청, 에러, 외부 서비스 호출 등)는 `console.log`를 사용하여 기록합니다.

    ```typescript
    // MUST: RESTful API 설계 및 JSON 응답 예시
    // 일관된 API 응답 구조를 유지합니다.
    export async function getOpsDocument(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return new Response(JSON.stringify({ error: 'OPS ID가 필요합니다.' }), { status: 400 });
      }

      const { results } = await env.DB.prepare('SELECT * FROM ops_documents WHERE id = ?')
                                      .bind(id)
                                      .all();

      if (!results || results.length === 0) {
        return new Response(JSON.stringify({ error: 'OPS 문서를 찾을 수 없습니다.' }), { status: 404 });
      }

      return new Response(JSON.stringify(results[0]), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    ```