import type { SupabaseClient } from "@supabase/supabase-js";

import { sendMessageHandler } from "@/app/api/v1/messages/_handler";
import { ApiError } from "@/lib/api/types";
import { ensureConversation, sessaoProntaParaEnvio } from "@/lib/automation/start-conversation";
import { createSupabaseAdminClient, type FollowupJobRequest } from "@/lib/followup/engine";
import type { EnrollmentRow } from "@/lib/followup/node-handlers";
import { completeTurnForEnrollment, type TurnBridgeAdminClient } from "@/lib/followup/turn-bridge";
import { logger } from "@/lib/logger";
import { assertAgendaEffectSupabase } from "@/lib/agenda/efeito";
import { randomUUID } from "node:crypto";
import { sendWithLedger, supabaseSendLedger } from "@/lib/agent-engine/edge/crm/send-ledger";
import { parseServiceBoundary } from "@/lib/atendimento/fronteira";
import type { JobStatus } from "@/lib/agent-engine/queue/queue";

function ponteSupabase(admin: SupabaseClient): TurnBridgeAdminClient {
  const base = createSupabaseAdminClient(admin);
  return {
    ...base,
    async applyEnrollmentStep(orgId, id, revision, patch, event) {
      const { error } = await admin.rpc("fn_followup_apply_step", {
        p_org: orgId, p_id: id, p_revision: revision, p_patch: patch, p_event: event,
      });
      if (error) throw error;
    },
    async loadEnrollmentById(orgId, id) {
      const { data, error } = await admin
        .from("followup_enrollments")
        .select("*")
        .eq("id", id)
        .eq("organization_id", orgId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      return data as EnrollmentRow;
    },
  };
}

/** Envia o texto fixo do fluxo neste request — sem cron e sem agent-worker. */
export async function enviarTextoFixoPendente(
  admin: SupabaseClient,
  somenteContactIds?: string[],
): Promise<number> {
  let query = admin
    .from("job_queue")
    .select("id, organization_id, contact_id, payload")
    .eq("kind", "followup_turn")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (somenteContactIds) {
    if (!somenteContactIds.length) return 0;
    query = query.in("contact_id", somenteContactIds);
  }
  const { data: jobs, error } = await query.limit(5);
  if (error) throw new Error(error.message);

  let enviados = 0;
  const ponte = ponteSupabase(admin);
  for (const job of jobs ?? []) {
    const payload = (job.payload ?? {}) as FollowupJobRequest["payload"];
    const body = payload.fixed_body;
    const enrollmentId = payload.followup_enrollment_id;
    const nodeId = payload.node_id;
    const contactId = job.contact_id as string | null;
    if (typeof body !== "string" || !body || !enrollmentId || !nodeId || !contactId) continue;
    if (somenteContactIds && !somenteContactIds.includes(contactId)) continue;

    const worker = `inline:${randomUUID()}`;
    const { data: claimed, error: claimErr } = await admin
      .from("job_queue")
      .update({ status: "running", locked_by: worker, locked_at: new Date().toISOString() })
      .eq("organization_id", job.organization_id)
      .eq("id", job.id)
      .eq("status", "pending")
      .select("id,locked_at")
      .maybeSingle();
    if (claimErr) throw new Error(claimErr.message);
    if (!claimed) continue;
    const jobClaim = { worker_id: worker, acquired_at: claimed.locked_at as string };
    const updateJob = async (values: { status: JobStatus; last_error?: string | null }) => {
      const result = await admin.from("job_queue")
      .update({ ...values, locked_by: null, locked_at: null })
      .eq("organization_id", job.organization_id).eq("id", job.id)
      .eq("status", "running").eq("locked_by", worker).eq("locked_at", jobClaim.acquired_at);
      if (result.error) throw new Error(result.error.message);
      return result;
    };

    try {
      const { data: enr } = await admin
        .from("followup_enrollments")
        .select("current_node_id")
        .eq("id", enrollmentId)
        .eq("organization_id", job.organization_id as string)
        .maybeSingle();
      if (!enr || enr.current_node_id !== nodeId) {
        await updateJob({ status: "done" });
        continue;
      }
      const sessionId = await sessaoProntaParaEnvio(admin, job.organization_id as string);
      if (!sessionId) {
        logger.warn("[dev.pipeline] sem sessão de canal — job volta pra pending");
        await updateJob({ status: "pending" });
        continue;
      }
      const conversationId = await ensureConversation(
        admin,
        job.organization_id as string,
        contactId,
        sessionId,
      );
      // O estado pode mudar entre o tick e a entrega. Confere de novo no
      // último ponto reversível para uma remarcação/resposta nunca receber uma
      // cobrança preparada antes dela.
      await assertAgendaEffectSupabase(admin, {
        organizationId: job.organization_id as string,
        contactId,
        enrollmentId,
        nodeId,
        jobId: job.id,
        jobClaim,
      });
      const outcome = await sendWithLedger(supabaseSendLedger(admin), {
        tenantId: job.organization_id, leadId: contactId, jobId: job.id, seq: 1, body,
      }, (key, messageId) => sendMessageHandler(
        admin,
        {
          organization_id: job.organization_id as string,
          actor: { type: "webhook_source", id: enrollmentId },
          requestId: key,
          internalMessageId: messageId,
          ...(payload.service_boundary ? { serviceBoundary: parseServiceBoundary(payload.service_boundary) } : {}),
          proactiveContext: { organizationId: job.organization_id, contactId, enrollmentId,
            nodeId, jobId: job.id, jobClaim },
        },
        { conversation_id: conversationId, type: "text", body, metadata: { idempotency_key: key } },
      ));
      if (outcome.kind !== "sent" && outcome.kind !== "already_sent") {
        await updateJob({ status: outcome.kind === "blocked" ? "failed" : "pending",
          last_error: `followup_send_${outcome.kind}` });
        continue;
      }
      enviados++;
      try {
        await completeTurnForEnrollment(ponte, job.organization_id as string, enrollmentId, nodeId, {
          kind: "sent",
        }, undefined, job.id, jobClaim);
      } catch (err) {
        logger.warn("[dev.pipeline] completeTurn apos envio", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
      await updateJob({ status: "done", last_error: null });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : String(err);
      logger.warn("[dev.pipeline] envio inline falhou", { error: message });
      await updateJob({ status: "pending", last_error: message.slice(0, 300) });
    }
  }
  return enviados;
}
