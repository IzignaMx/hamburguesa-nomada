# QA Final Report — V3 (feat/poster-motion-pwa-v3)

## Commit Log
| # | Commit | Message | Scope |
|---|--------|---------|-------|
| 1 | `a6fd354` | fix naming | Nómada → Hamburguesa Nómada |
| 2 | `2c4e5bd` | chore asset pipeline | Poster WebP, PWA icons |
| 3 | `cd9530e` | feat HeroPosterArt | Poster layers component |
| 4 | `a027778` | feat motion system | Parallax scroll |
| 5 | `9593239` | fix navigation | Botón semántico + ARIA |
| 6 | `089fb8f` | feat PWA metadata | Manifest, favicons, theme-color |
| 7 | `d1737e3` | feat service worker | Offline shell |
| 8 | `18cd122` | style polish | Hover, footer, category chips |
| 9 | `008e330` | perf audit | LCP fetchpriority, audit doc |
| **10** | *pending* | **QA report** | **Final verification** |

## Accessibility Checklist
| Check | Status |
|-------|--------|
| Skip link | ✅ Presente, visible on focus |
| Heading hierarchy (h1→h2→h3) | ✅ Válida |
| All images have alt | ✅ (decorative `alt=""`, informative `alt="..."`) |
| Form has label | ✅ (`#prize-code` con `<label for>`) |
| Focus visible | ✅ 3px solid ring, 4px offset |
| Focus differentiation (ink sections) | ✅ Yellow ring on dark bg |
| ARIA landmarks | ✅ `<header>`, `<nav aria-label>`, `<main>`, `<footer>` |
| ARIA expanded (mobile menu) | ✅ Botón semántico con `aria-expanded` dinámico |
| Color contrast | ✅ Ink #191518 on cream, pink on ink, etc. |
| `prefers-reduced-motion` | ✅ Reveals, parallax, countdown dot |

## Lighthouse Baseline (Phase 6)
| Category | Score |
|----------|-------|
| Performance | ~95 (lab) |
| Accessibility | 94 |
| Best Practices | 100 |
| SEO | 100 |

## PWA Verification
| Requirement | Status |
|-------------|--------|
| Web Manifest (`site.webmanifest`) | ✅ `display: standalone`, icons 192/512, shortcut /premios/ |
| Service Worker registration | ✅ Inline script in `<body>` |
| Cache strategies | ✅ Cache-first (static), network-first (HTML) |
| Offline fallback | ✅ Cached shell serves offline |
| Theme color | ✅ `#191518` |
| Icons maskable | ✅ 20% safe zone, ink bg |

## Priority Feature Status
| Feature | Status | Notes |
|---------|--------|-------|
| P0: Información del evento | ✅ | Hero, EventFacts, Countdown |
| P0: Categorías | ✅ | Category chips con hover |
| P0: Comunicado | ✅ | Announcement section |
| P0: Patrocinadores | ✅ | Sponsor grid con imágenes |
| P0: Consulta de premio | ✅ | Código + loading + error |
| P0: QR | ✅ | qrcode npm en /premios/ |
| P0: Descarga de tarjeta | ✅ | PNG 1080×1350 fallback local |
| P1: Resultados completos | ⬜ Post-MVP | |
| P1: Menú con WhatsApp | ⬜ Post-MVP | |
| P1: Web Share API | ⬜ Post-MVP | |
| P1: PWA | ✅ | SW + manifest + icons |
| P2: Galería / Historial / NFTs | ⬜ Post-MVP | |

## Build Verification
| Command | Result |
|---------|--------|
| `npm run check` | ✅ 0 errors, 0 warnings, 0 hints (28 files) |
| `npm run build` | ✅ 2 pages in ~1.1s |
| `npm run preview` | ✅ Static assets served correctly |

## Git Log
```
008e330 perf: audit v3 + fetchpriority en poster title (LCP)
18cd122 style: polish — EventFacts hover, categories font-display, footer credits, PrizeCallout copy
d1737e3 feat: service worker offline shell
089fb8f feat: PWA metadata — manifest, favicons, apple-touch-icon, theme-color
9593239 fix: navigation — checkbox hack → botón semántico con ARIA
a027778 feat: motion system — parallax scroll + script warnings cleanup
cd9530e feat: HeroPosterArt component
2c4e5bd chore: asset pipeline — sharp poster optimizer + PWA icon generator
a6fd354 fix: naming — Nómada → Hamburguesa Nómada
```

## Known Limitations
- SVG prize card uses system fonts (Arial) for canvas compatibility
- Poster title composition (486 KB) is the heaviest asset — trade-off for print-ready fidelity
- Sponsor images are large (avg 280 KB each) but lazy-loaded
- `.literal-copy` text-transform removal is specific to P0 spec — monitors may re-add uppercase if needed
