import { tagDeIdioma } from "@/lib/i18n/datas";
import type { Idioma } from "@/lib/i18n/idiomas";
import { traduzir } from "@/lib/i18n/dicionario";

export function meetingDeliveryBody(
  startsAt: string,
  timeZone: string,
  url: string,
  idioma: Idioma,
): string {
  const when = new Intl.DateTimeFormat(tagDeIdioma(idioma), {
    dateStyle: "short",
    timeStyle: "short",
    timeZone,
  }).format(new Date(startsAt));
  return `${traduzir("Sua reunião está marcada para", idioma)} ${when} (${timeZone}). ${traduzir("Link do Google Meet:", idioma)} ${url}`;
}
