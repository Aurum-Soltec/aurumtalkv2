# PROJECT-STATE — AurumTalk

Data: 2026-09-10

Branch: `main`

Commit inicial desta RC Closure: `d8ee83562f09bc57206c0e1e41d5e3090fdd2870`

Status: **RC_VALIDATION_BLOCKED**

## Estado comprovado

- O checkout local parte da `main` limpa e alinhada com a `main` remota em
  `238ff481e0c1ec324de8a46dbdcaef8835a94c94`.
- O contrato documental ativo aponta para
  `https://github.com/Aurum-Soltec/aurumtalkv2`, Tailwind 4 e as três imagens
  `imobi-crm`, `imobi-worker` e `imobi-scheduler`.
- A suíte unitária completa passou: 652 arquivos, 7.088 testes aprovados e 1
  falha esperada, em 7.089 testes.
- `typecheck`, `lint`, `verify:upgrade-v1.17` e `build` passaram.
- O lint permanece com 313 avisos e 0 erros; são dívida técnica pré-existente,
  sem correção ampla nesta RC.
- O daemon Docker está disponível. O baseline instala e atualiza sem erro, mas
  o gate de invariantes encontrou falhas reais de LGPD, RLS, grants, agenda,
  ciclo de demanda e webhook; isso não é PASS.
- O último run E2E concluído (`3ef20c1`) executou as três partes e terminou com
  21 casos falhos. O run do commit atual ainda está em andamento.
- A consulta remota encontrou dois PRs abertos do Dependabot (#1 e #2); não
  foram mesclados nem alterados.
- O primeiro run encontrou a action local `preparar-node` ausente; ela foi
  restaurada no follow-up de CI. O commit atual também corrigiu o lint Linux,
  os stubs de autenticação do harness de banco e um caminho quebrado de fixture
  E2E. O workflow `release` continua exigindo o segredo externo
  `RELEASE_APP_ID`, que não está configurado neste repositório.

## Decisões desta RC Closure

- Não há feature nova, atualização de dependência, tag ou release.
- A correção inclui drift de contrato da API, tokens de marca, cobertura i18n,
  navegação, workflow E2E/publicação, documentação de setup e testes que ainda
  modelavam o handler antigo.
- Referências históricas a DeskcommCRM foram preservadas quando são parte de
  contrato técnico, auditoria ou contexto histórico; superfícies atuais de
  instalação e publicação apontam para AurumTalk/Aurum-Soltec.
- O commit final deve usar a mensagem
  `fix(rc): close validation drift and regression gaps` e ser enviado para
  `main` sem criar tag.

## Gatilho para liberar a RC

Corrigir as falhas de invariantes e E2E, confirmar os checks da Actions no
commit atual e só então reavaliar `RC_VALIDATED`. A publicação da release ainda
depende de o mantenedor configurar os segredos externos.
