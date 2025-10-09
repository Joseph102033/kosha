# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📝 Important Notes

**⚠️ ALWAYS READ `notes.md` FIRST** before starting any work on this project.

The `notes.md` file contains:
- Current project status and completed tasks
- Critical Cloudflare resource IDs (D1, KV)
- Database schema details
- Known issues and workarounds
- Next steps and implementation plans

## Project Overview

**Safe OPS Studio** - A one-page OPS (Operational Safety) brief generator that transforms accident overviews into comprehensive safety documents with law mappings, root causes, prevention checklists, and shareable pages.

**Core Technology Stack:**
- **Frontend**: Next.js (Pages Router) + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers (API layer)
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **Email**: Resend/Mailgun (REST API)
- **PDF**: html2pdf.js (client-side generation)
- **Testing**: Jest + Miniflare (unit/integration), Playwright (E2E)
- **Deployment**: Cloudflare Pages + Wrangler CLI

## Architecture

### High-Level Structure
```
/
├── apps/
│   ├── web/                    # Next.js frontend (Cloudflare Pages)
│   │   ├── pages/             # Pages Router (NOT App Router)
│   │   ├── components/        # React components
│   │   │   └── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── styles/           # Tailwind CSS
│   │   └── tests/            # Frontend tests
│   └── workers/               # Cloudflare Workers (API)
│       ├── src/
│       │   ├── subscriptions/ # Email subscription domain
│       │   ├── ops/          # OPS document domain
│       │   ├── law/          # Law mapping domain
│       │   ├── delivery/     # Email delivery domain
│       │   ├── db/           # D1 database access
│       │   ├── cache/        # KV cache access
│       │   └── utils/        # Shared utilities
│       └── tests/            # Worker tests
├── scripts/                   # DB migrations, seeding
└── vooster-docs/             # Project documentation
```

### Data Model (D1 Schema)
- **subscribers**: id, email (unique), status (pending|active|unsub), created_at
- **ops_documents**: id, title, incident_date, location, agent_object, hazard_object, incident_type, incident_cause, ops_json, created_by, created_at
- **deliveries**: id, ops_id, to_email, provider_msg_id, status (queued|sent|failed), sent_at
- **law_rules**: id, keyword, law_title, url

### API Endpoints (Cloudflare Workers)
- `POST /api/subscribe` - Email subscription
- `GET /api/news?limit=N` - Recent OPS titles
- `POST /api/ops/generate` - Generate OPS from incident data
- `POST /api/ops/save` - Save OPS document
- `GET /api/ops/:id` - Get OPS (admin)
- `GET /p/:slug` - Public OPS page (SSR/SSG)
- `POST /api/send` - Send email with OPS link
- `POST /api/law/rules` - Manage law rules (CRUD)

## Development Workflow

### Test-Driven Development (TDD)
**MANDATORY: Follow Red → Green → Refactor for ALL code changes**

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Clean up while keeping tests green
4. **Commit**: Small, frequent commits

**Test Structure (AAA Pattern):**
```typescript
// Arrange - Set up test data
// Act - Execute function
// Assert - Verify outcome
```

**Test Pyramid:**
- Unit Tests (70%): Fast, isolated
- Integration Tests (20%): Module boundaries, Workers + D1
- E2E Tests (10%): User scenarios with Playwright

### Code Quality Standards

**TypeScript Requirements:**
- **MUST**: Use explicit types (no `any`)
- **MUST**: Define interfaces for API requests/responses
- **MUST**: Use parameterized D1 queries (SQL injection protection)
- **MUST**: Use absolute imports (`@/components/...`)

**React Conventions:**
- **MUST**: Use Next.js Pages Router (NOT App Router)
- **MUST**: Follow single responsibility principle
- **MUST**: Use `useState`/`useReducer` for local state
- **MUST**: Use Context API for shared state (avoid Redux/Zustand in MVP)

**Cloudflare Workers:**
- **MUST**: Return proper HTTP status codes (200, 400, 401, 404, 500)
- **MUST**: Use JSON for all requests/responses
- **MUST**: Validate all inputs server-side
- **MUST**: Store secrets in Worker environment variables
- **MUST**: Log important events with `console.log`

**Error Handling:**
- **MUST**: Handle all expected errors explicitly
- **MUST**: Return user-friendly error messages
- **MUST NOT**: Expose internal error details to users

### Security (ISMS-P Compliance)

**Authentication & Authorization:**
- Admin routes protected via access key (header) or magic link
- Follow principle of least privilege
- Log all privilege changes

**Cryptography:**
- **MUST**: Use AES-256 for encryption
- **MUST**: Store passwords with bcrypt/scrypt/Argon2
- **MUST NOT**: Hardcode keys in code
- **MUST**: Use environment variables or KMS for secrets

**Input Validation:**
- **MUST**: Treat all external input as untrusted
- **MUST**: Sanitize and validate all inputs
- **MUST**: Use parameterized queries (no string concatenation)

**Personal Information:**
- **MUST**: Collect minimum necessary data
- **MUST**: Mask personal info in UI (e.g., `test@****.com`)
- **MUST**: Maintain audit logs for 1+ year

### Performance Optimization

- Cache public OPS JSON in KV (immutable, no TTL)
- Client-side PDF generation (no server cost)
- Lazy-load heavy components
- Optimize for Cloudflare Free tier limits

## Common Commands

Since this is a new project, commands will be defined when the project is initialized. Expected commands:

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start Next.js dev server
wrangler dev            # Start Workers dev server

# Testing
npm test                # Run all tests
npm run test:unit       # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # E2E tests with Playwright

# Database
wrangler d1 migrations apply # Apply D1 migrations
npm run db:seed         # Seed database

# Deployment
npm run build           # Build Next.js
wrangler deploy         # Deploy Workers
```

## Key Principles

1. **TDD-First**: No code without tests
2. **Cloudflare Free Conscious**: Optimize for free tier limits
3. **Privacy-First**: No PII in public pages, client-side PDF only
4. **Minimalistic**: Simple solutions, avoid over-engineering
5. **Domain-Driven**: Organize by feature (subscriptions, ops, law, delivery)

## Success Metrics (MVP Goals)

- First OPS generated in ≤10 minutes
- ≥70% law suggestion hit-rate
- PDF render ≤5s on mobile/desktop
- Email delivery ≥98% success rate

## Additional Context

See `vooster-docs/` for detailed specifications:
- `prd.md` - Product requirements
- `architecture.md` - Technical architecture
- `guideline.md` - Code style guidelines
- `step-by-step.md` - Implementation process
- `tdd.md` - TDD workflow
- `clean-code.md` - Clean code principles
- `isms-p.md` - Security requirements
