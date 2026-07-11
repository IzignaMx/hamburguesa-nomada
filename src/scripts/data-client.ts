import type { PublicPayload } from "../lib/types";

const CACHE_KEY = "nomada-public-payload";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CachedPayload {
  cachedAt: number;
  payload: PublicPayload;
}

function readCache(): PublicPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedPayload;
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) return null;

    return cached.payload;
  } catch {
    return null;
  }
}

function writeCache(payload: PublicPayload): void {
  try {
    const cached: CachedPayload = {
      cachedAt: Date.now(),
      payload
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Storage can be unavailable in private mode.
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function loadPublicData(): Promise<PublicPayload> {
  const apiUrl = document.body.dataset.apiUrl?.trim();

  if (apiUrl) {
    try {
      const response = await fetchWithTimeout(apiUrl, 2500);
      if (!response.ok) throw new Error(`API responded ${response.status}`);

      const payload = (await response.json()) as PublicPayload;
      writeCache(payload);
      return payload;
    } catch {
      const cached = readCache();
      if (cached) return cached;
    }
  }

  const fallbackResponse = await fetch("/data/public-payload.json");
  if (!fallbackResponse.ok) {
    throw new Error("No fue posible cargar datos públicos.");
  }

  return (await fallbackResponse.json()) as PublicPayload;
}
