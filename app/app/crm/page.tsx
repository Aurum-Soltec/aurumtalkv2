import { NavHub } from "@/components/shell/NavHub";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { traduzir } from "@/lib/i18n/dicionario";

export const dynamic = "force-dynamic";

/** Hub do CRM: inventário das telas de venda e da rotina da equipe. */
export default async function CrmHubPage() {
  const user = await requireAuth();
  const activeOrg = await resolveActiveOrg(user);

  return (
    <NavHub
      group="crm"
      isPlatformAdmin={user.is_platform_admin && !user.support}
      role={activeOrg?.role ?? null}
      interfaceSettings={activeOrg?.interface_settings}
      title={traduzir("CRM", user.idioma)}
      subtitle={traduzir("Funis, contatos, tarefas e catálogo da operação.", user.idioma)}
      locale={user.idioma}
    />
  );
}
