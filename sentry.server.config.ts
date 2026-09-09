// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { resolveSentryDsn } from "./lib/sentry/dsn";
import { sentryScrubHooks } from "./lib/sentry/scrub";

const sentryDsn = resolveSentryDsn(process.env.SENTRY_DSN);

Sentry.init({
  dsn: sentryDsn,

  // Opt-in: só existe DSN quando o operador configurou. 10% evita custo explosivo por default.
  tracesSampleRate: sentryDsn ? 0.1 : 0,
  enableLogs: true,
  sendDefaultPii: false,

  ...sentryScrubHooks,
});

// Transparência de telemetria: uma linha no boot dizendo o que está ativo e como
// desligar. Evita "telemetria silenciosa" num projeto open source self-host.
if (!sentryDsn) {
  console.info("[telemetria] Desligada (SENTRY_DSN=off) — nenhum erro é enviado.");
} else {
  console.info("[telemetria] Erros sendo enviados ao Sentry configurado em SENTRY_DSN.");
}
