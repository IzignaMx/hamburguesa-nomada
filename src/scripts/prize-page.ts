import QRCode from "qrcode";
import { loadPublicData } from "./data-client";
import { downloadPrizeCard } from "./prize-card";
import type { PublicAward, PublicPayload } from "../lib/types";

const form = document.querySelector<HTMLFormElement>("#prize-form");
const codeInput = document.querySelector<HTMLInputElement>("#prize-code");
const status = document.querySelector<HTMLElement>("#prize-status");
const result = document.querySelector<HTMLElement>("#prize-result");
const loadingEl = document.querySelector<HTMLElement>("#prize-loading");
const person = document.querySelector<HTMLElement>("#award-person");
const placement = document.querySelector<HTMLElement>("#award-placement");
const prize = document.querySelector<HTMLElement>("#award-prize");
const description = document.querySelector<HTMLElement>("#award-description");
const sponsor = document.querySelector<HTMLElement>("#award-sponsor");
const codeNode = document.querySelector<HTMLElement>("#award-code");
const qrContainer = document.querySelector<HTMLElement>("#award-qr");
const downloadButton = document.querySelector<HTMLButtonElement>("#download-card");
const shareButton = document.querySelector<HTMLButtonElement>("#share-award");

let payload: PublicPayload | null = null;
let currentAward: PublicAward | null = null;

function setStatus(message: string, isError = false): void {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("prize-status--error", isError);
}

function setLoading(loading: boolean): void {
  if (loadingEl) loadingEl.hidden = !loading;
}

function permalinkFor(code: string): string {
  const url = new URL("/premios/", window.location.origin);
  url.searchParams.set("code", code);
  return url.toString();
}

async function renderAward(award: PublicAward): Promise<void> {
  currentAward = award;
  const permalink = permalinkFor(award.shareCode);

  if (person) person.textContent = award.participantName;
  if (placement) {
    placement.textContent = `${award.category} · Posición ${award.position}`;
  }
  if (prize) prize.textContent = award.prizeTitle;
  if (description) description.textContent = award.prizeDescription ?? "";
  if (sponsor) sponsor.textContent = award.sponsorName;
  if (codeNode) codeNode.textContent = award.shareCode;

  if (qrContainer) {
    qrContainer.replaceChildren();
    const canvas = document.createElement("canvas");
    qrContainer.append(canvas);
    await QRCode.toCanvas(canvas, permalink, {
      width: 260,
      margin: 3,
      color: {
        dark: "#191518",
        light: "#F1ECE6"
      }
    });
  }

  if (result) result.hidden = false;
  setStatus("Premio encontrado.");
}

async function lookup(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;

  setLoading(true);
  if (result) result.hidden = true;
  setStatus("Buscando premio…");

  try {
    payload ??= await loadPublicData();
    const award = payload.awards.find(
      (candidate) => candidate.shareCode.toUpperCase() === normalized
    );

    if (!award) {
      currentAward = null;
      setLoading(false);
      setStatus("No encontramos un premio publicado con ese código.", true);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("code", award.shareCode);
    history.replaceState({}, "", url);
    setLoading(false);
    await renderAward(award);
  } catch {
    setLoading(false);
    setStatus("No fue posible consultar premios en este momento.", true);
  }
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  void lookup(codeInput?.value ?? "");
});

downloadButton?.addEventListener("click", () => {
  if (!payload || !currentAward) return;
  void downloadPrizeCard(
    currentAward,
    payload.event,
    permalinkFor(currentAward.shareCode)
  );
});

shareButton?.addEventListener("click", async () => {
  if (!currentAward) return;

  const url = permalinkFor(currentAward.shareCode);
  const shareData = {
    title: `Premio ${currentAward.shareCode}`,
    text: `${currentAward.participantName} recibió ${currentAward.prizeTitle}.`,
    url
  };

  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }

  await navigator.clipboard.writeText(url);
  setStatus("Enlace copiado.");
});

/* ── Auto-lookup desde URL ───────────────────── */

const initialCode = new URLSearchParams(window.location.search).get("code");
if (initialCode && codeInput) {
  codeInput.value = initialCode;
  void lookup(initialCode);
}
