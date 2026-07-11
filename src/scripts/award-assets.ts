/**
 * Award Assets — carga bajo demanda de assets para SVG/PNG.
 * Convierte imágenes same-origin a data URI para incrustar en SVG.
 * Cachea resultados para evitar fetch repetidos.
 *
 * Todos los paths son relativos a / (public/), estables entre builds.
 */

interface AwardAssetCache {
  brandLogo?: string;
  sponsorLogos: Record<string, string>;
  fontDataUri?: string;
  posterRays?: string;
  posterFrame?: string;
}

const cache: AwardAssetCache = { sponsorLogos: {} };
let fontLoadPromise: Promise<string> | null = null;

/**
 * Convierte un recurso same-origin a data URI (base64).
 */
async function fetchAsDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read blob from ${url}`));
    reader.readAsDataURL(blob);
  });
}

/**
 * Carga el logo oficial de Hamburguesa Nómada.
 * URL estable: /logos/hamburguesa-nomada.webp
 */
export async function loadBrandLogo(): Promise<string> {
  if (cache.brandLogo) return cache.brandLogo;
  cache.brandLogo = await fetchAsDataUri("/logos/hamburguesa-nomada.webp");
  return cache.brandLogo;
}

/**
 * Carga el logo de un patrocinador desde su path.
 * Retorna undefined si falla (logo no disponible o ruta inválida).
 */
export async function loadSponsorLogo(logoPath: string | undefined): Promise<string | undefined> {
  if (!logoPath) return undefined;
  if (cache.sponsorLogos[logoPath]) return cache.sponsorLogos[logoPath];

  try {
    const uri = await fetchAsDataUri(logoPath);
    cache.sponsorLogos[logoPath] = uri;
    return uri;
  } catch {
    /* Logo no disponible en este momento — fallback a nombre textual */
    return undefined;
  }
}

/**
 * Carga los rayos/flamas del póster para fondo del SVG.
 * URL estable: /awards/poster-rays-flames.webp
 */
export async function loadPosterRays(): Promise<string> {
  if (cache.posterRays) return cache.posterRays;
  cache.posterRays = await fetchAsDataUri("/awards/poster-rays-flames.webp");
  return cache.posterRays;
}

/**
 * Carga el marco ondulado del póster.
 * URL estable: /awards/poster-frame.webp
 */
export async function loadPosterFrame(): Promise<string> {
  if (cache.posterFrame) return cache.posterFrame;
  cache.posterFrame = await fetchAsDataUri("/awards/poster-frame.webp");
  return cache.posterFrame;
}

/**
 * Carga SS Soapy Hands como data URI para incrustar en SVG.
 * Cachea la promesa para evitar fetch duplicado.
 * URL estable: /fonts/SS_Soapy_Hands.woff2
 */
export async function loadFontDataUri(): Promise<string> {
  if (cache.fontDataUri) return cache.fontDataUri;
  fontLoadPromise ??= fetchAsDataUri("/fonts/SS_Soapy_Hands.woff2");
  cache.fontDataUri = await fontLoadPromise;
  return cache.fontDataUri;
}

export interface AwardAssets {
  brandLogo: string;
  sponsorLogo: string | undefined;
  fontDataUri: string;
  posterRays: string;
  posterFrame: string;
}

/**
 * Carga todos los assets necesarios para generar un SVG de premio.
 * Se llama solo al encontrar un award.
 * Promise.all para carga paralela.
 */
export async function loadAwardAssets(sponsorLogoPath?: string): Promise<AwardAssets> {
  const [brandLogo, sponsorLogo, fontDataUri, posterRays, posterFrame] = await Promise.all([
    loadBrandLogo(),
    loadSponsorLogo(sponsorLogoPath),
    loadFontDataUri(),
    loadPosterRays(),
    loadPosterFrame(),
  ]);

  return { brandLogo, sponsorLogo, fontDataUri, posterRays, posterFrame };
}
