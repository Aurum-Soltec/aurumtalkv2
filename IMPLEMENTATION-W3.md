# IMPLEMENTATION W3 — IA / Agents / Workers / Atendimento

Baseline: Aurum W1-W2 + DeskcommCRM v1.17.0

- Arquivos W3 copiados do upstream: **388**
- Arquivos divergentes do fork com sinais de handoff humano: **40**
- Caminhos explicitamente associados por artefatos `.changes`: **0**

## Estratégia

A v1.17.0 é a base de W3. A proteção Aurum contra resposta automática após handoff humano não foi sobrescrita cegamente: divergências foram registradas para reconciliação semântica. Nenhum comportamento de segurança foi declarado validado sem runtime tests.

## Candidatos de reconciliação

- `workers/ai-handoff-from-sentiment.handler.ts`
- `workers/ai-response-worker.ts`
- `workers/agent-worker/main.ts`
- `lib/ai/pacing-knobs.ts`
- `lib/ai/guardrails-schema.ts`
- `lib/ai/types.ts`
- `lib/ai/agent-inbox-copy.ts`
- `lib/ai/gateway-binding.ts`
- `lib/agent-engine/env.ts`
- `lib/agent-engine/flywheel/live.ts`
- `lib/agent-engine/guardrails/before-send.ts`
- `lib/agent-engine/cron/scheduler.ts`
- `lib/agent-engine/db/repository.ts`
- `lib/agent-engine/agent/aviso-de-escalacao.ts`
- `lib/agent-engine/agent/human-handoff.ts`
- `lib/agent-engine/agent/agent-config.ts`
- `lib/agent-engine/agent/followup-turn.ts`
- `lib/agent-engine/agent/operator-turn.ts`
- `lib/agent-engine/agent/stage-classifier.ts`
- `lib/agent-engine/agent/split-message.ts`
- `lib/agent-engine/agent/draft-reply.ts`
- `lib/agent-engine/agent/inbound-turn.ts`
- `lib/agent-engine/agent/human-cases.ts`
- `lib/agent-engine/agent/compaction.ts`
- `lib/agent-engine/queue/queue.ts`
- `lib/agent-engine/edge/llm/run-model-call.ts`
- `lib/agent-engine/edge/crm/drain.ts`
- `lib/agent-engine/edge/crm/get-lead-context.ts`
- `lib/agent-engine/edge/crm/drain.test.ts`
- `lib/agent-engine/edge/crm/session-reconciler.test.ts`
- `lib/agent-engine/edge/crm/mcp-tools.ts`
- `lib/ai/handoff/orchestrator.ts`
- `lib/ai/handoff/aviso-ao-lead.ts`
- `lib/ai/agents/org-tem-automatico.ts`
- `lib/ai/agents/no-ar.ts`
- `lib/ai/agents/duplicate.ts`
- `lib/ai/agents/validation.ts`
- `lib/ai/runtime/mcp_token.ts`
- `lib/ai/runtime/agent.ts`
- `lib/ai/pontos/registro.ts`

## Gates
- GATE-W3-CODE: implementation-in-progress
- GATE-W3-HANDOFF: blocked até reconciliação semântica + teste
- GATE-PROD: blocked

## Reconciliação crítica concluída

Foi detectado **DRIFT reverso**: o snapshot Aurum contém uma camada `lib/atendimento/*` e integrações de service-boundary/handoff mais novas do que a tag Deskcomm v1.17.0. Substituí-las pelo upstream regrediria controles de atendimento.

**Decisão:** preservar a camada Aurum de fronteira de atendimento e 14 arquivos diretamente acoplados a ela, enquanto as demais evoluções W3 da v1.17.0 permanecem incorporadas.

Isso preserva, entre outros controles:
- bloqueio de turno quando lead está em handoff humano;
- `force_human` / silêncio / ownership humano;
- service boundary por mensagem/job;
- proteção do worker legado;
- elegibilidade antes de bot→humano;
- operação/pause do agente;
- recusa de follow-up quando regras de atendimento vetam o envio.

### Import scan
Referências locais não resolvidas detectadas na árvore: **28**. Elas precisam ser comparadas com o baseline W1-W2 para separar dívida pré-existente de regressão W3.
