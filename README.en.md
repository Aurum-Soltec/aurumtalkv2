<div align="center">
  <img src="public/imobi-logo.png" alt="IMOBI TALK" width="220">

# IMOBI TALK

**CRM, customer service, and automation for real estate operations.**

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)
</div>

## Overview

IMOBI TALK combines lead management, WhatsApp service, sales pipelines, and automation in a self-hosted application. Human operators and AI agents can work in the same flow, with role-based access, organization isolation, and an auditable history.

Verified capabilities include contacts and leads, configurable pipelines, inbox, radar, appointments, team routing, webhooks and automations, metrics, audit logs, privacy workflows, and configurable AI agents. WhatsApp, AI, Redis, Supabase, and observability features require the corresponding external services and credentials.

## Technology

Next.js 16, React 19, strict TypeScript 6, Tailwind CSS 3, Supabase/PostgreSQL, Redis, WAHA, Vercel AI SDK, Sentry, Vitest, Playwright, and Docker Compose.

## Development setup

Requirements: Node.js 22+, pnpm 9.15.9, and a Supabase/PostgreSQL project.

```bash
git clone https://github.com/hudsonlcustodio/imobitalk.git
cd imobitalk
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

See the canonical [Portuguese README](README.md) for database preparation, environment configuration, tests, Docker, deployment, security, project structure, and the complete feature description.

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:db
pnpm test:e2e
pnpm build
pnpm preflight:prod
```

Database invariants require Docker. End-to-end tests require a prepared application and database environment.

## Operations and security

- [Deployment guide](DEPLOYMENT-IMOBI.md)
- [Operations runbook](RUNBOOK-IMOBI.md)
- [Production readiness](PRODUCTION-READINESS.md)
- [Security policy](SECURITY.md)

## License

Released under the MIT License. See [LICENSE](LICENSE) and preserve its attribution notices.
