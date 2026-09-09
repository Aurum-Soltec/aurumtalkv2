import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Readiness do processo, sem testar dependências externas.
 * Se `lib/env` não conseguir validar a configuração de produção, esta rota não chega a 200.
 * Dependências são avaliadas separadamente em /api/v1/health.
 */
export async function GET() {
  void env.NEXT_PUBLIC_SUPABASE_URL;
  return NextResponse.json(
    {
      data: {
        status: "ready",
        version: process.env.APP_VERSION || "desconhecido",
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
