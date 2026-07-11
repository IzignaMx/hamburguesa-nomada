/**
 * Results — carga y renderiza resultados por categoría
 *
 * Agrupa RaceResult[] por categoría.
 * Muestra podio (top 3) con medallas y posiciones restantes.
 * Sin dependencias externas.
 */
import { loadPublicData } from "./data-client";
import type { PublicPayload, RaceResult } from "../lib/types";

/* ── Elementos del DOM ──────────────────────────── */

const loadingEl = document.querySelector<HTMLElement>("#results-loading");
const emptyEl = document.querySelector<HTMLElement>("#results-empty");
const contentEl = document.querySelector<HTMLElement>("#results-content");

/* ── Medallas ────────────────────────────────────── */

const MEDALS = ["", "🥇", "🥈", "🥉"];

/* ── Helpers ─────────────────────────────────────── */

function groupByCategory(
  results: RaceResult[],
): Record<string, RaceResult[]> {
  const groups: Record<string, RaceResult[]> = {};
  for (const r of results) {
    (groups[r.category] ??= []).push(r);
  }
  // Ordenar por posición dentro de cada grupo
  for (const key of Object.keys(groups)) {
    const group = groups[key];
    if (group) group.sort((a, b) => a.position - b.position);
  }
  return groups;
}

function badgeHtml(medal: string, pos: number): string {
  if (pos === 1) return `<span class="result-badge result-badge--gold" aria-label="Primer lugar">${medal}</span>`;
  if (pos === 2) return `<span class="result-badge result-badge--silver" aria-label="Segundo lugar">${medal}</span>`;
  if (pos === 3) return `<span class="result-badge result-badge--bronze" aria-label="Tercer lugar">${medal}</span>`;
  return `<span class="result-badge result-badge--plain">${pos}</span>`;
}

/* ── Render ──────────────────────────────────────── */

function renderResults(payload: PublicPayload): void {
  const groups = groupByCategory(payload.results);
  const categories = Object.keys(groups);

  if (categories.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  let html = "";

  for (const category of categories) {
    const items = groups[category];
    html += `<section class="result-category">
      <h2 class="result-category__title">${category}</h2>
      <ol class="result-list">`;

    for (const item of items ?? []) {
      const medal = MEDALS[item.position] ?? "";
      html += `<li class="result-item">
        ${badgeHtml(medal, item.position)}
        <span class="result-name">${item.participantName}</span>
        ${item.finishTime ? `<time class="result-time">${item.finishTime}</time>` : ""}
      </li>`;
    }

    html += `</ol></section>`;
  }

  if (contentEl) {
    contentEl.innerHTML = html;
    contentEl.hidden = false;
  }
}

/* ── Main ────────────────────────────────────────── */

async function main(): Promise<void> {
  try {
    const payload = await loadPublicData();

    if (!payload.results || payload.results.length === 0) {
      if (loadingEl) loadingEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (loadingEl) loadingEl.hidden = true;
    renderResults(payload);
  } catch {
    if (loadingEl) {
      loadingEl.innerHTML = "<p>No fue posible cargar los resultados en este momento.</p>";
    }
  }
}

void main();
