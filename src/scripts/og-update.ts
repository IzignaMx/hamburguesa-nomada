/**
 * OG Update — actualiza meta tags Open Graph dinámicamente
 *
 * Se ejecuta del lado cliente cuando se carga un premio.
 * Social crawlers no ejecutan JS, pero al compartir el enlace
 * desde el navegador los tags estarán actualizados.
 */

const SITE_NAME = "Hamburguesa Nómada — Alleycat 5";

function setMeta(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function updateForAward(
  participantName: string,
  prizeTitle: string,
  category: string,
  position: number,
): void {
  const title = `Premio para ${participantName} — ${SITE_NAME}`;
  const description = `${participantName} recibió ${prizeTitle} en ${category} (posición ${position}).`;
  const url = window.location.href;

  setMeta("og:title", title);
  setMeta("og:description", description);
  setMeta("og:url", url);
  setMeta("og:type", "article");
  document.title = title;
}

export function resetDefaults(): void {
  const title = `Consulta tu premio — ${SITE_NAME}`;
  const description = "Consulta y descarga el reconocimiento digital de tu premio.";

  setMeta("og:title", title);
  setMeta("og:description", description);
  setMeta("og:url", window.location.href);
  setMeta("og:type", "website");
  document.title = title;
}
