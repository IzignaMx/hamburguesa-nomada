/**
 * Prize Card — generación de SVG/PNG de reconocimiento digital.
 *
 * Responsabilidades:
 * - createPrizeCardSvg(): genera SVG completo con assets inline
 * - createPrizeCardBlob(): convierte SVG a PNG Blob
 * - downloadPrizeCard(): descarga PNG
 * - createPrizeCardFile(): prepara File para Web Share
 *
 * NO busca awards, NO accede al DOM, NO maneja UI.
 */

import QRCode from "qrcode";
import { applyStyle, wrapTextByWidth } from "../lib/text-layout";
import type { AwardViewModel } from "../lib/award-view-model";
import type { AwardAssets } from "./award-assets";

/* ── Constantes de diseño ────────────────────── */

const SVG_W = 1080;
const SVG_H = 1350;
const FONT_DISPLAY = "SS Soapy Hands";
const FONT_MONO = "ui-monospace, SFMono-Regular, Consolas, monospace";
const FONT_BODY = "Atkinson Hyperlegible, Inter, sans-serif";
const FONT_META = "Arial Narrow, Inter, sans-serif";

type AccentPalette = {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentLine: string;
  label: string;
};

const ACCENTS: Record<number, AccentPalette> = {
  1: { badgeBg: "#E5D583", badgeBorder: "#121110", badgeText: "#121110", accentLine: "#E5D583", label: "1.er lugar" },
  2: { badgeBg: "#F7E6D0", badgeBorder: "#D6718B", badgeText: "#121110", accentLine: "#D6718B", label: "2.o lugar" },
  3: { badgeBg: "#F53C06", badgeBorder: "#121110", badgeText: "#F7E6D0", accentLine: "#F53C06", label: "3.er lugar" },
};

function accentFor(position: number): AccentPalette {
  return ACCENTS[position] ?? {
    badgeBg: "#F27D9E",
    badgeBorder: "#121110",
    badgeText: "#121110",
    accentLine: "#F27D9E",
    label: `Posición ${position}`,
  };
}

/* ── Helpers SVG ─────────────────────────────── */

function escXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c
  );
}

/**
 * Crea un contexto 2D offscreen para medir texto.
 */
function createOffscreenCtx(): CanvasRenderingContext2D {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1350;
  const ctx = c.getContext("2d")!;
  return ctx;
}

function wrapSvgText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  maxLines = 3
): string[] {
  const ctx = createOffscreenCtx();
  applyStyle(ctx, { fontFamily, fontWeight: 700, fontSize, lineHeight: 1.2 });
  return wrapTextByWidth(ctx, text, maxWidth, maxLines);
}

function buildTspans(lines: string[], x: number, _dy: number, fontSize: number): string {
  return lines
    .map((line, i) =>
      `<tspan x="${x}" dy="${i === 0 ? 0 : fontSize * 1.25}">${escXml(line)}</tspan>`
    )
    .join("");
}

/* ── Generador SVG ───────────────────────────── */

