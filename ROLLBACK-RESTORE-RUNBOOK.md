# ROLLBACK & RESTORE RUNBOOK

## Princípio
Rollback de aplicação e recovery de dados são mecanismos diferentes.
`rollback` não corrige schema/data incompatível; `backup` sem restore testado não é recovery.

## Gatilhos de rollback imediato
- falha de tenant isolation/RLS;
- autenticação/organização indisponível;
- bot respondendo após handoff humano;
- corrupção/duplicação material em agenda;
- erro sustentado de migrations;
- fila crescendo sem consumo seguro;
- incompatibilidade que impeça operação essencial.

## Rollback da aplicação
1. congelar novas mudanças;
2. pausar workers/schedulers quando necessário;
3. registrar commit/image/config atualmente ativos;
4. reimplantar o artefato anterior conhecido;
5. restaurar configuração compatível;
6. executar smoke mínimo;
7. verificar filas/eventos pendentes antes de reativar consumers;
8. registrar incidente e decisão.

## Quando rollback da aplicação NÃO basta
Se schema/data novos não forem compatíveis com a versão anterior:
1. manter writers pausados;
2. selecionar backup pré-cutover;
3. restaurar em ambiente isolado;
4. validar integridade e acesso;
5. apontar aplicação anterior para banco restaurado somente após aprovação;
6. preservar banco pós-falha para análise forense.

## Restore drill obrigatório
O drill deve provar:
- backup pode ser localizado e descriptografado;
- restore conclui;
- aplicação conecta;
- auth/tenant funcionam;
- contagens e relações críticas são plausíveis;
- eventos/filas não são duplicados inadvertidamente;
- owner sabe executar o procedimento.

## Evidência a registrar
- timestamp;
- owner;
- backup/snapshot ID;
- commit/image antes/depois;
- duração de restore;
- checks executados;
- divergências;
- decisão go/no-go.

## RTO/RPO
Não inventados neste projeto. Devem ser aprovados a partir do impacto de negócio antes do gate de produção.
