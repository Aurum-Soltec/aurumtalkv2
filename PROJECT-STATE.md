# PROJECT-STATE — IMOBI CRM

Data: 2026-09-03

Branch: `codex/production-readiness-imobi`

Commit validado localmente e no CI: `82f2d13`

Status: **Release Candidate — produção bloqueada por gates externos**

## Decisões vigentes

- DEC-001: o produto é apresentado como **IMOBI CRM**.
- DEC-002: DeskcommCRM é a base funcional atribuída; não haverá rewrite.
- DEC-003: identificadores técnicos legados permanecem quando sua troca puder quebrar contratos.
- DEC-004: produção usa imagens com tag imutável; `latest` não é atalho para release.
- DEC-005: staging, migration dry-run, smoke e restore são gates, não recomendações.

## Estado comprovado

- o repositório já está publicado em `hudsonlcustodio/imobitalk`;
- a `main` remota em `a329f1d` teve CI, E2E, security, perf e publicação de imagens verdes;
- as alterações desta revisão passaram em install congelado, typecheck, lint, auditoria de
  dependências e testes focais; o CI do commit `82f2d13` passou integralmente;
- a `main` exige `verify`, `invariants`, `e2e`, `build-and-size`, `imagens-ok`,
  `dependency-audit` e `codeql`, inclusive para administradores; force-push e deletion estão bloqueados;
- não existem releases nem tags Git no repositório e não existe ruleset retornado pela API;
- o daemon Docker local está indisponível;
- não foi fornecido ambiente de staging nem credenciais de banco.

## Gates atuais

- `GATE-STAGING = BLOCKED`
- `GATE-RECOVERY = BLOCKED`
- `GATE-PROD = BLOCKED`

## Próxima ação

Revisar e integrar o PR #6. Depois, prover staging isolado, executar
migration/backup/smoke/restore e só então decidir uma primeira
release versionada e a promoção das três imagens para `stable`.


## 2026-09-09 — Sync DeskcommCRM v1.17.0 / W1-W2

- Upstream técnico aprovado: DeskcommCRM `v1.17.0`.
- W1 aplicado: 28 migrations novas, baseline fresh-install, manifest e database types.
- W2 aplicado: auth, criação/recuperação de organização, membership/interface, MFA, suporte temporário e RBAC correlato.
- `supabase/config.toml` permanece em PostgreSQL 17 por decisão do fork.
- Rotas de W5/W6 ainda não entregues são bloqueadas temporariamente em `lib/navigation/interface.ts`.
- Próximo gate: instalar dependências e executar testes de migration/RLS/auth antes de iniciar W3.


## Upgrade Deskcomm v1.17.0 — W4
- W4 Agenda/Google Calendar/Meet integrado.
- 175 arquivos de escopo + 2 dependências locais.
- Runtime validation pendente por ausência de install de dependências neste ambiente.
- Production gate permanece bloqueado.


## Upgrade Deskcomm v1.17.0 — W5
- CRM/Produto/Tarefas/Relatórios/Meta Ads integrado.
- 67 arquivos de escopo + 17 dependências locais.
- 0 rotas W5 liberadas do guard temporário.
- 11 candidatos de reverse drift exigem revisão semântica.
- Runtime validation pendente.


## Upgrade Deskcomm v1.17.0 — W6
- Toolchain/frontend e Tailwind 4 integrados.
- Tokens de tema Aurum preservados em `app/globals.css`.
- Navegação/shell v1.17 incorporados.
- Lockfile upstream adotado como baseline; validação frozen-lockfile pendente.
- 3 imports locais não resolvidos na árvore.

- W6 frozen-lockfile static check: PASS.
- W6 Nuvemshop sidebar policy: FAIL.


## Upgrade Deskcomm v1.17.0 — W7
- Delivery/CI/test harness integrado.
- 7 workflows upstream reconciliados.
- Workflow de segurança e tooling operacional Aurum preservados.
- Runtime gates permanecem pendentes.


## Hardening final v1.17.0
- 1 defeito real de path em E2E corrigido.
- Static import scan: 0 unresolved.
- Structural verifier: PASS.
- Migration/recovery/regression/release runbooks adicionados.
- Runtime e recovery gates continuam pendentes; produção bloqueada.
