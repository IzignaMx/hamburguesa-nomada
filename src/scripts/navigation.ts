/**
 * Navigation — active section tracking + mobile menu close
 *
 * IntersectionObserver marca el link activo del nav.
 * Cierra el hamburger CSS checkbox al hacer clic en un link.
 */

const navLinks = document.querySelectorAll<HTMLAnchorElement>(
  ".site-header__nav a"
);
const navToggle = document.querySelector<HTMLInputElement>("#nav-toggle");
const sections = document.querySelectorAll<HTMLElement>("section[id]");

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
    if (navToggle && navToggle.checked) {
      navToggle.checked = false;
    }
  });
});
