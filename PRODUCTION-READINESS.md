# IMOBI CRM — Production Readiness

Data da revisão: 2026-09-03

Commit validado localmente e no CI: `82f2d13`

Base remota: `a329f1db4d0804b26c9333768b88b5a23cca64c7`

Status: **Release Candidate — `GATE-PROD = BLOCKED`**

## Resultado desta revisão

- documentação pública consolidada como IMOBI CRM em PT-BR, inglês e espanhol;
- instruções de clone e caminhos corrigidos para `hudsonlcustodio/imobitalk`;
- referências Deskcomm preservadas somente como atribuição histórica ou contrato técnico;
- quatro dependências de hooks com risco de estado desatualizado corrigidas;
- lockfile reinstalado em modo congelado e auditoria de produção sem vulnerabilidades conhecidas;
- drift de readiness removido: o repositório já estava publicado e a `main` já tinha CI Linux;
- runbook expandido para deploy, rollback, migration, incidentes, backup e restore.

## Matriz de gates

| Gate | Estado | Evidência desta revisão |
|---|---|---|
| Integridade/lockfile | PASS | `pnpm install --frozen-lockfile` |
| Branding público | PASS | busca residual classificada + 266 testes de branding |
| Secrets no Git | PASS limitado | nenhum `.env` real rastreado e nenhum padrão de chave privada/token encontrado; não substitui scanner remoto |
| TypeScript | PASS | `pnpm typecheck`, heap de 8 GB |
| Lint | PASS | 0 erros; warnings reduzidos de 305 para 301 |
| Unitários focais | PASS | 266 testes de branding + 29 testes de varredura/worker |
| Unitários completos | PASS remoto | `verify`: 607 arquivos; 6.732 testes concluídos (6.731 pass + 1 expected fail) |
| Dependency audit | PASS | `pnpm security:audit`: nenhuma vulnerabilidade conhecida |
| Build padrão | BLOCKED local | panic interno do Turbopack no Windows; CI Linux da base passou em `a329f1d` |
| Build alternativo | FAIL local | webpack alcançou compilação e revelou resolução ausente de `client-only`/`server-only`; não é o caminho usado pelo CI |
| Shell/packaging | BLOCKED local | todas as provas executadas passaram, exceto modo POSIX `0600`, que NTFS/Git Bash não representa |
| DB/RLS invariants | PASS remoto | job `invariants` verde em `82f2d13` |
| E2E | PASS remoto | parte 1 em 13m24s e parte 2 em 23m42s; agregador verde |
| Docker build/boot | PASS remoto | três builds, `imagem-do-app-sobe` e `imagens-ok` verdes |
| CodeQL/security remoto | PASS | CodeQL e dependency audit verdes em `82f2d13` |
| GHCR | PASS para SHA / NOT VERIFIED para release | imagens do PR construídas; não há tag/release imutável confirmada |
| Branch protection | PASS | sete checks obrigatórios, strict + admins; force-push/deletion bloqueados |
| Release imutável + `stable` | BLOCKED | nenhuma tag/release Git; não promover antes dos demais gates |
| Staging | BLOCKED | infraestrutura e credenciais não fornecidas |
| Migration dry-run/aplicação | BLOCKED | `SUPABASE_DB_ADMIN_URL` de staging não fornecida |
| Backup/restore | BLOCKED | staging isolado não fornecido; backup sem restore não fecha o gate |
| Observabilidade | CONDITIONAL | Sentry permanece opt-in; destino próprio deve ser configurado |
| Runbook/rollback | PASS documental | `RUNBOOK-IMOBI.md` usa tags imutáveis e separa rollback de schema |

## Evidência remota do candidato

Consultado em 2026-09-03 via GitHub CLI. Para `82f2d13`, passaram `verify`, `invariants`,
`build-and-size`, dependency audit, CodeQL, E2E em duas partes, builds das três imagens,
boot da imagem do app e o agregador `imagens-ok`.

## Bloqueadores mínimos

1. Tag/release imutável somente depois dos gates técnicos; confirmar as três tags no GHCR.
2. Staging separado com Supabase/Postgres, Redis, WAHA de teste, domínio/TLS e secrets próprios.
3. Em staging: preflight, migration dry-run, backup, migration, invariantes, E2E/smoke e observação.
4. Restore do backup em ambiente isolado, aplicação iniciada e smoke aprovado.

Até esses quatro itens terem evidência, `GATE-PROD` permanece **BLOCKED**.
