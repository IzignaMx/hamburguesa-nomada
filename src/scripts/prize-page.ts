/**
 * Prize Page — lógica del formulario de consulta + tarjeta de reconocimiento.
 *
 * Flujo:
 *   1. lookup(code) → loadPublicData(), busca award por shareCode
 *   2. Resuelve sponsor desde payload.sponsors
 *   3. Construye AwardViewModel
 *   4. Carga assets (logo, fuentes, poster decorations)
 *   5. Popula HTML + genera SVG/PNG
 *   6. Download, share, copy-link
 */

import QRCode from "qrcode";
import { loadPublicData } from "./data-client";
import { downloadPrizeCard, createPrizeCardFile } from "./prize-card";
import { loadAwardAssets } from "./award-assets";
import { buildAwardViewModel } from "../lib/award-view-model";
import { updateForAward, resetDefaults } from "./og-update";
import type { PublicAward, PublicPayload, Sponsor } from "../lib/types";
import type { AwardAssets } from "./award-assets";

/* ── Selectores HTML ─────────────────────────── */

const form = document.querySelector<HTMLFormElement>("#prize-form");
const codeInput = document.querySelector<HTMLInputElement>("#prize-code");
const statusEl = document.querySelector<HTMLElement>("#prize-status");
const result = document.querySelector<HTMLElement>("#prize-result");
const loadingEl = document.querySelector<HTMLElement>("#prize-loading");
const personEl = document.querySelector<HTMLElement>("#award-person-heading");
const placementEl = document.querySelector<HTMLElement>("#award-placement");
const positionBadge = document.querySelector<HTMLElement>("#award-position-badge");
const prizeEl = document.querySelector<HTMLElement>("#award-prize");
const descEl = document.querySelector<HTMLElement>("#award-description");
const sponsorLogoEl = document.querySelector<HTMLImageElement>("#award-sponsor-logo");
const sponsorNameEl = document.querySelector<HTMLElement>("#award-sponsor");
const codeNode = document.querySelector<HTMLElement>("#award-code");
const qrContainer = document.querySelector<HTMLElement>("#award-qr");
const verifyLink = document.querySelector<HTMLAnchorElement>("#award-verify-link");
const downloadButton = document.querySelector<HTMLButtonElement>("#download-card");
const shareButton = document.querySelector<HTMLButtonElement>("#share-award");
const copyLinkButton = document.querySelector<HTMLButtonElement>("#copy-link");

/* ── Estado ──────────────────────────────────── */

let payload: PublicPayload | null = null;
let currentAward: PublicAward | null = null;
let currentAssets: AwardAssets | null = null;

/* ── Helpers UI ──────────────────────────────── */

function setStatus(message: string, isError = false): void {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("prize-status--error", isError);
}

function setLoading(loading: boolean): void {
  if (loadingEl) loadingEl.hidden = !loading;
}

function permalinkFor(code: string): string {
  const url = new URL("/premios/", window.location.origin);
  url.searchParams.set("code", code);
  return url.toString();
}

/**
 * Resuelve el Sponsor a partir de la lista de payload.
 */
function resolveSponsor(award: PublicAward, sponsors: Sponsor[]): Sponsor | undefined {
  return sponsors.find(
    (s) => s.id === award.sponsorId || s.name === award.sponsorName
  );
}

/* ── Render award ────────────────────────────── */

