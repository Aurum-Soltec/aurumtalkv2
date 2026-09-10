import { NavHub } from "@/components/shell/NavHub";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { traduzir } from "@/lib/i18n/dicionario";

export const dynamic = "force-dynamic";

/** Hub de Análise: superfícies que mostram o que aconteceu na operação. */
export default async function AnaliseHubPage() {
  const user = await requireAuth();
  const activeOrg = await resolveActiveOrg(user);

  return (
    <NavHub
      group="analise"
      isPlatformAdmin={user.is_platform_admin && !user.support}
      role={activeOrg?.role ?? null}
      interfaceSettings={activeOrg?.interface_settings}
      title={traduzir("Análise", user.idioma)}
      subtitle={traduzir("Acompanhe o que acontece na operação.", user.idioma)}
      locale={user.idioma}
    />
  );
}
