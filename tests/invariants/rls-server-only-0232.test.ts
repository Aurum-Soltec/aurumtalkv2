import { describe, expect, it } from "vitest";

import { GOV_AGENT_A, sql } from "./gov-helpers";

const TABELAS_SERVER_ONLY_0232 = [
  "ad_conversion_dispatches",
  "ad_insights_connections",
  "ad_platform_connections",
  "appointment_recovery_receipts",
  "channel_connection_requests",
  "event_service_origins",
  "platform_support_sessions",
] as const;

describe("RLS: tabelas internas da leva 0204–0228 não atravessam a Data API", () => {
  it.each(TABELAS_SERVER_ONLY_0232)("authenticated não tem nenhum DML em %s", (tabela) => {
    const privileges = sql(`
      set role authenticated;
      select set_config('request.jwt.claims','{"sub":"${GOV_AGENT_A}"}',false);
      select concat_ws('|',
        has_table_privilege('authenticated','public.${tabela}','SELECT'),
        has_table_privilege('authenticated','public.${tabela}','INSERT'),
        has_table_privilege('authenticated','public.${tabela}','UPDATE'),
        has_table_privilege('authenticated','public.${tabela}','DELETE'));
    `).split("\n").at(-1);

    expect(privileges).toBe("f|f|f|f");
  });
});
