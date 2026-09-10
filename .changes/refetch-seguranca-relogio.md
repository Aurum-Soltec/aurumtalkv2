---
impacto: nada_mudou
secao: corrigido
titulo: A verificação de atualização continua mesmo quando a tela redesenha
---

A verificação de segurança de quadros e conversas não reinicia mais seu prazo
quando a tela redesenha mantendo a mesma consulta. Isso evita adiar a recuperação
de atualizações que não chegaram pelo canal em tempo real.

Os canais aguardam a autenticação antes da assinatura inicial. O envio imediato
de acompanhamentos compartilha o registro de entrega do worker e conclui o passo
e seu histórico em uma única operação, permitindo recuperar uma falha sem repetir
a mensagem já aceita pelo canal.

A entrada do aplicativo respeita os destinos configurados para o membro.
O início do suporte oferece o modo somente leitura e avisa as outras abas
para que atualizem o contexto da organização acompanhada.
