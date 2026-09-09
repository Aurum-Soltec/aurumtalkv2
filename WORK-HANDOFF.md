# WORK-HANDOFF — IMOBI CRM / imobitalk

## Objetivo desta sessão no ChatGPT Work

Finalizar o fork IMOBI CRM e preparar o repositório `hudsonlcustodio/imobitalk`
para staging e produção sem reescrever a base funcional herdada.

## Estado atual

- Produto/branding: **IMOBI CRM**
- Repositório alvo: `https://github.com/hudsonlcustodio/imobitalk`
- Estratégia: fork controlado, mínimo delta estrutural, máxima separação de branding.
- Backend/DB/contratos legados foram preservados quando renomeá-los poderia quebrar compatibilidade.
- Frontend já recebeu a identidade IMOBI: logo, Poppins, paleta e metadata.
- Referências visíveis a Deskcomm foram removidas das superfícies de frontend auditadas.
- O pacote inclui o Production Readiness Pass executado antes deste handoff.

## Identidade visual aprovada

- Roxo principal: `#7B3FA4`
- Roxo escuro: `#5E2D83`
- Lilás: `#D8C2E8`
- Laranja: `#F57C00`
- Grafite: `#4A4A4A`
- Branco: `#FFFFFF`
- Tipografia: **Poppins**
- Logo principal: `public/imobi-logo.png`

## Artefatos de readiness já existentes

Leia primeiro:
1. `PRODUCTION-READINESS.md`
2. `PRODUCTION-READINESS-EVIDENCE.json`
3. `DEPLOYMENT-IMOBI.md`
4. `SECURITY-CHECKLIST-IMOBI.md`
5. `RUNBOOK-IMOBI.md`
6. `IMOBI-BRANDING-CHANGELOG.md`

## Regras para continuar no Work

1. Não fazer rewrite do projeto.
2. Não renomear identificadores internos/DB/protocolos legados só por branding.
3. Preservar contratos como headers/cookies legados quando houver risco de breaking change.
4. Mudanças no frontend devem usar tokens/design system, não cores espalhadas.
5. Não colocar secrets reais no repositório.
6. Antes de produção, exigir CI verde, migrations verificadas, staging, smoke e restore testado.
7. Se encontrar `Deskcomm`:
   - remover se for conteúdo visível ao usuário;
   - preservar/documentar se for contrato técnico ou compatibilidade interna.
8. Não declarar production-ready sem evidência.

## Próxima sequência recomendada no Work

1. Instalar dependências com o package manager definido pelo lockfile.
2. Executar typecheck, lint, unit/integration tests e build.
3. Corrigir falhas sem alterar contratos desnecessariamente.
4. Executar auditoria final de referências visíveis a Deskcomm.
5. Revisar GitHub Actions para o repositório `hudsonlcustodio/imobitalk`.
6. Configurar secrets/variables no GitHub sem commitá-los.
7. Criar staging.
8. Rodar `db:migrate:check` antes da migration real.
9. Validar RLS/multi-tenancy.
10. Build/start das imagens de app, worker e scheduler.
11. Smoke das jornadas críticas.
12. Validar backup + restore.
13. Registrar evidências em `PRODUCTION-READINESS-EVIDENCE.json`.
14. Somente então promover `GATE-PROD` para `passed`.

## Gaps externos esperados

Dependem do ambiente real e não devem ser inventados:
- Supabase/Postgres real
- Redis
- WAHA/WhatsApp/Meta
- Sentry (opcional)
- DNS/TLS
- registry/GHCR
- secrets de produção
- restore testado
- volume/capacidade real
- RTO/RPO aprovados pelo negócio

## Critério de saída do Work

Gerar uma versão pronta para push no GitHub, com:
- CI executável;
- build verde;
- testes relevantes verdes;
- nenhuma credencial commitada;
- deployment documentado;
- gaps externos explicitamente marcados;
- changelog e evidências atualizados.
