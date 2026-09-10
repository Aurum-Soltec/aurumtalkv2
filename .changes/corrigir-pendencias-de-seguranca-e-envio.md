---
impacto: nada_mudou
secao: corrigido
titulo: Envios, isolamento de dados e anonimização ficaram mais seguros
---

O envio de mensagens agora repete as proteções de bloqueio imediatamente antes
de chamar o provedor, inclusive nos avisos de Google Meet enviados por uma
pessoa. Tentativas repetidas também reaproveitam o mesmo registro interno, sem
duplicar a mensagem enquanto aguardam nova tentativa.

A verificação de isolamento entre organizações passou a cobrir as tabelas que
faltavam, incluindo superfícies internas que não podem ser acessadas pela sessão
comum. A anonimização LGPD também remove texto pessoal de rascunhos de resposta
e tarefas do CRM, preservando a porta administrativa existente e suas regras de
papel, organização, suporte e MFA.

Operações administrativas e de configuração também passam a respeitar o modo
de acompanhamento somente leitura antes de qualquer gravação. As verificações
de PDF e de cobertura dessas rotas agora funcionam igual no Windows e no Linux,
evitando um resultado local verde que falhe apenas no servidor de integração.
Os cenários visuais também voltaram a limpar a preferência de tema pela chave
atual e a reconhecer o gatilho de falta da Agenda, mantendo o E2E alinhado às
capacidades que a própria interface oferece.
