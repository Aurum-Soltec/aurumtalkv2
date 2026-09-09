# IMPLEMENTATION W5 — CRM / Produto / Tarefas / Relatórios / Meta Ads

Baseline: Aurum W1-W2-W3-W4 + DeskcommCRM v1.17.0

## Escopo implementado
- catálogo de produtos e importação;
- custom fields;
- moeda por organização;
- tarefas;
- atividades e relatórios;
- bulk move;
- merge/duplicidade de contatos/leads;
- Meta Ads;
- conversões e feedback de negócio ganho;
- APIs, libs, UI e testes upstream relacionados.

## Evidência estrutural
- Arquivos W5 copiados diretamente do upstream: **67**
- Dependências locais adicionais incorporadas por closure: **17**
- Rotas antes diferidas e agora liberadas: **0**
- Imports locais não resolvidos na árvore: **3**
- Arquivos W5 com divergência histórica do Aurum e sinais de regra de negócio: **11**

## Decisões
- As migrations necessárias já foram incorporadas em W1.
- Rotas W5 deixam o guard temporário apenas quando a implementação correspondente existe fisicamente.
- Arquivos com reverse drift estão listados no manifesto para revisão semântica; o upstream não é tratado como vencedor automático em regras próprias do fork.
- Não houve alteração de branding/UI global; isso permanece para W6.

## Gates
- GATE-W5-CODE: implementation-complete
- GATE-W5-IMPORTS: conditional-pass
- GATE-W5-SEMANTIC-REVIEW: in-progress para reverse drift
- GATE-RUNTIME: blocked até install/test
- GATE-PROD: blocked

## Reverse drift review
- `app/api/v1/contacts/[id]/crm-summary/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/[id]/proposals/[proposal_id]/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/[id]/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/[id]/timeline/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/_handler.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/import/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `app/api/v1/contacts/route.ts` — **UPSTREAM_WITH_REGRESSION_TEST**
- `components/contacts/ContactsTable.tsx` — **UPSTREAM_WITH_REGRESSION_TEST**
- `components/contacts/CustomFieldsEditor.tsx` — **UPSTREAM_WITH_REGRESSION_TEST**
- `components/contacts/TimelineView.tsx` — **UPSTREAM_WITH_REGRESSION_TEST**
- `tests/invariants/meta-templates-rls.test.ts` — **UPSTREAM_WITH_REGRESSION_TEST**

Evidências de patch geradas para **0** arquivos com sinais explícitos de regra/vertical Aurum. Nenhum deles foi sobrescrito de volta automaticamente; o upstream permanece como base até merge semântico dirigido por teste.

Rotas W5 efetivamente liberadas do guard após confirmação de `page.tsx`: **6** — /app/tasks, /app/products, /app/ads/meta, /app/activities, /app/settings/conversoes, /app/settings/meta-ads.
