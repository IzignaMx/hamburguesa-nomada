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

const PARALLAX_SPEEDS: Record<string, number> = {
  rays: 0.15,
  title: 0.25,
  sticker: 0.35,
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
      const speed = PARALLAX_SPEEDS[layer] ?? 0.2;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const offset = elementCenter - viewportCenter;
      const translateY = offset * speed * -1;

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
  updateParallax(); /* Posición inicial */
}
