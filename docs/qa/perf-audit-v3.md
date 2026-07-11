# Performance Audit — V3 (feat/poster-motion-pwa-v3)

## Build Metrics
| Metric | Value |
|--------|-------|
| Pages | 2 |
| Build time | ~1.1s |
| Dist size | 12 MB (66 files, 10 dirs) |
| `npm run check` | 0 errors, 0 warnings, 0 hints |

## Bundle Analysis
| Asset | Size | Notes |
|-------|------|-------|
| CSS (BaseLayout) | 20 KB | Single stylesheet |
| JS (index) | — | No JS on index page |
| JS (/premios/) | 30 KB | QR code library only |
| Service Worker | 2.5 KB | Cache-first + network-first |

## Font Loading
| Font | Format | Size | Preloaded |
|------|--------|------|-----------|
| SS Soapy Hands Regular | woff2 | 31 KB | ✅ `rel=preload` |
| SS Soapy Hands Italic | woff2 | 32 KB | ✅ `rel=preload` |

Strategy: `font-display: swap` in `@font-face`, dual preload in `<head>`.

## LCP Analysis
| Candidate | Size | `fetchpriority` | Strategy |
|-----------|------|-----------------|----------|
| Hero logo (webp) | 73 KB | `high` | ✅ Immediate load |
| Poster title comp. (webp) | 486 KB | `high` | ✅ Added in V3 |
| Poster rays (webp) | 31 KB | `eager` | Decorative layer |

**LCP is likely the poster title composition** on desktop (largest element), or the hero logo on mobile (where poster art stacks below). Both have `fetchpriority="high"`.

## CLS Analysis
| Risk | Status |
|------|--------|
| Font flash (FOUT) | ✅ `font-display: swap` |
| Images without dimensions | ✅ All images have width/height |
| Layout shifts from poster | ✅ Poster art uses absolute positioning for overlays |

## Optimization Opportunities
1. **Poster title composition (486 KB)**: Could be reduced to ~250 KB with quality 70% sharp — not applied, keeps poster fidelity.
2. **Sponsor images (total ~8 MB)**: All lazy-loaded (`loading="lazy"`). Initial page unaffected.
3. **Original poster images** in `dist/images/` (1.5 MB): Not linked from HTML, kept by user request. Could be excluded from build with `.gitignore` adjustments.

## PWA Readiness
| Requirement | Status |
|-------------|--------|
| Web App Manifest | ✅ /site.webmanifest |
| Service Worker | ✅ /sw.js (caches app shell) |
| Icons 192/512 | ✅ + maskable variants |
| Offline support | ✅ Network-first HTML, cache-first assets |
| splash/theme-color | ✅ #191518 |

## Recommendations for Production
- Set up Cloudflare Polish (automatic image optimization) for sponsor images
- Enable Brotli compression at CDN level
- Poster title composition could be preloaded via `<link rel=preload>` (currently in CSS background-image flow)
