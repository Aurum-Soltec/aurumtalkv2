# Controles de edição do fluxo de follow-up

O box selecionado oferece **Excluir box** (remove também as conexões incidentes)
e **Desconectar box** (mantém o box). Selecionar a linha oferece **Remover conexão**,
preservando origem e destino. **Desfazer ação** restaura o grafo anterior nesta
sessão, incluindo as conexões de um box excluído. Guarda até 100 estados; o
histórico termina ao sair do editor. Não desfaz publicação nem execução do fluxo.

As opções da linha são derivadas de `nodeBranches` no box de origem. O caminho
Sempre não cadastra uma regra nova; as regras/classes/respostas são configuradas
no box e fornecem as saídas que o painel da conexão oferece.

## Prova reproduzível

`tests/e2e/followup-builder.spec.ts`, grupo **controles reversíveis do editor**,
exercita o frontend com uma conta manager local: exclusão com conexões, desfazer,
desconexão do box, remoção de uma linha, edição da duração, adição após reabrir,
salvar/recarregar e visibilidade dos botões em viewport desktop e mobile.
O grupo usa um fluxo descartável próprio e o remove ao terminar.

Prova local em 2026-09-11: **PASS**, Chromium, build de produção com Supabase
local. Foram inspecionadas as capturas descartáveis geradas pelo teste em 1600×900
e 390×844. As asserções `toBeInViewport` cobrem a presença real dos botões no painel.

## Living System Checklist

- Entrada: seleção e edição no `FlowCanvas`; saída: `liveGraph` entregue à `PublishBar`.
- Registro: salvar/publicar continuam pelas rotas existentes de `followup-flows`, com auditoria existente. Edição ainda não salva é estado local, sem efeito no motor.
- Visibilidade e porta: painel do box/linha e botão Desfazer em `/app/ai/followups/[id]`, acessível pela lista de Follow-ups.
- Configuração: formulários existentes; remoção e recuperação ficam explícitas no painel.
- Anti-morte: validação de publicação existente continua responsável por conexões obrigatórias. Editar rascunho não altera enrollments em execução.
- Continuidade IA/humano: política de handoff existente permanece na `PublishBar`, fora do histórico do grafo.
- Retorno: exclusão/desconexão incorreta pode ser revertida; erro de publicação continua marcado no box por `markNodeErrors`.
- Mapa: nenhum serviço, rota ou consumidor novo; ampliação da mesma superfície de edição e persistência.
