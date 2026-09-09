/**
 * Telemetria da IMOBI CRM é opt-in.
 *
 * SENTRY_DSN vazio/off/false/0 => nada sai da instalação.
 * SENTRY_DSN=<dsn-do-operador>  => envia somente para o destino configurado pelo operador.
 */
export function resolveSentryDsn(value: string | undefined | null): string | undefined {
  const raw = (value ?? "").trim();
  const lowered = raw.toLowerCase();
  if (!raw || ["off", "false", "0"].includes(lowered)) return undefined;
  return raw;
}

/** Compatibilidade com testes/histórico: o fork não possui DSN comunitário implícito. */
export function isCommunityDsn(_dsn: string | undefined): boolean {
  return false;
}
