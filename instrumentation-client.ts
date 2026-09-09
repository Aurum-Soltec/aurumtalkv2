// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { resolveSentryDsn } from "./lib/sentry/dsn";
import { sentryScrubHooks } from "./lib/sentry/scrub";

const sentryDsn = resolveSentryDsn(
  typeof window !== "undefined" ? window.__PUBLIC_ENV__?.SENTRY_DSN : undefined,
);

Sentry.init({
  dsn: sentryDsn,

  // FORMA DE FUNÇÃO, não de array: array SOMA aos defaults do SDK, e era assim
  // que a `BrowserSession` (default) seguia ligada apesar da política abaixo. A
  // função RECEBE os defaults e o retorno os substitui — é o único jeito de tirar
  // uma integração default sem enumerar as outras dez à mão.
  integrations: (padraoDoSdk) => [
    ...padraoDoSdk,
    Sentry.replayIntegration(),
  ],

  // Telemetria é opt-in. Quando há DSN próprio, amostramos 10% de traces e
  // replay somente em erro; replay de sessão contínuo permanece desligado.
  tracesSampleRate: sentryDsn ? 0.1 : 0,
  enableLogs: true,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: sentryDsn ? 1.0 : 0,

  sendDefaultPii: false,

  ...sentryScrubHooks,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
