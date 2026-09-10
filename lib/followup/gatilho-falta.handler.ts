import type { EventHandler, HandlerResult } from "@/lib/event-log/dispatcher";
import { createAdminClient } from "@/lib/supabase/admin";

export const FOLLOWUP_GATILHO_FALTA_HANDLER_KEY = "followup-appointment-no-show.v1";

export const followupGatilhoFaltaHandler: EventHandler = {
  key: FOLLOWUP_GATILHO_FALTA_HANDLER_KEY,
  events: ["appointment.outcome_confirmed"],
  async handle(row): Promise<HandlerResult> {
    // A função do banco é a autoridade: ela confere o compromisso, o desfecho,
    // a configuração vigente e a idempotência pelo próprio event_log.
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("fn_appointment_recover", {
      p_org: row.organization_id,
      p_event: row.id,
    });
    if (error) {
      return {
        consumer_key: FOLLOWUP_GATILHO_FALTA_HANDLER_KEY,
        status: "error",
        detail: error.message,
      };
    }
    const result = (data as { result?: string } | null)?.result ?? "unknown";
    return {
      consumer_key: FOLLOWUP_GATILHO_FALTA_HANDLER_KEY,
      status: "ok",
      detail: `result=${result}`,
    };
  },
};
