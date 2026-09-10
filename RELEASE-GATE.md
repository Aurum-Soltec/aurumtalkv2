# RELEASE GATE — AurumTalk RC Closure

## Resultado atual

**RC_CODE_VALIDATED_INFRA_PENDING**

O código e os gates locais não bloqueiam a RC. A validação de banco/RLS e E2E
continua pendente porque o daemon Docker não está disponível neste ambiente.

## Gates executados

| Gate | Resultado | Evidência |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | dependências instaladas congeladas |
| `pnpm verify:upgrade-v1.17` | PASS | 21/21 verificações |
| `pnpm typecheck` | PASS | sem erros TypeScript |
| `pnpm lint` | PASS | 0 erros; 313 avisos preexistentes |
| `pnpm test:unit` | PASS | 652 arquivos; 7.088 pass; 1 expected fail |
| `pnpm build` | PASS | Next 16.3.4; 53 páginas/rotas geradas |
| `pnpm test:db` | BLOCKED_EXTERNAL_INFRA | Docker daemon ausente |
| `pnpm test:e2e` | BLOCKED_EXTERNAL_INFRA | depende de banco/Supabase local |
| Actions remota | PENDING | action comum corrigida; retry ainda depende da Actions e do segredo de release |

## Não executado por escopo ou infraestrutura

- Smoke de app/worker/scheduler, fresh migration, upgrade migration, restore e
  rollback exigem Docker/staging e não foram marcados como PASS.
- Nenhuma tag ou release foi criada.
- PRs Dependabot não foram mesclados.
- O workflow `release` não pode cortar tag neste host sem `RELEASE_APP_ID` e
  `RELEASE_APP_PRIVATE_KEY`; isso é configuração externa, não foi inventado.

## Condição de GO

Executar banco/invariantes e E2E em ambiente Docker/Supabase funcional, obter os
checks obrigatórios verdes no commit final e registrar a evidência antes de
promover qualquer versão ou canal `stable`.
