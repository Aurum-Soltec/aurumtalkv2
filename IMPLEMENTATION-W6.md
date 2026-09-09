# IMPLEMENTATION W6 — Frontend / Toolchain / Navegação / Tailwind 4

Baseline: Aurum W1-W2-W3-W4-W5 + DeskcommCRM v1.17.0

## Implementado
- alinhamento de Next/Supabase/AI SDK e dependências estruturais;
- segurança de `pnpm.overrides` reconciliada com floors upstream;
- migração de PostCSS/Tailwind 3 → Tailwind 4;
- `app/globals.css` baseado na infraestrutura upstream, preservando tokens `:root` e `.dark` do Aurum;
- remoção do `autoprefixer`;
- preservação do antigo `tailwind.config.ts` como evidência quando não mais ativo;
- nova navegação/shell da v1.17;
- atualização de Next/ESLint/TypeScript configs conforme baseline upstream;
- preservação explícita do branding Aurum como requisito.

## Dependências
Decisões registradas em `W6-MANIFEST.json`.

## Branding
Artefatos originais e upstream foram salvos em `evidence/w6-branding/` para auditoria.
O CSS global usa a infraestrutura Tailwind 4 da v1.17 com os blocos de tokens de tema do Aurum reinjetados.

## Navegação
- Arquivos de navegação/shell copiados do upstream: **15**
- Arquivos com referência textual a Nuvemshop após merge: **1**
Essas ocorrências exigem revisão apenas se representarem item visível; integração técnica não deve ser removida.

## Validação estrutural
- Imports locais não resolvidos: **3**
- Lockfile adotado do upstream como baseline, mas `pnpm install --frozen-lockfile` ainda é gate obrigatório porque o `package.json` foi reconciliado, não copiado integralmente.

## Gates
- GATE-W6-TOOLCHAIN: implementation-complete
- GATE-W6-BRANDING: conditional-pass
- GATE-W6-NAVIGATION: conditional-pass
- GATE-W6-LOCKFILE: blocked até pnpm install --frozen-lockfile
- GATE-RUNTIME: blocked
- GATE-PROD: blocked

## Fechamento do lockfile e navegação

O check estático do importer do `pnpm-lock.yaml` contra todas as dependências diretas do `package.json` terminou com:

- dependências ausentes no lock: **0**
- specifiers divergentes: **0**
- resultado: **PASS**

Para obter essa reprodutibilidade, `@ai-sdk/anthropic`, `@ai-sdk/google` e `@testing-library/user-event` foram alinhados ao conjunto testado/travado pela v1.17.0. As versões mais novas que existiam no fork devem ser avaliadas depois como upgrade independente, com evals/regressão.

A entrada Nuvemshop permanece no catálogo como destino técnico, mas sem `sidebar: true`: **FAIL**. Assim, a integração continua acessível por mecanismo deliberado sem reaparecer no menu lateral.

`pnpm install --frozen-lockfile` ainda precisa ser executado em ambiente com registry para transformar este static-pass em evidência runtime.

Correção da evidência: o primeiro detector contou `sidebar: true` dentro de comentário. Rechecagem ignorando comentários: **PASS** — a propriedade ativa não existe no objeto Nuvemshop.
