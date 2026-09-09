# RELEASE GATE — Aurum Talk v1.17.0

## GO somente se todos forem PASS
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm verify:upgrade-v1.17`
- [ ] typecheck
- [ ] lint
- [ ] unit tests
- [ ] DB/invariant/RLS tests
- [ ] build
- [ ] smoke app
- [ ] smoke worker
- [ ] smoke scheduler
- [ ] fresh migration
- [ ] upgrade migration em clone representativo
- [ ] AI handoff regression
- [ ] Agenda/Google/Meet regression
- [ ] CRM/Product/Meta regression
- [ ] visual/branding regression
- [ ] backup restore drill
- [ ] rollback drill
- [ ] observability/alerts verificadas
- [ ] owner + runbook + rollback owner definidos

## NO-GO automático
Qualquer falha P0, isolamento multi-tenant não provado, migration não testada em clone, restore não demonstrado ou handoff humano permitindo resposta posterior do bot.

## Estado atual
**NO-GO / production blocked** até evidência runtime e recovery.
