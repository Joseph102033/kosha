# Safe OPS Studio

Transform accident overviews into comprehensive OPS briefs with law mappings, root causes, prevention checklists, and shareable pages.

## Tech Stack

- **Frontend**: Next.js (Pages Router) + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **Email**: Resend/Mailgun (REST API)
- **PDF**: html2pdf.js (client-side)
- **Testing**: Jest + Miniflare (unit/integration), Playwright (E2E)
- **Deployment**: Cloudflare Pages + Wrangler CLI

## Project Structure

```
/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── pages/             # Pages Router
│   │   ├── components/        # React components
│   │   ├── styles/           # Tailwind CSS
│   │   └── tests/            # Frontend tests
│   └── workers/               # Cloudflare Workers API
│       ├── src/
│       │   ├── subscriptions/ # Email subscription domain
│       │   ├── ops/          # OPS document domain
│       │   ├── law/          # Law mapping domain
│       │   ├── delivery/     # Email delivery domain
│       │   ├── db/           # D1 database access
│       │   ├── cache/        # KV cache access
│       │   └── utils/        # Shared utilities
│       ├── migrations/       # D1 migrations
│       └── tests/            # Worker tests
├── scripts/                   # DB seeding, utilities
└── vooster-docs/             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install web dependencies
cd apps/web
npm install

# Install workers dependencies
cd ../workers
npm install
```

### Development

```bash
# Start Next.js dev server
cd apps/web
npm run dev

# Start Workers dev server (in another terminal)
cd apps/workers
npm run dev
```

### Database Setup

The D1 database is already configured:
- **Database ID**: `4409b768-3430-4d91-8665-391c977897c7`
- **KV Namespace ID**: `03757fc4bf2e4a0e99ee6cc7eb5fa1ad`

Tables created:
- `subscribers` - Email subscription list
- `ops_documents` - OPS documents
- `deliveries` - Email delivery logs
- `law_rules` - Law keyword mappings

## Development Workflow

This project follows **Test-Driven Development (TDD)**:
1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Clean up while keeping tests green

## Contributing

Please follow the guidelines in `CLAUDE.md` and `vooster-docs/`.

## License

Private project - All rights reserved
