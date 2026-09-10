# RELEASE GATE — AurumTalk RC Closure

## Resultado atual

**RC_VALIDATION_BLOCKED**

Os gates unitários, typecheck, lint e build passam, mas a validação de
banco/RLS e E2E encontrou falhas reais. A RC continua bloqueada.

## Gates executados

| Gate | Resultado | Evidência |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | dependências instaladas congeladas |
| `pnpm verify:upgrade-v1.17` | PASS | 21/21 verificações |
| `pnpm typecheck` | PASS | sem erros TypeScript |
| `pnpm lint` | PASS | 0 erros; 313 avisos preexistentes |
| `pnpm test:unit` | PASS | 652 arquivos; 7.088 pass; 1 expected fail |
| `pnpm build` | PASS | Next 16.3.4; 53 páginas/rotas geradas |
| `pnpm test:db` | FAIL_VALIDATION | baseline INSTALL/UPDATE passou; 8 arquivos de invariantes falharam, com 14 asserções falhas |
| `pnpm test:e2e` | FAIL_REMOTE | último run concluído: 21 casos falhos nas três partes |
| Actions remota | IN_PROGRESS | commit `238ff48`; release segue bloqueada por segredo externo |

## Não executado por escopo ou infraestrutura

- Smoke de app/worker/scheduler, fresh migration, upgrade migration, restore e
  rollback exigem Docker/staging e não foram marcados como PASS.
- Nenhuma tag ou release foi criada.
- PRs Dependabot não foram mesclados.
- O workflow `release` não pode cortar tag neste host sem `RELEASE_APP_ID` e
  `RELEASE_APP_PRIVATE_KEY`; isso é configuração externa, não foi inventado.

## Condição de GO

Corrigir as falhas de banco/invariantes e E2E, obter os checks obrigatórios
verdes no commit final e registrar a evidência antes de promover qualquer
versão ou canal `stable`.
