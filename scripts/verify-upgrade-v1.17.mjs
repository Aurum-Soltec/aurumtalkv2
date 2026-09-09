import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];
function check(name, ok, detail="") {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) failures.push({ name, detail });
}
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return fs.readFileSync(path.join(root, rel), "utf8"); }

check("package.json exists", exists("package.json"));
check("baseline exists", exists("supabase/baseline.sql"));
check("database types exist", exists("lib/database.types.ts"));
check(
  "pre-go-live migration exists",
  exists("supabase/migrations/20260905160000_0218_configuracao_pre_go_live_atomica.sql")
);
check(
  "attendance boundary migration exists",
  exists("supabase/migrations/20260906020000_0222_fronteira_do_atendimento.sql")
);
check(
  "Google reconciliation migration exists",
  exists("supabase/migrations/20260907010000_0225_google_reconciliacao.sql")
);
check(
  "Meet migration exists",
  exists("supabase/migrations/20260907020000_0226_meet_e_entrega_transacional.sql")
);

const catalogPath = "lib/navigation/catalogo.ts";
if (exists(catalogPath)) {
  const cat = read(catalogPath);
  const needle = 'href: "/app/integrations/nuvemshop"';
  const idx = cat.indexOf(needle);
  check("Nuvemshop technical destination exists", idx >= 0);
  if (idx >= 0) {
    const start = cat.lastIndexOf("{", idx);
    let depth = 0, end = start;
    for (; end < cat.length; end++) {
      if (cat[end] === "{") depth++;
      else if (cat[end] === "}") {
        depth--;
        if (depth === 0) { end++; break; }
      }
    }
    const object = cat.slice(start, end)
      .split("\n")
      .map(line => line.replace(/\/\/.*$/,""))
      .join("\n");
    check(
      "Nuvemshop hidden from sidebar",
      !/\bsidebar\s*:\s*true\b/.test(object),
      "Integration remains as destination/search route but must not be visible in sidebar."
    );
  }
} else {
  check("navigation catalog exists", false);
}

const critical = [
  "lib/agent-engine/agent/inbound-turn.ts",
  "lib/ai/handoff/orchestrator.ts",
  "workers/ai-response-worker.ts",
  "lib/agenda/google/sync-executor.ts",
  "lib/agenda/google/meet.ts",
  "app/app/products/page.tsx",
  "app/app/tasks/page.tsx",
  "app/app/ads/meta/page.tsx",
  "scripts/db-migrate.mjs",
  "scripts/production-preflight.mjs",
];
for (const rel of critical) check(`critical file ${rel}`, exists(rel));

const migrationDir = path.join(root, "supabase/migrations");
const migrationCount = fs.readdirSync(migrationDir).filter(x => x.endsWith(".sql")).length;
check("migration count is 213", migrationCount === 213, `found=${migrationCount}`);

const e2e = read("tests/e2e/confirmar-dado-do-contato.spec.ts");
check(
  "generated E2E uses root-correct env helper",
  e2e.includes('from "./scripts/lib/env-de-teste"')
);

console.log(JSON.stringify({ checks, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
