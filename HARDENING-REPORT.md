# HARDENING REPORT — Aurum Talk v1.17.0

## Estado real
O checkpoint W1–W7 foi usado como fonte canônica a partir do ZIP completo.

## Correção encontrada
Dos três imports reportados anteriormente:
- `tests/e2e/confirmar-dado-do-contato.spec.ts`: **defeito real corrigido**. O script temporário é executado a partir da raiz e agora importa `./scripts/lib/env-de-teste`.
- `tests/e2e/escalacao-ciclo.spec.ts`: falso positivo; o script temporário é criado na raiz e `./lib/agent-engine/agent/inbound-turn` é válido nesse contexto.
- `tests/unit/telas-sem-dado-de-mentira.test.ts`: falso positivo; ocorrências estavam em comentários/documentação do teste.

Revarredura de imports estáticos reais: **0 não resolvidos**.

## Banco
- migrations originais Aurum: **185**
- migrations hardened: **213**
- novas: **28**
- histórico antigo alterado: **0** (evidência herdada do repo-audit anterior)

## Verificador estrutural
`node scripts/verify-upgrade-v1.17.mjs`: **PASS**

## Runtime
pnpm disponível: **não disponível**.
Não há evidência nesta execução de frozen install, typecheck, lint, test suite, build, migration real, restore ou rollback.

## Artefatos adicionados
- `MIGRATION-RUNBOOK-V1.17.md`
- `REGRESSION-MATRIX.md` / `.csv`
- `ROLLBACK-RESTORE-RUNBOOK.md`
- `RELEASE-GATE.md`
- `HARDENING-MANIFEST.json`

## Gate
- GATE-STRUCTURAL: **PASS**
- GATE-RUNTIME: **PENDING**
- GATE-RECOVERY: **PENDING**
- GATE-PROD: **BLOCKED**
