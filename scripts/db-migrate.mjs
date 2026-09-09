#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const dryRun = process.argv.includes("--dry-run");
const dbUrl = (process.env.SUPABASE_DB_ADMIN_URL || "").trim();

if (!dbUrl) {
  console.error("[db:migrate] SUPABASE_DB_ADMIN_URL é obrigatória.");
  console.error("[db:migrate] Use a conexão com privilégio DDL; não use service_role como URL de banco.");
  process.exit(2);
}

let parsed;
try {
  parsed = new URL(dbUrl);
} catch {
  console.error("[db:migrate] SUPABASE_DB_ADMIN_URL não é uma URL válida.");
  process.exit(2);
}
if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
  console.error("[db:migrate] SUPABASE_DB_ADMIN_URL precisa usar postgres:// ou postgresql://.");
  process.exit(2);
}

const args = ["supabase", "db", "push", "--db-url", dbUrl];
if (dryRun) args.push("--dry-run");

console.log(`[db:migrate] ${dryRun ? "preview" : "aplicação"} das migrations versionadas.`);
const result = spawnSync("pnpm", ["exec", ...args], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(`[db:migrate] falha ao iniciar Supabase CLI: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
