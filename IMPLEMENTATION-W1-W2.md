# Aurum Talk — implementação W1 + W2 sobre DeskcommCRM v1.17.0

Data: 2026-09-09
Baseline upstream: DeskcommCRM v1.17.0
Base do fork: snapshot `imobitalk-main.zip`
Estado: implementação concluída para W1/W2; validação de runtime/DB ainda pendente.

## W1 — Banco e contratos

Implementado:
- preservadas as 185 migrations SQL históricas do Aurum;
- adicionadas as 28 migrations novas da v1.17.0;
- `supabase/baseline.sql` alinhado à v1.17.0 para fresh install;
- `supabase/migrations/MANIFEST.md` alinhado à v1.17.0;
- `lib/database.types.ts` alinhado à v1.17.0;
- `supabase/config.toml` do Aurum foi PRESERVADO (PostgreSQL 17), pois o upstream usa 15 como default local e isso não é requisito para aplicar as migrations.

Evidência estática:
- migrations históricas preservadas byte a byte: 185/185;
- migrations novas idênticas ao upstream: 28/28;
- baseline idêntico ao upstream: True;
- database types idênticos ao upstream: True.

## W2 — Security/Auth/Multi-tenant

Portado do upstream:
- criação atômica de organização + owner;
- recibo confiável de criação;
- recuperação de organização;
- aceite de convite e emissão de convite atualizados;
- interface por vínculo/membership;
- troca de organização com consulta fresca de membership;
- MFA no fluxo de troca/ações sensíveis;
- suporte temporário por sessão;
- encerramento de suporte;
- contexto de suporte read-only/full;
- guards/RBAC e tipos de auth atualizados;
- rotas de team/membership atualizadas;
- provider de transição de organização;
- banner de suporte/impersonation atualizado;
- recuperação de organização na UI;
- fluxo de signup/signin/confirm/MFA atualizado;
- suporte à interface individual na equipe.

## Compatibilidade deliberada

A nova camada de `interface por vínculo` usa o catálogo da v1.17.0, mas W5/W6 ainda não foram aplicados.
Foi adicionado um guard temporário `DEFERRED_UNTIL_W5_W6` em `lib/navigation/interface.ts` para NÃO expor destinos que ainda não existem nesta árvore:
- `/app/tasks`
- `/app/products`
- `/app/ads/meta`
- `/app/activities`
- `/app/settings/conversoes`
- `/app/settings/meta-ads`

Esse guard deve ser removido progressivamente conforme W5/W6 forem incorporados.

A regra Aurum/Nuvemshop permanece preservada: a integração continua existente, mas não aparece no sidebar.

## Itens deliberadamente NÃO aplicados ainda

- W3 IA/agents/workers/atendimento;
- W4 agenda/Google/Meet;
- W5 catálogo/tasks/Meta Ads/CRM;
- W6 Tailwind 4 e refatoração visual completa;
- bump global de dependências/package/lockfile.

## Validações executadas

1. Import graph local:
   - nenhum import local quebrado introduzido por W1/W2;
   - três referências quebradas já existiam no snapshot Aurum e não foram introduzidas por esta implementação.

2. Parse TypeScript/TSX:
   - 2.521 arquivos `.ts/.tsx` analisados pelo compilador TypeScript em modo de transpile/syntax;
   - 0 erros sintáticos;
   - `types/public-env.d.ts` não é transpilável por `transpileModule` (arquivo declaration); não representa erro de sintaxe da implementação.

3. Consistência de migrations:
   - 185 históricas preservadas;
   - 28 novas copiadas exatamente do upstream;
   - total atual: 213 migrations SQL.

## Evidência ainda necessária antes de merge/produção

- `pnpm install --frozen-lockfile`;
- typecheck completo;
- lint;
- unit/invariant tests de auth/RBAC/membership/support;
- aplicar migrations em banco fresh;
- aplicar 28 migrations em cópia de banco Aurum existente;
- validar RLS com papéis viewer/agent/manager/admin/platform admin;
- testar suporte temporário read-only e expiração;
- testar signup/confirm/recovery/invite/MFA;
- backup + restore testado antes de migração de produção.

## Gate

- GATE-TRUTH: passed
- GATE-DATA/W1: implementation-complete, runtime-evidence-pending
- GATE-SEC/W2: implementation-complete, runtime-evidence-pending
- GATE-IMPLEMENT: conditional-pass para W1/W2
- GATE-PROD: blocked até execução dos testes de banco/runtime/security