export async function createPrizeCardSvg(
  vm: AwardViewModel,
  assets: AwardAssets
): Promise<string> {
  const qr = await QRCode.toDataURL(vm.permalink, {
    width: 320,
    margin: 3,
    color: { dark: "#121110", light: "#F7E6D0" },
  });

  const accent = accentFor(vm.position);
  const nameLines = vm.participantName.length <= 20
    ? [vm.participantName]
    : wrapSvgText(vm.participantName, 660, 80, FONT_DISPLAY, 3);

  const prizeLines = wrapSvgText(vm.prizeTitle, 660, 48, FONT_DISPLAY, 3);
  const descLines = vm.prizeDescription
    ? wrapSvgText(vm.prizeDescription, 660, 28, FONT_BODY, 4)
    : [];

  /* Safe area: 72px padding */
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <style>
      @font-face {
        font-family: "${FONT_DISPLAY}";
        src: url("${escXml(assets.fontDataUri)}") format("woff2");
        font-weight: 400;
        font-style: normal;
      }
      @keyframes none {}
    </style>
    <clipPath id="frame-clip">
      <rect x="40" y="40" rx="24" ry="24" width="1000" height="1270"/>
    </clipPath>
    <pattern id="grain" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
      <rect width="200" height="200" fill="none"/>
      <circle cx="30" cy="40" r="1" fill="#121110" opacity="0.04"/>
      <circle cx="80" cy="20" r="0.8" fill="#121110" opacity="0.03"/>
      <circle cx="150" cy="60" r="1.2" fill="#121110" opacity="0.05"/>
      <circle cx="40" cy="120" r="0.6" fill="#121110" opacity="0.04"/>
      <circle cx="110" cy="150" r="1" fill="#121110" opacity="0.03"/>
      <circle cx="170" cy="110" r="0.7" fill="#121110" opacity="0.04"/>
      <circle cx="20" cy="180" r="0.9" fill="#121110" opacity="0.03"/>
      <circle cx="90" cy="90" r="0.5" fill="#121110" opacity="0.05"/>
      <circle cx="140" cy="170" r="1.1" fill="#121110" opacity="0.04"/>
      <circle cx="180" cy="140" r="0.8" fill="#121110" opacity="0.03"/>
    </pattern>
  </defs>

  <!-- Fondo rosa papel -->
  <rect width="1080" height="1350" fill="#F27D9E"/>
  <rect width="1080" height="1350" fill="url(#grain)" opacity="0.3"/>

  <!-- Rayos/flamas decorativos -->
  <image href="${escXml(assets.posterRays)}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice" opacity="0.18"/>

  <!-- Marco negro interior -->
  <rect x="48" y="48" width="984" height="1254" rx="20" ry="20" fill="none" stroke="#121110" stroke-width="6"/>
  <rect x="60" y="60" width="960" height="1230" rx="16" ry="16" fill="none" stroke="#121110" stroke-width="2" opacity="0.4"/>

  <!-- Área de contenido: 72-1008 (936px útiles) -->
  <g clip-path="url(#frame-clip)">

    <!-- ═══ ZONA A: Identidad superior ═══ -->
    <g transform="translate(540, 0)">
      <!-- Círculo decorativo atrás del logo -->
      <circle cx="0" cy="100" r="68" fill="#E5D583" stroke="#121110" stroke-width="4"/>
      <circle cx="0" cy="100" r="60" fill="#F7E6D0" stroke="#121110" stroke-width="3"/>
      <!-- Logo -->
      <image href="${escXml(assets.brandLogo)}" x="-48" y="52" width="96" height="96" preserveAspectRatio="xMidYMid meet"/>
      <!-- Nombre del evento -->
      <text x="0" y="195" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="34" font-weight="400" fill="#121110">Hamburguesa Nómada</text>
      <text x="0" y="225" text-anchor="middle" font-family="${FONT_META}" font-size="16" font-weight="700" fill="#9D2910" letter-spacing="4">5º ANIVERSARIO</text>
      <rect x="414" y="242" width="252" height="30" rx="15" ry="15" fill="#E5D583" stroke="#121110" stroke-width="2"/>
      <text x="540" y="263" text-anchor="middle" font-family="${FONT_META}" font-size="14" font-weight="700" fill="#121110" letter-spacing="2">RECONOCIMIENTO DIGITAL</text>
    </g>

    <!-- ═══ ZONA B: Persona reconocida ═══ -->
    <g transform="translate(0, 0)">
      <!-- Línea de acento del premio -->
      <rect x="80" y="320" width="${accent.accentLine === '#E5D583' ? 120 : 80}" height="6" rx="3" fill="${accent.accentLine}"/>
      <!-- Nombre del participante -->
      <text x="540" y="390" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="80" font-weight="400" fill="#121110">
        ${buildTspans(nameLines, 540, 0, 80)}
      </text>
      <!-- Categoría -->
      <text x="540" y="${480 + (nameLines.length - 1) * 30}" text-anchor="middle" font-family="${FONT_BODY}" font-size="26" font-weight="700" fill="#824644">
        ${escXml(vm.categoryLabel)}
      </text>
      <!-- Badge de posición -->
      <g transform="translate(540, ${520 + (nameLines.length - 1) * 30})">
        <rect x="-80" y="-18" width="160" height="36" rx="18" ry="18" fill="${accent.badgeBg}" stroke="${accent.badgeBorder}" stroke-width="2"/>
        <text x="0" y="6" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="18" font-weight="400" fill="${accent.badgeText}">
          ${escXml(accent.label)}
        </text>
      </g>
    </g>

    <!-- ═══ ZONA C: Premio ═══ -->
    <!-- Línea separadora -->
    <line x1="80" y1="600" x2="1000" y2="600" stroke="#121110" stroke-width="2" stroke-dasharray="8,4" opacity="0.3"/>

    <g transform="translate(0, 0)">
      <text x="540" y="660" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="48" font-weight="400" fill="#9D2910">
        ${buildTspans(prizeLines, 540, 0, 48)}
      </text>
      ${descLines.length > 0 ? `
      <text x="540" y="${700 + prizeLines.length * 60}" text-anchor="middle" font-family="${FONT_BODY}" font-size="26" font-weight="400" fill="#121110">
        ${buildTspans(descLines, 540, 0, 26)}
      </text>
      ` : ''}
    </g>

    <!-- ═══ ZONA D: Patrocinador ═══ -->
    <g transform="translate(0, 0)">
      <line x1="80" y1="${820 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" x2="1000" y2="${820 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" stroke="#121110" stroke-width="2" stroke-dasharray="8,4" opacity="0.3"/>

      <text x="540" y="${860 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" text-anchor="middle" font-family="${FONT_META}" font-size="14" font-weight="700" fill="#824644" letter-spacing="2">PATROCINA</text>

      ${assets.sponsorLogo ? `
      <image href="${escXml(assets.sponsorLogo)}" x="${540 - 60}" y="${880 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" width="120" height="72" preserveAspectRatio="xMidYMid meet"/>
      <text x="540" y="${990 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" text-anchor="middle" font-family="${FONT_BODY}" font-size="24" font-weight="700" fill="#121110">
        ${escXml(vm.sponsorName)}
      </text>
      ` : `
      <text x="540" y="${910 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" text-anchor="middle" font-family="${FONT_BODY}" font-size="28" font-weight="700" fill="#121110">
        ${escXml(vm.sponsorName)}
      </text>
      `}
    </g>

    <!-- ═══ ZONA E: Verificación ═══ -->
    <g transform="translate(0, 0)">
      <!-- Fondo crema limpio para QR -->
      <rect x="210" y="${1050 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" width="320" height="320" rx="12" ry="12" fill="#F7E6D0" stroke="#121110" stroke-width="3"/>
      <image href="${escXml(qr)}" x="230" y="${1070 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" width="280" height="280" preserveAspectRatio="xMidYMid meet"/>

      <!-- Código y dominio -->
      <rect x="550" y="${1050 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" width="320" height="40" rx="6" ry="6" fill="#E5D583" stroke="#121110" stroke-width="2"/>
      <text x="710" y="${1077 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" text-anchor="middle" font-family="${FONT_MONO}" font-size="20" font-weight="700" fill="#121110">
        ${escXml(vm.shareCode)}
      </text>

      <text x="550" y="${1110 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" font-family="${FONT_META}" font-size="15" font-weight="700" fill="#824644" letter-spacing="1">VERIFICA</text>
      <text x="550" y="${1135 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" font-family="${FONT_BODY}" font-size="16" font-weight="400" fill="#121110">Escanea el código QR o visita</text>
      <text x="550" y="${1160 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" font-family="${FONT_MONO}" font-size="16" font-weight="700" fill="#9D2910">nomada.izignamx.com</text>
    </g>

    <!-- ═══ ZONA F: Crédito ═══ -->
    <g transform="translate(0, 0)">
      <line x1="80" y1="${1260 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" x2="1000" y2="${1260 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" stroke="#121110" stroke-width="1" opacity="0.2"/>
      <text x="540" y="${1290 + (prizeLines.length - 1) * 60 + (descLines.length > 0 ? descLines.length * 35 : 0)}" text-anchor="middle" font-family="${FONT_META}" font-size="14" font-weight="400" fill="#824644">
        Experiencia digital por IzignaMx
      </text>
    </g>

  </g>
</svg>`;
}

/* ── Blob/descarga ───────────────────────────── */

let _blobCache: { key: string; blob: Blob } | null = null;

export async function createPrizeCardBlob(
  vm: AwardViewModel,
  assets: AwardAssets
): Promise<Blob> {
  const cacheKey = vm.shareCode;
  if (_blobCache?.key === cacheKey) return _blobCache.blob;

  const svg = await createPrizeCardSvg(vm, assets);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No fue posible renderizar la tarjeta."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = SVG_W;
    canvas.height = SVG_H;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible.");

    ctx.drawImage(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("No fue posible crear PNG."));
      }, "image/png");
    });

    _blobCache = { key: cacheKey, blob };
    return blob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function createPrizeCardFile(
  vm: AwardViewModel,
  assets: AwardAssets
): Promise<File> {
  const blob = await createPrizeCardBlob(vm, assets);
  return new File([blob], `reconocimiento-${vm.shareCode}.png`, { type: "image/png" });
}

export async function downloadPrizeCard(
  vm: AwardViewModel,
  assets: AwardAssets
): Promise<void> {
  const blob = await createPrizeCardBlob(vm, assets);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `reconocimiento-${vm.shareCode}.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
