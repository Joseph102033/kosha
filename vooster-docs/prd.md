# PRD — Safe OPS Studio (Cloudflare Free, TDD-first)

## 0) Product framing
- **One-liner**: Turn a short “Serious Accident Overview” into a one-page **OPS** brief with mapped laws, root causes, prevention checklist, and a shareable mail-ready page.
- **Why now**: Demand for transparent, timely communication around serious accidents is increasing; teams need a fast, standardized brief that’s easy to send.
- **Principles**: **Intuitive**, **Feasible-in-30 days**, **Privacy-first**, **Cloudflare Free tier–friendly**.

---

## 1) Outcomes (Success metrics)
- **T1. First OPS in ≤10 minutes** from blank input to shareable link.
- **T2. ≥70% law-suggestion hit-rate** from the initial ruleset (within scoped domains).
- **T3. PDF render completes locally on common mobile/desktop in ≤5s** (client-side generation).
- **T4. Email delivery API success rate ≥98%** (provider response 2xx).

---

## 2) Scope (MVP)
- **Must**
  - Public **Landing Page** with email subscription capture.
  - **Admin OPS Builder**: input fields → generated **OPS preview** (summary, causes, prevention checklist, mapped laws, simple illustration or fallback diagram).
  - **Law mapping (rules-first)** with small, editable keyword→reference table.
  - **Share**: public, read-only web page per OPS + “Open as PDF” (client-side).
  - **Send**: email a **link** to the public OPS page (no binary attachments).
- **Should**
  - Minimal ops history and resend logs.
  - Weekly digest (manual trigger) using saved OPS items.
- **Won’t (MVP)**
  - Role-based ACL, SSO, binary storage of PDFs, heavy AI dependency, or complex analytics.

---

## 3) Users & Jobs
- **Admin (investigator/analyst)**: Encode overview → review auto-sections → edit → publish → send link.
- **Subscriber/Stakeholder**: Receive **latest OPS** in inbox; open on mobile; export to PDF locally.

---

## 4) Core flows (Given–When–Then acceptance)
### 4.1 Landing subscription
- **Given** the landing page,
- **When** I enter a valid email and press **Subscribe**,
- **Then** the system saves it and shows a “Subscribed” confirmation (and prevents duplicate re-subscription).

### 4.2 Create OPS
- **Given** the admin builder,
- **When** I fill: date/time, location, agent object (optional), hazard object (optional), incident type, and free-text cause,
- **Then** I see a generated one-page OPS with: summary (4–6 lines), direct/indirect causes, 6–10 prevention checks, law links, and a placeholder illustration.

### 4.3 Law mapping
- **Given** a saved ruleset,
- **When** I provide incident type and objects,
- **Then** I see ≥1 suggested law references with titles and URLs; I can remove or add more before publish.

### 4.4 Publish & share
- **Given** a valid OPS,
- **When** I click **Publish**,
- **Then** a public, read-only URL is created that renders the OPS (no admin controls).

### 4.5 PDF (client-side)
- **Given** the public OPS page,
- **When** I click **Download PDF**,
- **Then** a single-page PDF is generated locally (same layout, embedded fonts).

### 4.6 Email send
- **Given** the publish modal,
- **When** I select recipients (typed or from subscribers) and press **Send**,
- **Then** the email provider returns 2xx and the UI shows “Sent” with a delivery log entry.

---

## 5) Non-functional (Cloudflare Free conscious)
- **Hosting**: Pages (static UI, public OPS rendering) + Workers (small APIs).
- **Storage**: D1 for minimal relational data; KV for tiny caches; no binary file storage in MVP.
- **Cost guardrails**: Client-side PDF/illustration fallback, caching of read-only public OPS, and a rules-first law engine to minimize expensive AI calls.
- **Privacy**: No personal names or images required; OPS public pages avoid sensitive identifiers; admin-only edit.

---

## 6) Risks & mitigations
- **Law accuracy**: Start with a small curated ruleset; every auto insertion requires a manual “Reviewed” checkbox before publish.
- **Email deliverability**: Use a reputable REST email API; link-only (no attachments) reduces size/spam risk.
- **Illustration ethics**: Default to iconographic diagram components; allow opt-in AI render with neutral style and strict anonymization.

---

## 7) Milestones (TDD-driven)
- **M1 (Week 1)**: Landing + subscription API; OPS input form skeleton; first end-to-end “create → preview” red/green tests passing.
- **M2 (Week 2)**: Law rules engine; public read-only page; core unit/integration tests green.
- **M3 (Week 3)**: Email send (link-only) + delivery log; client-side PDF; e2e smoke tests green.
- **M4 (Week 4)**: Polish, a11y, mobile QA; seed 20–30 law rules; demo pack ready.


# TRD — Safe OPS Studio (Cloudflare Free, TDD-first)

