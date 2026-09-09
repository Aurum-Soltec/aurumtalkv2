#!/usr/bin/env node
/**
 * IMOBI CRM production preflight.
 * Não faz rede e não imprime secrets. Valida apenas configuração local antes do deploy.
 */
const env = process.env;
const failures = [];
const warnings = [];

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_URL",
  "SUPABASE_DB_ADMIN_URL",
  "INTERNAL_SECRET",
  "CPF_ENCRYPTION_KEY",
  "WAHA_BYO_ENCRYPTION_KEY",
  "AI_CRED_AES_KEY",
  "WAHA_API_BASE_URL",
  "WAHA_API_KEY",
  "WAHA_WEBHOOK_BASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "APP_IMAGE",
  "WORKER_IMAGE",
  "SCHEDULER_IMAGE",
];

for (const key of required) {
  if (!(env[key] || "").trim()) failures.push(`${key}: ausente`);
}

function validHttpUrl(key, httpsRequired = false) {
  const v = (env[key] || "").trim();
  if (!v) return;
  try {
    const u = new URL(v);
    if (!["http:", "https:"].includes(u.protocol)) failures.push(`${key}: protocolo inválido`);
    if (httpsRequired && u.protocol !== "https:") failures.push(`${key}: HTTPS obrigatório em produção`);
    if (["localhost", "127.0.0.1"].includes(u.hostname)) failures.push(`${key}: aponta para localhost`);
    if (u.hostname.endsWith(".invalid")) failures.push(`${key}: placeholder .invalid`);
  } catch {
    failures.push(`${key}: URL inválida`);
  }
}
validHttpUrl("NEXT_PUBLIC_SUPABASE_URL", true);
validHttpUrl("NEXT_PUBLIC_APP_URL", true);
validHttpUrl("NEXT_PUBLIC_ADMIN_URL", true);
validHttpUrl("WAHA_WEBHOOK_BASE_URL", true);

const appName = (env.APP_NAME || "").trim();
if (appName && appName !== "IMOBI CRM") warnings.push(`APP_NAME="${appName}" difere da marca canônica IMOBI CRM`);
if (!appName) warnings.push("APP_NAME vazio: o fallback do código é IMOBI CRM");
if ((env.APP_ACCENT_HEX || "").trim() && (env.APP_ACCENT_HEX || "").trim().toLowerCase() !== "#7b3fa4") {
  warnings.push("APP_ACCENT_HEX difere do roxo principal #7B3FA4");
}

for (const key of ["APP_IMAGE", "WORKER_IMAGE", "SCHEDULER_IMAGE"]) {
  const v = (env[key] || "").toLowerCase();
  if (v.includes("melgarafael") || v.includes("deskcomm")) {
    failures.push(`${key}: ainda aponta para artefato upstream Deskcomm; publique/use as imagens do fork IMOBI`);
  }
  if (v.includes("seu_github_owner") || v.includes("change_me")) {
    failures.push(`${key}: ainda contém placeholder de registry`);
  }
  if (v.includes(":latest")) warnings.push(`${key}: usa tag móvel :latest; prefira versão imutável ou :stable controlada`);
}

for (const key of ["INTERNAL_SECRET", "CPF_ENCRYPTION_KEY", "WAHA_BYO_ENCRYPTION_KEY"]) {
  const v = env[key] || "";
  if (v && v.length < 32) failures.push(`${key}: curto demais (mínimo operacional: 32 caracteres)`);
}

const aes = env.AI_CRED_AES_KEY || "";
if (aes) {
  try {
    const bytes = Buffer.from(aes, "base64");
    if (bytes.length !== 32) failures.push("AI_CRED_AES_KEY: precisa decodificar para exatamente 32 bytes");
  } catch {
    failures.push("AI_CRED_AES_KEY: base64 inválido");
  }
}

const sentry = (env.SENTRY_DSN || "").trim();
if (!sentry || ["off", "false", "0"].includes(sentry.toLowerCase())) {
  warnings.push("Sentry desligado; aceitável para deploy inicial, mas configure observabilidade antes de escalar");
}

if ((env.NODE_ENV || "production") !== "production") warnings.push("NODE_ENV não está como production");

console.log("IMOBI CRM — Production Preflight");
for (const item of warnings) console.log(`WARN  ${item}`);
for (const item of failures) console.error(`FAIL  ${item}`);
console.log(`Resultado: ${failures.length ? "BLOCKED" : "PASS"} (${failures.length} falha(s), ${warnings.length} aviso(s))`);
process.exit(failures.length ? 1 : 0);
