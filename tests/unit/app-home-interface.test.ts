import { expect, it, vi } from "vitest";
import AppHome from "@/app/app/page";

const auth = vi.hoisted(() => ({ requireAuth: vi.fn(), resolveActiveOrg: vi.fn() }));
vi.mock("@/lib/auth/server", () => auth);
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(path); } }));

it.each(["/app/products", "/app/tasks"])("a entrada abre o destino configurado %s", async (path) => {
  auth.requireAuth.mockResolvedValue({ is_platform_admin: false });
  auth.resolveActiveOrg.mockResolvedValue({
    role: "agent",
    interface_settings: { preset: "simplificada", destinos: [path] },
  });
  await expect(AppHome()).rejects.toThrow(path);
});

it("preserva Inbox para a interface completa", async () => {
  auth.requireAuth.mockResolvedValue({ is_platform_admin: false });
  auth.resolveActiveOrg.mockResolvedValue({ role: "agent" });
  await expect(AppHome()).rejects.toThrow("/app/inbox");
});
