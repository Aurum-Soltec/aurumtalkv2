# MIGRATION RUNBOOK — Aurum Talk → DeskcommCRM v1.17.0 lineage

## Estado verificado
- histórico Aurum original: **185 migrations SQL**;
- árvore hardened: **213 migrations SQL**;
- migrations antigas alteradas: **0**;
- migrations novas: **28**.

Para banco existente, aplicar migrations incrementais. **Não substituir banco existente por `baseline.sql`.**
`baseline.sql` é referência para instalação nova.

## Pré-condições
1. backup lógico completo e snapshot/backup gerenciado do banco;
2. restore testado em ambiente isolado;
3. `SUPABASE_DB_ADMIN_URL` apontando para conexão PostgreSQL com DDL;
4. versão da aplicação atual identificada e artefato anterior disponível para rollback;
5. workers/schedulers com plano explícito de pausa durante cutover;
6. janela e owner definidos;
7. banco-clone/staging executado antes de produção.

## Fresh install
1. provisionar banco vazio compatível;
2. configurar secrets mínimos;
3. executar `pnpm db:migrate:check`;
4. executar `pnpm db:migrate`;
5. rodar invariants/RLS;
6. iniciar app/worker/scheduler;
7. smoke de auth, tenant, IA, agenda e CRM.

## Upgrade de banco Aurum existente
1. clonar/restaurar backup recente para staging;
2. executar `pnpm db:migrate:check`;
3. confirmar que o plano contém somente migrations ainda não aplicadas;
4. executar `pnpm db:migrate`;
5. verificar tabela de histórico de migrations;
6. executar testes DB/RLS/invariants;
7. smoke do app e workers contra o clone;
8. só então repetir em produção.

## Cutover recomendado
1. bloquear novas alterações administrativas sensíveis;
2. pausar scheduler/workers que possam concorrer com DDL ou novos contratos;
3. capturar backup imediatamente pré-migração;
4. executar dry-run;
5. aplicar migrations;
6. executar checks pós-migração;
7. subir app hardened;
8. liberar workers/scheduler progressivamente;
9. observar erro, latência, fila, handoff, agenda e autenticação;
10. encerrar janela apenas após smoke e métricas estáveis.

## Pós-migração obrigatório
- tenant isolation / RLS;
- criação e troca de organização;
- convite e membership;
- suporte temporário;
- handoff humano sem resposta posterior do bot;
- agenda + Google reconciliation + Meet;
- catálogo, tarefas, custom fields, merge;
- Meta Ads/conversões;
- worker/scheduler sem backlog anormal.

## Migrations novas
- `20260901120000_0204_catalogo_de_produtos_da_loja.sql`
- `20260902020000_0205_um_agente_indexa_mais_de_um_material.sql`
- `20260903000000_0206_contact_ai_authorization.sql`
- `20260903143000_0210_tarefas_do_crm.sql`
- `20260903210000_0207_credenciais_de_ia_voltam_a_ser_lidas_por_manager.sql`
- `20260903230000_0211_contact_custom_fields.sql`
- `20260904000000_0208_moeda_da_organizacao.sql`
- `20260904011000_0209_mover_em_lote_sem_colidir_posicao.sql`
- `20260904050000_0212_o_email_do_convidado.sql`
- `20260904051000_0213_conversoes_de_anuncio.sql`
- `20260904052000_0214_leitura_de_anuncios.sql`
- `20260904190000_0215_juntar_contatos_duplicados.sql`
- `20260904210000_0216_agent_inbox_items_resolved_at.sql`
- `20260904220000_0217_relatorio_de_atividades.sql`
- `20260905120000_0231_organizacao_e_acesso_atomicos.sql`
- `20260905150000_0219_recibo_de_criacao_confiavel.sql`
- `20260905160000_0218_configuracao_pre_go_live_atomica.sql`
- `20260905210000_0220_suporte_temporario_por_sessao.sql`
- `20260906010000_0221_interface_por_vinculo.sql`
- `20260906020000_0222_fronteira_do_atendimento.sql`
- `20260906030000_0223_origem_imutavel_do_evento.sql`
- `20260906120000_0224_presenca_e_recuperacao.sql`
- `20260907010000_0225_google_reconciliacao.sql`
- `20260907020000_0226_meet_e_entrega_transacional.sql`
- `20260907030000_0227_autonomia_e_respostas_revisadas.sql`
- `20260907040000_0228_roteamento_por_canal_e_reservas.sql`
- `20260907050000_0229_mfa_e_lgpd_agenda.sql`
- `20260907060000_0230_reserva_pre_go_live.sql`

## Rollback de schema
Não assumir que migration SQL é automaticamente reversível. Antes da produção:
- classificar cada migration nova como additive / data-transform / destructive;
- para mudanças não reversíveis, rollback é **restore do backup + aplicação anterior**, não `down migration` inventada;
- qualquer migration que modifique dados deve ter validação de integridade e estratégia de recuperação testada.
