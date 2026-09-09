<div align="center">
  <img src="public/imobi-logo.png" alt="IMOBI TALK" width="220">

# IMOBI TALK

**CRM, atención y automatización para operaciones inmobiliarias.**

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)
</div>

## Descripción general

IMOBI TALK reúne gestión de leads, atención por WhatsApp, embudos de ventas y automatización en una aplicación self-hosted. Operadores humanos y agentes de IA pueden trabajar en el mismo flujo, con control de acceso, aislamiento entre organizaciones e historial auditable.

Las capacidades verificadas incluyen contactos y leads, embudos configurables, inbox, radar, agenda, distribución de atención, webhooks y automatizaciones, métricas, auditoría, flujos de privacidad y agentes de IA configurables. WhatsApp, IA, Redis, Supabase y observabilidad requieren los servicios externos y credenciales correspondientes.

## Tecnología

Next.js 16, React 19, TypeScript 6 estricto, Tailwind CSS 3, Supabase/PostgreSQL, Redis, WAHA, Vercel AI SDK, Sentry, Vitest, Playwright y Docker Compose.

## Instalación para desarrollo

Requisitos: Node.js 22+, pnpm 9.15.9 y un proyecto Supabase/PostgreSQL.

```bash
git clone https://github.com/hudsonlcustodio/imobitalk.git
cd imobitalk
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Consulte el [README canónico en portugués](README.md) para la preparación de la base de datos, configuración del entorno, pruebas, Docker, despliegue, seguridad, estructura del proyecto y descripción completa de las funcionalidades.

## Validación

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:db
pnpm test:e2e
pnpm build
pnpm preflight:prod
```

Los invariantes de base de datos requieren Docker. Las pruebas E2E requieren una aplicación y una base de datos preparadas.

## Operación y seguridad

- [Guía de despliegue](DEPLOYMENT-IMOBI.md)
- [Runbook operativo](RUNBOOK-IMOBI.md)
- [Preparación para producción](PRODUCTION-READINESS.md)
- [Política de seguridad](SECURITY.md)

## Licencia

Publicado bajo la licencia MIT. Consulte [LICENSE](LICENSE) y preserve sus avisos de atribución.
