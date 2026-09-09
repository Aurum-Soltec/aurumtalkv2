import { describe, expect, it } from "vitest";
import { resolveSentryDsn, isCommunityDsn } from "@/lib/sentry/dsn";

describe("telemetria IMOBI é opt-in", () => {
  it.each([undefined, null, "", " ", "off", "false", "0"])(
    "não envia nada quando SENTRY_DSN=%s",
    (value) => {
      expect(resolveSentryDsn(value)).toBeUndefined();
    },
  );

  it("usa somente o DSN explicitamente configurado pelo operador", () => {
    const dsn = "https://public@example.ingest.sentry.io/123";
    expect(resolveSentryDsn(dsn)).toBe(dsn);
  });

  it("não existe DSN comunitário/upstream implícito", () => {
    expect(isCommunityDsn(resolveSentryDsn(""))).toBe(false);
  });
});
