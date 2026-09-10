import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ambiente E2E de suporte", () => {
  it("gera uma chave de assinatura própria sem depender de secrets de produção", () => {
    const script = readFileSync("scripts/gerar-env-e2e.sh", "utf8");
    expect(script).toContain("IMPERSONATE_COOKIE_SECRET=$(openssl rand -hex 32)");
  });
});
