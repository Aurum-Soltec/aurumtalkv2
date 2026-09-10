# RC VALIDATION REPORT — AurumTalk

Data: 2026-09-10
Commit inicial: `d8ee83562f09bc57206c0e1e41d5e3090fdd2870`
Commit final: o commit que contém este relatório, com a mensagem
`fix(rc): close validation drift and regression gaps`.

## Classificação

**RC_VALIDATION_BLOCKED**

Os gates de código passam, mas a promoção para `RC_VALIDATED` está bloqueada
pelas falhas comprovadas de invariantes/RLS e E2E.

## Gates locais

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm verify:upgrade-v1.17` | PASS — 21/21 |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS — 0 erros, 313 avisos |
| `pnpm test:unit` | PASS — 652 arquivos; 7.088 pass; 1 expected fail |
| `pnpm build` | PASS — 53 páginas/rotas |
| `pnpm test:db` | FAIL_VALIDATION — baseline INSTALL/UPDATE passou; 8 arquivos falharam, 14 asserções |
| `pnpm test:e2e` | FAIL_REMOTE — último run concluído teve 21 casos falhos |

## Trabalho entregue

- Reconciliados contratos da API de versões, follow-up e agenda.
- Corrigidos tokens de marca e cobertura i18n espanhol.
- Corrigidos hubs/registry/sidebar e testes de navegação.
- Reconciliados workflows E2E, publicação GHCR, permissões e imagens atuais.
- Atualizados README PT/EN/ES, setup self-host/HostGator, OCI source labels e
  URLs do repositório atual.
- Criados os hubs `/app/crm` e `/app/analise` para manter a navegação com
  superfície visível e próximo passo, conforme a doutrina Sistema Vivo.
- Nenhuma dependência foi atualizada; nenhum PR Dependabot foi mesclado; nenhuma
  tag/release foi criada.

## Estado remoto observado antes do push

- `main` remota: `d8ee83562f09bc57206c0e1e41d5e3090fdd2870`.
- Dois PRs Dependabot abertos (#1 e #2), ambos com checks antigos falhos; não
  foram alterados.
- Runs do commit inicial apresentavam falhas em `e2e`/`perf`/`release`; o novo
  commit precisa gerar a leitura correspondente à RC Closure.
- No primeiro run do commit final, `ci`/`invariants`/`perf` revelaram a action
  local `preparar-node` ausente; ela foi restaurada em um follow-up explícito.
  `release` parou por configuração externa ausente (`RELEASE_APP_ID` e
  `RELEASE_APP_PRIVATE_KEY`), sem tentativa de fabricar credenciais.

## Próxima ação

Corrigir as falhas de governança e jornada, acompanhar os checks obrigatórios da
Actions no commit atual e só então decidir tag/release.
