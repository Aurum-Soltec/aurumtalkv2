# UPGRADE VALIDATION — Aurum Talk sobre DeskcommCRM v1.17.0

## Ordem obrigatória de evidência

1. `pnpm install --frozen-lockfile`
2. `pnpm verify:upgrade-v1.17`
3. `pnpm typecheck`
4. `pnpm lint`
5. `pnpm test:unit`
6. `pnpm test:db` com banco efêmero
7. testes de invariants/RLS
8. `pnpm build`
9. smoke test app/worker/scheduler
10. e2e crítico: signup, tenant switch, invite, MFA, handoff humano, IA, agenda/Meet, produtos, tarefas, Meta Ads
11. migration test fresh install
12. migration test upgrade a partir de cópia do banco Aurum
13. backup + restore test
14. rollback de aplicação e verificação de compatibilidade de schema

## Gates de produção

Não liberar enquanto qualquer item abaixo estiver sem evidência:
- frozen lockfile;
- migrations fresh + upgrade;
- RLS/tenant isolation;
- handoff humano sem resposta automática posterior;
- agenda/Google reconciliation idempotente;
- build;
- smoke app/worker/scheduler;
- rollback;
- restore funcional;
- owner/runbook.
