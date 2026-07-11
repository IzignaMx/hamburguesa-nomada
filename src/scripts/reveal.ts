/**
 * Reveal — IntersectionObserver section reveals
 *
 * Añade `.is-revealed` cuando una sección entra al viewport.
 * Una sola vez — unobserve tras revelar.
 * Respeta prefers-reduced-motion.
 */

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: no-preference)",
);
document.documentElement.classList.add("reveal-ready");
const revealElements = document.querySelectorAll<HTMLElement>(".section");

if (revealElements.length > 0 && prefersReduced.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -80px 0px" },
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  /* No animation: mostrar todo inmediatamente */
  revealElements.forEach((el) => el.classList.add("is-revealed"));
}
