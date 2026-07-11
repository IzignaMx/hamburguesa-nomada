/**
 * generate-pwa-icons.mjs
 *
 * Genera favicons e iconos PWA desde el logotipo circular oficial.
 *
 * Uso: node scripts/generate-pwa-icons.mjs
 *
 * Salidas:
 *   public/favicon.ico
 *   public/favicon-16x16.png
 *   public/favicon-32x32.png
 *   public/apple-touch-icon.png
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-192.png
 *   public/icons/icon-maskable-512.png
 *   public/site.webmanifest
 */

import { writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const LOGO_SRC = join(ROOT, "src", "assets", "brand", "hamburguesa-nomada-logo.webp");
const LOGO_FALLBACK = join(ROOT, "public", "logos", "hamburguesa-nomada.webp");
const OUT_DIR = join(ROOT, "public", "icons");

mkdirSync(OUT_DIR, { recursive: true });

/* Usar brand logo o fallback */
const logoFile =
  existsSync(LOGO_SRC) ? LOGO_SRC
  : existsSync(LOGO_FALLBACK) ? LOGO_FALLBACK
  : null;

if (!logoFile) {
  console.error("❌ No se encontró el logotipo. Copia el logo a src/assets/brand/ primero.");
  process.exit(1);
}

const ICONS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-192.png", size: 192, maskable: true },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
];

for (const icon of ICONS) {
  let img = sharp(logoFile).resize(icon.size, icon.size, { fit: "cover" });

  /* Para maskable: añadir fondo sólido ink y padding del 10% */
  if (icon.maskable) {
    /* Crear un cuadrado con padding del 10% */
    const padPct = 0.1;
    const innerSize = Math.round(icon.size * (1 - padPct * 2));
    const padPx = Math.round(icon.size * padPct);

    const inner = await sharp(logoFile)
      .resize(innerSize, innerSize, { fit: "cover" })
      .toBuffer();

    /* Componer sobre fondo ink */
    img = sharp({
      create: {
        width: icon.size,
        height: icon.size,
        channels: 4,
        background: { r: 25, g: 21, b: 24, alpha: 1 },
      },
    }).composite([{ input: inner, top: padPx, left: padPx }]);
  }

  const dest = icon.name.startsWith("favicon") || icon.name.startsWith("apple")
    ? join(ROOT, "public", icon.name)
    : join(OUT_DIR, icon.name);

  mkdirSync(dirname(dest), { recursive: true });
  await img.png().toFile(dest);
  const stats = await sharp(logoFile).metadata();
  console.log(`✅ ${dest}  (${icon.size}×${icon.size})`);
}

/* ── favicon.ico (32×32 PNG renombrado, los navegadores lo aceptan) ── */
copyFileSync(
  join(ROOT, "public", "favicon-32x32.png"),
  join(ROOT, "public", "favicon.ico"),
);
console.log(`✅ ${join(ROOT, "public", "favicon.ico")}`);

/* ── site.webmanifest ──────────────────────── */

const manifest = {
  id: "/",
  name: "Hamburguesa Nómada — Alleycat 5",
  short_name: "HM",
  description: "Micrositio del quinto aniversario y alleycat de Hamburguesa Nómada.",
  lang: "es-MX",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
  background_color: "#191518",
  theme_color: "#191518",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    {
      src: "/icons/icon-maskable-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    {
      name: "Consultar premio",
      short_name: "Premios",
      url: "/premios/",
    },
  ],
};

writeFileSync(
  join(ROOT, "public", "site.webmanifest"),
  JSON.stringify(manifest, null, 2),
  "utf-8",
);
console.log(`✅ ${join(ROOT, "public", "site.webmanifest")}`);