## 0) Architecture
- **Frontend**: Next.js (Pages or App Router) + Tailwind + shadcn/ui.
- **Backend**: Cloudflare **Workers** (HTTP JSON APIs), **D1** (SQLite) for data, **KV** for small caches.
- **Email**: REST transactional provider (e.g., Resend/Mailgun/SendGrid) via HTTPS (no SMTP).
- **Render**: Client-side PDF (html2pdf / browser print), public OPS page is SSR/SSG friendly.
- **Illustration**: Optional AI image API (limited calls) → else SVG diagram fallback.

---

## 1) Data model (D1, minimal)
- **subscribers**(id, email unique, status[pending|active|unsub], created_at)
- **ops_documents**(id, title, incident_date, location, agent_object, hazard_object, incident_type, incident_cause, ops_json, created_by, created_at)
  - `ops_json` includes: summary, causes{direct[], indirect[]}, checklist[], laws[{title,url}], image_meta (optional)
- **deliveries**(id, ops_id, to_email, provider_msg_id, status[queued|sent|failed], sent_at)
- **law_rules**(id, keyword, law_title, url)

---

## 2) APIs (Workers — JSON over HTTPS)
- `POST /api/subscribe` → {ok}
- `GET  /api/news?limit=N` → recent OPS titles (for landing list)
- `POST /api/ops/generate` body: incident fields → returns draft `ops_json` (rules-first, AI optional)
- `POST /api/ops/save` body: draft → persists, returns `{id, public_url}`
- `GET  /api/ops/:id` (admin) → full JSON
- `GET  /p/:slug` (public) → static/SSR page rendering `ops_json` (no admin controls)
- `POST /api/send` body: `{ops_id, to[]}` → fan-out to email API, store results
- `POST /api/law/rules` (admin) → CRUD for rules

**Auth**: Admin routes protected via a simple Access Key in headers or one-time magic links (in Workers).

---

## 3) TDD plan — test suites (red → green → refactor)
### 3.1 Unit tests (Miniflare/Workerd)
- **Rules engine**
  - Given inputs (“fall”, “openings”, “guardrail”), Then at least one law link is returned.
  - No duplication: same rule fires once.
- **OPS composer**
  - Summary max 6 lines; checklist 6–10 items; JSON schema validation.

### 3.2 Integration tests (Workers + D1)
- **Subscribe**
  - Creates unique record; duplicate returns idempotent success.
- **Save OPS**
  - Persists `ops_json`; returns public slug; GET `/p/:slug` renders required sections.
- **Send**
  - Mocks provider (HTTP 2xx) → writes `deliveries` with status=sent.

### 3.3 E2E tests (Pages + Playwright)
- **Landing flow**: subscribe and see confirmation.
- **Admin flow**: create OPS → preview → publish → open public URL → click PDF (client-side) and see file generated.
- **Email flow**: trigger send, UI shows “Sent”, and `deliveries` updated.

---

## 4) Implementation notes (Cloudflare Free conscious)
- **No binary storage** in MVP: email sends **links**; PDF is generated client-side on demand.
- **Caching**: KV cache for public OPS JSON (immutable after publish) to reduce D1 reads.
- **LLM usage**: keep **optional**. Start rules-first; if enabled, call model API with short prompts; rate-limit in Worker.
- **Secrets**: Email API keys stored in Worker environment (Secrets); never shipped to client.
- **Fonts**: Use system fonts or embed a small open font subset for PDF consistency.

---

## 5) UI composition
- **Landing**: headline, single email field, latest 3 OPS cards (from D1), footer contact line.
- **Admin Builder**: left = input fields; right = live OPS preview with tabs (Summary / Causes / Checklist / Laws / Illustration).
- **Public OPS**: clean A4 layout, print/PDF button, link to sources (law URLs).

---

## 6) Accessibility & mobile
- Color-contrast AA+, keyboard focus rings, semantic landmarks, mobile-first breakpoints; print CSS for A4.

---

## 7) CI/CD
- GitHub → Cloudflare Pages (Preview → Production).
- Workers: wrangler deploy; run tests on every PR; block merge on failing tests.

---

## 8) Rollout plan (week-by-week with tests)
- **Week 1**: Landing + subscribe API + OPS form scaffold; unit tests for rules/composer.
- **Week 2**: Public page + D1 persistence + integration tests; initial 20–30 law rules seeded.
- **Week 3**: Email API wiring + delivery logs + e2e smoke; client-side PDF button solid.
- **Week 4**: A11y, print polish, mobile QA; test data set (3 sample OPS) and demo script.

---

## 9) Definition of Done (MVP)
- All unit, integration, and e2e tests **green** in CI.
- Create→Publish→Share→Open→PDF works on Chrome/Edge/Safari (desktop & mobile).
- Seeded law rules produce at least one hit for each of the 3 demo scenarios.
- Zero PII leak in public pages; secrets never exposed.

---

## 10) Future (post-MVP)
- Role-based auth, richer rule editor, AI law search with citations, image upload with server-side redaction, weekly digest automation.
