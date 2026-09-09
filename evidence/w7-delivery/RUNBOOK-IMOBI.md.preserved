# IMOBI CRM — Runbook operacional

Todos os comandos partem da raiz do checkout. Produção usa uma tag imutável comum às
três imagens; nunca `latest`. Em VPS com proxy existente, mantenha também o arquivo
`docker-compose.traefik.yml` em todos os comandos de subida.

```bash
export COMPOSE="docker compose -f docker-compose.prod.yml -f docker-compose.traefik.yml --env-file .env"
```

## Preparar e publicar uma versão

1. confirme CI, security, E2E, invariantes e imagens verdes no SHA candidato;
2. execute `pnpm release:conferir` e revise o changelog gerado;
3. corte a release pelo workflow oficial;
4. confirme no GHCR a mesma tag imutável para `imobi-crm`, `imobi-worker` e `imobi-scheduler`;
5. só mova `stable` depois de staging, migration, smoke e restore aprovados.

## Pré-deploy em staging

```bash
pnpm install --frozen-lockfile
pnpm preflight:prod
pnpm db:migrate:check
```

O dry-run deve ser revisado antes de qualquer escrita. Gere um backup válido e registre
o SHA, a tag, o horário e o operador. Migration incompatível exige plano de forward-fix
ou restore já ensaiado; rollback de contêiner não desfaz schema.

## Deploy

Defina `APP_IMAGE`, `WORKER_IMAGE` e `SCHEDULER_IMAGE` no `.env` com a mesma tag imutável.

```bash
$COMPOSE pull
$COMPOSE up -d app worker scheduler
$COMPOSE ps
curl --fail --show-error https://SEU_DOMINIO/api/v1/ready
curl --fail --show-error https://SEU_DOMINIO/api/v1/health
```

Depois rode o smoke: login, isolamento de organização, leads, inbox, envio/recebimento,
handoff, agenda, permissões, logout, worker e scheduler.

## Migration

Após dry-run revisado e backup comprovado:

```bash
pnpm db:migrate
```

Observe locks/erros, repita readiness/health e execute invariantes e smoke. Nunca use
`db reset` em produção.

## Logs e reinício

```bash
$COMPOSE logs --since=30m app
$COMPOSE logs --since=30m worker
$COMPOSE logs --since=30m scheduler
$COMPOSE restart app worker scheduler
```

Reinício repetido não é recuperação. Readiness 200 com health 503 aponta dependência
degradada; investigue a dependência indicada.

## Rollback de aplicação

1. restaure no `.env` as três tags da última release compatível;
2. execute `$COMPOSE pull` e `$COMPOSE up -d app worker scheduler`;
3. valide readiness, health e smoke;
4. registre motivo, janela e resultado.

Se a migration não for compatível com a versão anterior, não faça rollback cego de
imagem. Use forward-fix aprovado ou o procedimento de restore ensaiado.

## Backup e restore

O backup é produzido pelo procedimento em `scripts/backup-db.sh`. Restore deve ocorrer
em banco isolado: restaurar, validar schema e amostras não sensíveis, iniciar a aplicação,
rodar smoke e registrar duração. Nunca teste restore sobrescrevendo produção.

## Incidente de segurança

Conter acesso, revogar/rotacionar credenciais afetadas, preservar logs, identificar
organizações e dados impactados sem expor PII, registrar timeline e comunicar o responsável.
Não publique tokens ou valores de secrets em ticket, chat ou log.
