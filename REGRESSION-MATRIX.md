# REGRESSION MATRIX — Aurum Talk v1.17.0

| ID | Área | Jornada | Pri | Evidência | Critério | Onda |
|---|---|---|---|---|---|---|
| AUTH-01 | Auth | Signup/confirm/signin | P0 | E2E | Conta acessa tenant correto; sem bypass | W2 |
| TENANT-01 | Multi-tenant | Troca de organização | P0 | E2E + RLS | Nenhum dado cruza tenant | W2 |
| MEM-01 | Membership | Invite/accept/interface por vínculo | P0 | E2E + DB | Role/interface aplicados corretamente | W2 |
| MFA-01 | Security | Ação sensível com MFA | P0 | E2E | Operação negada sem nível requerido | W2/W4 |
| SUP-01 | Support | Suporte temporário read-only/full | P0 | E2E + Audit | Escopo, identidade e expiração respeitados | W2 |
| AI-01 | AI/Handoff | Humano assume conversa | P0 | Integration + E2E | Bot não responde sobre atendimento humano | W3 |
| AI-02 | AI | Pre-go-live/allowlist | P0 | Integration | Número não autorizado não dispara IA | W3 |
| AI-03 | AI | Review/autonomy | P1 | Integration | Resposta segue nível de autonomia/revisão | W3 |
| AG-01 | Agenda | Criar/remarcar/cancelar | P0 | E2E + DB | Estado CRM consistente | W4 |
| AG-02 | Google | Reconciliação Google ↔ CRM | P0 | Integration | Idempotência, sem duplicação | W4 |
| AG-03 | Meet | Criar e entregar Meet | P0 | Integration | Link único, retry seguro | W4 |
| AG-04 | Attendance | Presença/no-show | P1 | Integration | Status coerente após eventos | W4 |
| CRM-01 | Products | Catálogo/importação | P1 | E2E | Produtos persistem por tenant | W5 |
| CRM-02 | Contacts | Custom fields | P1 | E2E | CRUD sem quebra de isolamento | W5 |
| CRM-03 | Contacts | Merge duplicados | P0 | Integration + DB | Sem perda/referência órfã | W5 |
| CRM-04 | Pipeline | Bulk move | P1 | Integration | Posições não colidem | W5 |
| TASK-01 | Tasks | Criar/editar/concluir tarefa | P1 | E2E | Lifecycle correto | W5 |
| ADS-01 | Meta Ads | Leitura/analytics | P1 | Integration | Tenant e credenciais corretos | W5 |
| ADS-02 | Conversions | Enviar conversão | P1 | Integration | Deduplicação e auditoria | W5 |
| NAV-01 | Navigation | Nuvemshop | P1 | Unit | Integração existe; não aparece no sidebar | W6 |
| UI-01 | Branding | Tema Aurum | P1 | Visual regression | Tokens/logo Aurum preservados | W6 |
| BUILD-01 | Delivery | Frozen install/typecheck/lint/build | P0 | CI | Todos verdes no mesmo commit | W7 |
| MIG-01 | Database | Fresh migration | P0 | DB | 213 migrations aplicam em banco vazio | Hardening |
| MIG-02 | Database | Upgrade migration | P0 | DB | 185→213 em clone do banco real | Hardening |
| REC-01 | Recovery | Backup/restore | P0 | DR drill | Restore funcional dentro do objetivo acordado | Hardening |
| ROL-01 | Rollback | Rollback aplicação | P0 | Release drill | Versão anterior volta sem corrupção | Hardening |
