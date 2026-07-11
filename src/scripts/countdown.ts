/**
 * Countdown client — maneja 3 estados automáticos:
 *
 *   PRE    → countdown regresivo a la hora del evento
 *   LIVE   → "EVENTO EN CURSO" con indicador pulsante
 *   ENDED  → mensaje de agradecimiento
 *
 * Los estados se verifican cada segundo. Las transiciones son
 * instantáneas y respetan prefers-reduced-motion.
 */

const SEC = 1000;
const MIN = 60 * SEC;
const HR  = 60 * MIN;
const DAY = 24 * HR;

interface StateElements {
  wrap: HTMLElement;
  timer: HTMLElement;
  live: HTMLElement;
  ended: HTMLElement;
}

function q(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`countdown: #${id} not found`);
  return el;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function show(el: HTMLElement): void {
  el.removeAttribute("hidden");
}

function hide(el: HTMLElement): void {
  el.setAttribute("hidden", "");
}

type Phase = "pre" | "live" | "ended";

function getPhase(now: number, start: number, end: number): Phase {
  if (now < start) return "pre";
  if (now < end)  return "live";
  return "ended";
}

function tick(
  diff: number,
  daysEl: HTMLElement,
  hoursEl: HTMLElement,
  minsEl: HTMLElement,
  secsEl: HTMLElement,
): void {
  const d = Math.floor(diff / DAY);
  const h = Math.floor((diff % DAY) / HR);
  const m = Math.floor((diff % HR) / MIN);
  const s = Math.floor((diff % MIN) / SEC);

  daysEl.textContent  = pad(d);
  hoursEl.textContent = pad(h);
  minsEl.textContent  = pad(m);
  secsEl.textContent  = pad(s);
}

export function initCountdown(eventStart: string, eventEnd: string): void {
  const start = new Date(eventStart).getTime();
  const end   = new Date(eventEnd).getTime();

  const el: StateElements = {
    wrap:  q("countdown"),
    timer: q("countdown-timer"),
    live:  q("countdown-live"),
    ended: q("countdown-ended"),
  };

  const daysEl   = q("countdown-days");
  const hoursEl  = q("countdown-hours");
  const minsEl   = q("countdown-mins");
  const secsEl   = q("countdown-secs");

  let prevPhase: Phase | null = null;

  function update(): void {
    const now = Date.now();
    const phase = getPhase(now, start, end);

    if (phase !== prevPhase) {
      prevPhase = phase;
      el.wrap.dataset.countdownState = phase;

      switch (phase) {
        case "pre":
          show(el.timer);
          hide(el.live);
          hide(el.ended);
          break;
        case "live":
          hide(el.timer);
          show(el.live);
          hide(el.ended);
          break;
        case "ended":
          hide(el.timer);
          hide(el.live);
          show(el.ended);
          break;
      }
    }

    if (phase === "pre") {
      tick(start - now, daysEl, hoursEl, minsEl, secsEl);
    }
  }

  update();
  setInterval(update, 1000);
}
