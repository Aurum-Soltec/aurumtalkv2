<div align="center">
  <img src="public/imobi-logo.png" alt="IMOBI TALK" width="220">

# IMOBI TALK

**CRM, atendimento e automação para operações imobiliárias.**

[Português](README.md) · [English](README.en.md) · [Español](README.es.md)

[![CI](https://github.com/hudsonlcustodio/imobitalk/actions/workflows/ci.yml/badge.svg)](https://github.com/hudsonlcustodio/imobitalk/actions/workflows/ci.yml)
[![Security](https://github.com/hudsonlcustodio/imobitalk/actions/workflows/security.yml/badge.svg)](https://github.com/hudsonlcustodio/imobitalk/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-5E2D83.svg)](LICENSE)
</div>

## Visão geral

O IMOBI TALK reúne relacionamento com leads, atendimento por WhatsApp, gestão de funis e automação em uma aplicação self-hosted. Pessoas e agentes de IA podem atuar no mesmo fluxo, com controle de acesso, isolamento entre organizações e histórico auditável.

O projeto é distribuído como código aberto para execução em infraestrutura própria. Alguns recursos dependem de serviços externos configurados pelo operador, como Supabase, WAHA ou Meta Cloud API, Redis, provedores de IA e Sentry.

## Principais funcionalidades

- **CRM imobiliário:** contatos, leads, funis configuráveis, etapas, motivos de perda, agenda e radar de atendimentos que precisam de ação.
- **Atendimento:** inbox compartilhada, respostas rápidas, atribuição e transferência entre agentes humanos e IA.
- **WhatsApp:** conexão por QR code via WAHA e integração opcional com a API oficial da Meta; ambos exigem configuração externa.
- **Automações e integrações:** webhooks de entrada e saída, regras orientadas a eventos e integração opcional com Nuvemshop.
- **Agentes de IA:** agentes configuráveis, roteadores, follow-ups, conhecimento com RAG, memória, skills, execuções, propostas e orçamento de uso. O funcionamento requer um provedor de IA compatível.
- **Equipe e governança:** papéis `viewer`, `agent`, `manager` e `admin`, distribuição de atendimento e trilha de auditoria.
- **Análise:** métricas de funil e atendentes, evolução dos agentes de IA e histórico operacional.
- **Privacidade:** isolamento multi-tenant com RLS, exportação e anonimização de dados e recursos para atender solicitações de titulares. Esses controles não constituem certificação jurídica de conformidade com a LGPD.
- **Marca própria:** nome, logo e cor da instalação podem ser configurados sem alterar o código.

## Arquitetura e stack

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js 16, React 19 e TypeScript 6 em modo estrito |
| Interface | Tailwind CSS 3 e shadcn/ui |
| Dados e autenticação | Supabase: PostgreSQL, Auth, Realtime e Storage |
| Filas e tarefas | `event_log`, worker e scheduler |
| Cache e rate limit | Redis com API compatível com Upstash |
| WhatsApp | WAHA Plus e integração opcional com Meta Cloud API |
| IA | Vercel AI SDK com provedores configuráveis |
| Observabilidade | Sentry opcional |
| Qualidade | ESLint, Vitest, Playwright e CodeQL |
| Distribuição | Docker Compose e imagens separadas para app, worker e scheduler |

Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para os limites e contratos do sistema.

## Requisitos

- Node.js 22 ou superior;
- pnpm 9.15.9, definido em `package.json`;
- projeto Supabase/PostgreSQL;
- Docker e Docker Compose para o ambiente self-hosted e para testes que dependem de infraestrutura;
- credenciais dos serviços opcionais que serão habilitados.

## Instalação para desenvolvimento

```bash
git clone https://github.com/hudsonlcustodio/imobitalk.git
cd imobitalk
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

A aplicação fica disponível em <http://localhost:3000>. Preencha somente as variáveis necessárias ao ambiente e nunca versione `.env` ou credenciais. O guia completo está em [docs/SETUP.md](docs/SETUP.md).

## Configuração

- Desenvolvimento: use [.env.example](.env.example) como referência para `.env.local`.
- Produção: use [.env.production.example](.env.production.example) ou [.env.hostgator.example](.env.hostgator.example) como base para `.env`.
- Valide a configuração de produção com `pnpm preflight:prod`.

Chaves administrativas do Supabase, senhas de banco, tokens de WhatsApp, Redis, IA, Sentry e GitHub devem permanecer apenas no gerenciador de segredos ou no arquivo de ambiente privado da implantação.

## Banco de dados

O schema versionado está em `supabase/migrations/`; instalações self-hosted também usam o baseline idempotente em `supabase/baseline.sql`.

```bash
# Mostra o plano sem aplicar alterações
pnpm db:migrate:check

# Aplica as migrations pendentes
pnpm db:migrate
```

Revise o dry-run e faça backup antes de aplicar migrations em ambiente real. Os comandos exigem a configuração de banco descrita em [DEPLOYMENT-IMOBI.md](DEPLOYMENT-IMOBI.md).

## Desenvolvimento e testes

```bash
pnpm typecheck          # TypeScript estrito
pnpm lint               # ESLint
pnpm test:unit          # testes unitários
pnpm test:db            # baseline, invariantes de banco e isolamento RLS; requer Docker
pnpm test:e2e           # jornadas Playwright; requer aplicação e banco preparados
pnpm test:shell         # kit de instalação e atualização
pnpm build              # build de produção
pnpm preflight:prod     # validação das variáveis e artefatos de produção
pnpm gov:verify         # typecheck, lint e testes unitários
```

`pnpm gov:verify` não substitui `pnpm test:db` nem `pnpm test:e2e` quando a mudança afeta schema, RLS ou fluxos de usuário.

## Docker

A implantação é composta pelos seguintes artefatos do projeto:

- `imobi-crm`: aplicação web;
- `imobi-worker`: processamento de eventos e tarefas assíncronas;
- `imobi-scheduler`: agendamento das rotinas recorrentes.

O arquivo [docker-compose.prod.yml](docker-compose.prod.yml) também coordena os serviços externos locais necessários, como WAHA, Redis e proxy. Em produção, configure `APP_IMAGE`, `WORKER_IMAGE` e `SCHEDULER_IMAGE` com a mesma tag imutável de release. Não use `latest` como versão de produção.

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Implantações atrás de proxy reverso existente devem seguir o procedimento de [RUNBOOK-IMOBI.md](RUNBOOK-IMOBI.md), incluindo `docker-compose.traefik.yml` quando aplicável.

## Deploy

Antes de promover uma versão, confirme CI, auditoria de dependências, CodeQL, E2E, invariantes de banco, build das imagens, backup e restore em staging.

- [Guia de deployment](DEPLOYMENT-IMOBI.md)
- [Runbook operacional](RUNBOOK-IMOBI.md)
- [Production readiness](PRODUCTION-READINESS.md)
- [Checklist de segurança](SECURITY-CHECKLIST-IMOBI.md)

## Segurança

O projeto aplica RLS em tabelas multi-tenant, RBAC no servidor, validação de entrada, auditoria e tratamento de dados sensíveis. A segurança final também depende da configuração da VPS, rede, proxy, Supabase e serviços integrados.

Não abra issues públicas para vulnerabilidades. Siga a [política de segurança](SECURITY.md) e use o relato privado do GitHub.

## Estrutura do projeto

```text
app/                     interface e rotas da API Next.js
components/              componentes React e sistema de interface
lib/                     domínio, autenticação, integrações e infraestrutura
workers/                 consumidores de eventos e rotinas assíncronas
supabase/                migrations e baseline do banco
tests/                   testes unitários, invariantes, E2E e shell
hostgator-setup-kit/      instalação, atualização, backup e diagnóstico self-hosted
docs/                    arquitetura, especificações, doutrina e runbooks
```

## Documentação adicional

- [Visão do produto](VISION.md)
- [Índice da documentação](docs/index.md)
- [Configuração local](docs/SETUP.md)
- [Contribuição](CONTRIBUTING.md)
- [Histórico de versões](CHANGELOG.md)

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE) para os termos e avisos de atribuição que devem ser preservados.
