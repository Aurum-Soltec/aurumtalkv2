# IMOBI CRM — Deploy

## 1. Pré-requisitos

- Node 22 para desenvolvimento/CI.
- pnpm conforme `packageManager` do `package.json`.
- Docker + Docker Compose para self-host.
- projeto Supabase de **staging** separado do production.
- repositório GitHub do fork IMOBI.
- três imagens GHCR publicadas pelo workflow:
  - `ghcr.io/<owner>/imobi-crm:<versão>`
  - `ghcr.io/<owner>/imobi-worker:<versão>`
  - `ghcr.io/<owner>/imobi-scheduler:<versão>`

## 2. Configuração

Copie `.env.hostgator.example` para `.env` quando usar o compose self-host e substitua
todos os placeholders. Nunca comite `.env`.

Antes de subir:

```bash
pnpm preflight:prod
```

## 3. Banco

Nunca execute `db reset --linked` em produção.

Preview:

```bash
pnpm db:migrate:check
```

Aplicação:

```bash
pnpm db:migrate
```

O comando exige `SUPABASE_DB_ADMIN_URL` e usa as migrations versionadas.

## 4. Imagens

O `docker-compose.prod.yml` **não possui fallback para o registry upstream**.
`APP_IMAGE`, `WORKER_IMAGE` e `SCHEDULER_IMAGE` são obrigatórias.

Prefira tag imutável de release.

## 5. Subida

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Readiness do processo: `GET /api/v1/ready`  
Health das dependências: `GET /api/v1/health`

## 6. Smoke obrigatório

Validar em staging e depois em produção:
login; isolamento de organização; inbox; lead; envio/recebimento WhatsApp; handoff;
agenda; permissões admin/manager/agent; logout; worker; scheduler; health.

## 7. Rollback

Aplicação: voltar as imagens para a última tag conhecida e compatível.

Banco: não presumir rollback destrutivo. Migrations devem preferir expand/contract e
forward-fix. Restore é último recurso e precisa ter sido testado previamente.
