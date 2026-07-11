/**
 * Parallax — scroll-driven parallax para capas del póster
 *
 * Aplica translateY proporcional a la distancia del elemento
 * respecto al centro del viewport. Velocidad por layer configurable.
 *
 * Capas:
 *   data-parallax="rays"   → 0.15 (fondo, más lento)
 *   data-parallax="title"  → 0.25 (medio)
 *   data-parallax="sticker" → 0.35 (foreground, más rápido)
 *
 * Respeta prefers-reduced-motion.
 */

const PARALLAX_LIMITS: Record<string, number> = {
  rays: 18,
  title: 10,
  sticker: 12,
  hatch: 8,
};

const prefersMotion = window.matchMedia(
  "(prefers-reduced-motion: no-preference)",
);

const parallaxElements = document.querySelectorAll<HTMLElement>(
  "[data-parallax]",
);

if (parallaxElements.length > 0 && prefersMotion.matches) {
  let ticking = false;

  function updateParallax(): void {
    const viewportCenter = window.innerHeight / 2;

    parallaxElements.forEach((el) => {
      const layer = el.getAttribute("data-parallax") ?? "";
      const limit = PARALLAX_LIMITS[layer] ?? 8;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = viewportCenter - elementCenter;
      const normalizedDistance = Math.max(-1, Math.min(1, distance / window.innerHeight));
      const translateY = normalizedDistance * limit;

      el.style.transform = `translateY(${translateY}px)`;
    });
  }

  function onScroll(): void {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}
