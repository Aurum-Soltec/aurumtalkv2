# IMOBI CRM — Security Checklist

## Antes do deploy

- [ ] GitHub Actions CI verde.
- [ ] `security / dependency-audit` verde.
- [ ] `security / codeql` sem alerta alto/crítico não aceito.
- [ ] Nenhum `.env`, token, API key ou dump no git.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` somente server-side.
- [ ] `SUPABASE_DB_ADMIN_URL` somente em migration/backup tooling.
- [ ] INTERNAL_SECRET e chaves criptográficas geradas aleatoriamente.
- [ ] MFA nos administradores do Supabase/GitHub/provedor cloud.
- [ ] RLS/invariants verdes.
- [ ] WAHA dashboard não publicado.
- [ ] Redis/SRH/WAHA não expostos diretamente à internet.
- [ ] TLS válido.
- [ ] Sentry usa DSN da própria operação ou permanece explicitamente desligado.
- [ ] Redaction de PII confirmada nos logs/Sentry.
- [ ] Backup cifrado/protegido e restore testado.
- [ ] Branch protection/ruleset exige CI, imagens e security gates.
- [ ] GHCR das imagens de produção pertence ao fork IMOBI.

## Controles que exigem ambiente real

Pentest, rate-limit sob IP/proxy real, headers no CDN/reverse proxy, isolamento de rede,
restore, rotação de secrets e alertas só podem ser validados no ambiente implantado.
