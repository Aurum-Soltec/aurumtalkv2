import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = process.cwd();
const COMPOSE = fs.readFileSync(path.join(RAIZ, "docker-compose.prod.yml"), "utf8");
const PUBLICA = fs.readFileSync(path.join(RAIZ, ".github/workflows/publish-image.yml"), "utf8");
const ENV_EXEMPLO = fs.readFileSync(path.join(RAIZ, ".env.hostgator.example"), "utf8");
const COMUM = fs.readFileSync(path.join(RAIZ, "hostgator-setup-kit/_common.sh"), "utf8");

describe("fork IMOBI publica e consome seus próprios artefatos", () => {
  it("o compose de produção não possui fallback para imagens do upstream", () => {
    expect(COMPOSE).not.toMatch(
      /ghcr\.io\/melgarafael|deskcommcrm:stable|deskcomm-worker|deskcomm-scheduler/i,
    );
    for (const key of ["APP_IMAGE", "WORKER_IMAGE", "SCHEDULER_IMAGE"]) {
      expect(COMPOSE).toContain(`\${${key}:?`);
    }
  });

  it("o workflow publica as três imagens IMOBI no owner do próprio repositório", () => {
    expect(PUBLICA).toContain(
      "images: ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ matrix.name }}",
    );
    const nomes = [...PUBLICA.matchAll(/^\s{10}- name: (\S+)$/gm)].map((m) => m[1]).sort();
    expect(nomes).toEqual(["imobi-crm", "imobi-scheduler", "imobi-worker"]);
  });

  it("o template de produção não aponta para o upstream Deskcomm", () => {
    expect(ENV_EXEMPLO).not.toMatch(/ghcr\.io\/melgarafael/i);
    expect(ENV_EXEMPLO).toContain("ghcr.io/hudsonlcustodio/imobi-crm:stable");
  });

  it("o kit deriva o namespace do fork e usa os mesmos nomes", () => {
    expect(COMUM).toContain("IMOBI_GHCR_OWNER");
    expect(COMUM).toContain('IMG_APP="${IMG_NS}/imobi-crm"');
    expect(COMUM).toContain('IMG_WORKER="${IMG_NS}/imobi-worker"');
    expect(COMUM).toContain('IMG_SCHEDULER="${IMG_NS}/imobi-scheduler"');
    expect(COMUM).not.toContain("ghcr.io/melgarafael");
  });
});