async function renderAward(award: PublicAward): Promise<void> {
  currentAward = award;

  if (!payload) throw new Error("Payload no cargado.");

  const sponsor = resolveSponsor(award, payload.sponsors);
  const permalink = permalinkFor(award.shareCode);

  /* Construir view model */
  const vm = buildAwardViewModel(award, payload.event, sponsor, permalink);

  /* Cargar assets */
  const assets = await loadAwardAssets(sponsor?.logo);
  currentAssets = assets;

  /* ── Poblar HTML ── */

  if (personEl) personEl.textContent = vm.participantName;
  if (placementEl) placementEl.textContent = vm.categoryLabel;
  if (positionBadge) positionBadge.textContent = vm.positionLabel;
  if (prizeEl) prizeEl.textContent = vm.prizeTitle;
  if (descEl) descEl.textContent = vm.prizeDescription;
  if (sponsorNameEl) sponsorNameEl.textContent = vm.sponsorName;

  /* Sponsor logo */
  if (sponsorLogoEl && vm.sponsorLogo) {
    sponsorLogoEl.src = vm.sponsorLogo;
    sponsorLogoEl.hidden = false;
    sponsorLogoEl.alt = `Logotipo de ${vm.sponsorName}`;
  } else if (sponsorLogoEl) {
    sponsorLogoEl.hidden = true;
  }

  if (codeNode) codeNode.textContent = vm.shareCode;
  if (verifyLink) {
    verifyLink.href = vm.permalink;
  }

  /* QR */
  if (qrContainer) {
    qrContainer.replaceChildren();
    const canvas = document.createElement("canvas");
    qrContainer.append(canvas);
    await QRCode.toCanvas(canvas, vm.permalink, {
      width: 260,
      margin: 3,
      color: { dark: "#121110", light: "#F7E6D0" },
    });
  }

  /* OG tags */
  updateForAward(
    vm.participantName,
    vm.prizeTitle,
    vm.categoryLabel,
    vm.position
  );

  if (result) result.hidden = false;
  setStatus("");
}

/* ── Lookup ──────────────────────────────────── */

async function lookup(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;

  setLoading(true);
  if (result) result.hidden = true;
  currentAssets = null;
  setStatus("Buscando premio…");

  try {
    payload ??= await loadPublicData();

    const award = payload.awards.find(
      (candidate) => candidate.shareCode.toUpperCase() === normalized
    );

    if (!award) {
      currentAward = null;
      resetDefaults();
      setLoading(false);
      setStatus("No encontramos un premio publicado con ese código.", true);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("code", award.shareCode);
    history.replaceState({}, "", url);

    await renderAward(award);
  } catch (err) {
    resetDefaults();
    setStatus(
      err instanceof Error
        ? err.message
        : "No fue posible consultar premios en este momento.",
      true
    );
  } finally {
    setLoading(false);
  }
}

/* ── Eventos ──────────────────────────────────── */

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  void lookup(codeInput?.value ?? "");
});

downloadButton?.addEventListener("click", () => {
  if (!currentAward || !currentAssets) return;
  if (!payload) return;

  const sponsor = resolveSponsor(currentAward, payload.sponsors);
  const vm = buildAwardViewModel(
    currentAward,
    payload.event,
    sponsor,
    permalinkFor(currentAward.shareCode)
  );

  downloadButton.ariaBusy = "true";
  void downloadPrizeCard(vm, currentAssets).finally(() => {
    downloadButton.ariaBusy = "false";
  });
});

shareButton?.addEventListener("click", async () => {
  if (!currentAward || !currentAssets) return;
  if (!payload) return;

  const sponsor = resolveSponsor(currentAward, payload.sponsors);
  const vm = buildAwardViewModel(
    currentAward,
    payload.event,
    sponsor,
    permalinkFor(currentAward.shareCode)
  );

  /* Web Share Level 2: intentar compartir PNG */
  if (navigator.canShare?.({ files: [new File([], "")] })) {
    try {
      const file = await createPrizeCardFile(vm, currentAssets);
      await navigator.share({
        title: `Reconocimiento — ${vm.participantName}`,
        text: `${vm.participantName} — ${vm.prizeTitle} • Hamburguesa Nómada 5º aniversario`,
        files: [file],
        url: vm.permalink,
      });
      return;
    } catch {
      /* fallback silencioso a compartir enlace */
    }
  }

  /* Fallback: compartir enlace */
  if (navigator.share) {
    await navigator.share({
      title: `Reconocimiento — ${vm.participantName}`,
      text: `${vm.participantName} — ${vm.prizeTitle} • Hamburguesa Nómada 5º aniversario`,
      url: vm.permalink,
    });
    return;
  }

  /* No Web Share — copiar enlace */
  await navigator.clipboard.writeText(vm.permalink);
  setStatus("Enlace copiado al portapapeles.");
});

copyLinkButton?.addEventListener("click", async () => {
  if (!currentAward) return;
  const url = permalinkFor(currentAward.shareCode);
  await navigator.clipboard.writeText(url);
  setStatus("Enlace copiado al portapapeles.");
});

/* ── Auto-lookup desde URL ───────────────────── */

const initialCode = new URLSearchParams(window.location.search).get("code");
if (initialCode && codeInput) {
  codeInput.value = initialCode;
  void lookup(initialCode);
}
