# V5 — Digital Awards System

## Scope
Rediseño completo del sistema de reconocimiento digital: HTML card, SVG/PNG descargable, poster assets, SS Soapy Hands, sponsor resolution, Web Share Level 2, a11y.

## What was built

| Component | Description |
|-----------|-------------|
| `src/lib/award-view-model.ts` | View model que transforma datos crudos a presentación |
| `src/lib/text-layout.ts` | Utilidades de layout de texto con Canvas 2D (wrap, fit, truncate) |
| `src/scripts/award-assets.ts` | Loader de assets (logo, sponsor, font, poster art) con cache |
| `src/scripts/prize-card.ts` | Generador SVG 1080×1350 con poster visual system, export PNG/File |
| `src/scripts/prize-page.ts` | Orquestación: lookup, sponsor resolution, render, download, share, copy |
| `src/scripts/og-update.ts` | Meta tags OG dinámicos por premio |
| `src/components/PrizeLookup.astro` | HTML rediseñado con sistema visual del póster |
| `public/awards/` | Poster assets servidos estáticamente para runtime |

## Commit history

```
48c89b6 refactor: create shared award view model and measured text layout utilities
e5e381e feat: load official award assets on demand — brand logo, sponsor logo, poster art, font
a0cf326 style: redesign HTML digital recognition card with poster visual system
dee6187 feat: rebuild prize-page with AwardViewModel, sponsor resolution, SVG with poster assets
00acfa8 fix: focus flow, aria-busy, blob cache clearing for prize page a11y
```

## QA verifications

### Automated (Playwright Chromium)

- `/premios/?code=DEMO-HN5` mobile (390×844): award card renders ✅
- `/premios/?code=DEMO-HN5` desktop (1280×800): award card renders ✅
- Content: "Participante demo", "Trans / N.B.", "Premio de demostración" ✅
- 1 H1 per page ✅
- No broken images ✅
- No console errors ✅

### HTML card zones

| Zone | Element | Status |
|------|---------|--------|
| A — Brand header | Logo + event name + edition + "Reconocimiento digital" | ✅ |
| B — Recipient | Person heading + category + position badge | ✅ |
| C — Prize | Prize title + description | ✅ |
| D — Sponsor | Sponsor logo (if available) + name | ✅ |
| E — Verification | QR code + share code + verify link | ✅ |
| F — Actions | Download/Share/Copy buttons | ✅ |
| Credit | "Experiencia digital por IzignaMx" | ✅ |

### SVG/PNG card (1080×1350)

| Feature | Status |
|---------|--------|
| Pink paper background with grain texture | ✅ |
| Poster rays/flames decorative overlay | ✅ |
| Dual ink frame (6px + 2px) | ✅ |
| Brand logo in cream/yellow circle | ✅ |
| SS Soapy Hands @font-face embedded | ✅ |
| Participant name, category, position badge | ✅ |
| Prize title (wraps if long) + description | ✅ |
| Sponsor logo + name (logo optional) | ✅ |
| QR code (ink on cream) | ✅ |
| Share code + verify instructions | ✅ |
| IzignaMx credit | ✅ |

### a11y features

- `aria-labelledby` on card article ✅
- `role="img"` + `aria-label` on QR container ✅
- `aria-live="polite"` on status element ✅
- `aria-busy` on download + share buttons ✅
- Focus moves to award heading on lookup success ✅
- `tabindex="-1"` on heading for programmatic focus ✅
- Clear error states with `prize-status--error` ✅

### Cache & perf

- Award assets loaded once, cached in memory ✅
- Blob cache per share code, cleared on new lookup ✅
- Font fetch cached via promise dedup ✅
- Parallel asset loading with `Promise.all` ✅

### Screenshots

See `docs/qa/v5-prize/`:
- `prize-390x844.png` — mobile full page with award
- `prize-1280x800.png` — desktop full page with award
