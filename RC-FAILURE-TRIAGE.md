# RC FAILURE TRIAGE — 2026-09-10

## Baseline

- Commit inicial: `d8ee83562f09bc57206c0e1e41d5e3090fdd2870`.
- Primeira execução completa local: 640 arquivos passaram, 12 falharam; 7.069
  testes passaram, 19 falharam e 1 falha esperada, em 7.089 testes.
- A primeira execução misturou drift real com timeouts de worker concorrente.
- Após as correções, a execução oficial completa passou: 652 arquivos, 7.088
  testes aprovados e 1 falha esperada.

## Falhas exatas da primeira execução completa

| Teste/arquivo | Classe | Causa e tratamento |
|---|---|---|
| `lib/ui/icons.test.ts` | ENVIRONMENT | timeout de import pesado do Phosphor sob worker concorrente; passou single-worker |
| `tests/unit/agents-md-versoes.test.ts` | WORKFLOW_DRIFT | AGENTS.md ainda dizia Tailwind 3; atualizado para 4 |
| `tests/unit/canais-selecionaveis.test.ts` | ENVIRONMENT | timeout de 15s sob concorrência; passou single-worker |
| `tests/unit/contato-audit-from-to.test.ts` | TESTE_DESATUALIZADO | mock não encadeava o segundo `.eq`; mock alinhado ao handler |
| `tests/unit/desfecho-de-agenda-e-sobre-o-passado.test.ts` | TESTE_DESATUALIZADO | handler passou a usar `fn_appointment_change`; fixture passou a observar o RPC |
| `tests/unit/e2e-cobertura-completa.test.ts` | WORKFLOW_DRIFT | listas citavam 16 specs ausentes; entradas órfãs removidas do workflow |
| `tests/unit/handoff-por-orcamento.test.ts` | ENVIRONMENT | scan amplo excedeu timeout sob concorrência; passou single-worker |
| `tests/unit/heranca-de-provider-nos-pontos-auxiliares.test.ts` | WORKFLOW_DRIFT | `agent_preview` herdava no runtime sem constar no registro; contrato alinhado |
| `tests/unit/i18n-a-data-segue-o-idioma.test.ts` | ENVIRONMENT | timeout de data-fns sob concorrência; passou single-worker |
| `tests/unit/packaging-artefato-do-cliente.test.ts` | TESTE_DESATUALIZADO | teste esperava `value=stable`; workflow agora promove atomicamente com `imagetools` |
| `tests/unit/pdf-extractor.test.ts` | ENVIRONMENT | timeout de extração PDF sob concorrência; passou single-worker |
| `tests/unit/suporte-cobertura-de-efeitos.test.ts` | ENVIRONMENT | gate usava split Unix em checkout Windows; teste tornado multiplataforma |

Os sete testes do arquivo de auditoria de contato contam como uma única causa
de fixture, assim como os dois casos do desfecho e os dois cases de cobertura de
suporte; por isso a tabela lista 12 arquivos para 19 falhas.

## Drift corrigido antes da execução final

- `REGRESSION_REAL`: filtros/contratos de agentes, guardas de efeitos de
  suporte, trigger de `appointment_no_show` e fronteiras de entrega auditável.
- `I18N_DRIFT`: dicionário espanhol passou a cobrir as chaves ativas da tela,
  sem fallback silencioso em português.
- `BRANDING_DRIFT`: tokens claros/escuros e expectativa da régua alinhados à
  paleta Aurum; links/OCI atuais apontam para Aurum-Soltec.
- `NAVIGATION_DRIFT`: hubs CRM/Análise e grupos laterais refletem o registry
  atual, sem expor integração técnica como item de sidebar.
- `WORKFLOW_DRIFT`: listas E2E, permissões, imagens GHCR e promoção `stable`
  foram reconciliadas com os artefatos que existem hoje.

## Resíduos aceitos

- 313 avisos de lint, 0 erros: dívida técnica pré-existente, sem aplicar
  autofix amplo numa RC de fechamento.
- Banco/RLS e E2E: `BLOCKED_EXTERNAL_INFRA`, nunca PASS, até Docker/Supabase
  estarem disponíveis.
