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
  const closeMenu = (restoreFocus = false): void => {
    navBtn.setAttribute("aria-expanded", "false");
    navBtn.setAttribute("aria-label", "Abrir menú de navegación");
    header.classList.remove("nav--open");
    document.body.classList.remove("nav-menu-open");
    if (restoreFocus) navBtn.focus();
  };

  navBtn.addEventListener("click", () => {
    const isOpen = navBtn.getAttribute("aria-expanded") === "true";
    const next = !isOpen;
    navBtn.setAttribute("aria-expanded", String(next));
    header.classList.toggle("nav--open", next);
    document.body.classList.toggle("nav-menu-open", next);
    navBtn.setAttribute("aria-label", next ? "Cerrar menú" : "Abrir menú de navegación");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navBtn.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });
}

/* ── Active section ──────────────────────────── */

function setActiveLink(id: string): void {
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    const isActive = href === `#${id}`;
    link.classList.toggle("nav--active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
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
      document.body.classList.remove("nav-menu-open");
      navBtn.setAttribute("aria-label", "Abrir menú de navegación");
    }
  });
});
