/**
 * Navigation — active section tracking + mobile menu toggle
 *
 * IntersectionObserver marca el link activo del nav.
 * Botón hamburger semántico con aria-expanded.
 * Cierra el menú al hacer clic en un link.
 */

const header = document.querySelector<HTMLElement>(".site-header");
const navBtn = document.querySelector<HTMLButtonElement>(".nav-btn");
const navLinks = document.querySelectorAll<HTMLAnchorElement>(
  ".site-header__nav a",
);
const sections = document.querySelectorAll<HTMLElement>("section[id]");

/* ── Mobile menu toggle ───────────────────────── */

if (navBtn && header) {
  navBtn.addEventListener("click", () => {
    const isOpen = navBtn.getAttribute("aria-expanded") === "true";
    const next = !isOpen;
    navBtn.setAttribute("aria-expanded", String(next));
    header.classList.toggle("nav--open", next);
    navBtn.setAttribute("aria-label", next ? "Cerrar menú" : "Abrir menú de navegación");
  });
}

/* ── Active section ──────────────────────────── */

function setActiveLink(id: string): void {
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    link.classList.toggle("nav--active", href === `#${id}`);
  });
}

if (sections.length > 0 && navLinks.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      }
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Close mobile nav on link click ──────────── */

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navBtn && navBtn.getAttribute("aria-expanded") === "true") {
      navBtn.setAttribute("aria-expanded", "false");
      header?.classList.remove("nav--open");
      navBtn.setAttribute("aria-label", "Abrir menú de navegación");
    }
  });
});
