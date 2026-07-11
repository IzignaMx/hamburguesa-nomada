import QRCode from "qrcode";
import type { EventData, PublicAward } from "../lib/types";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;"
    };
    return map[character] ?? character;
  });
}

function wrapText(value: string, maxLength = 28): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function createPrizeCardSvg(
  award: PublicAward,
  event: EventData,
  permalink: string
): Promise<string> {
  const qr = await QRCode.toDataURL(permalink, {
    width: 320,
    margin: 3,
    color: {
      dark: "#191518",
      light: "#F1ECE6"
    }
  });

  const prizeLines = wrapText(award.prizeTitle);
  const prizeText = prizeLines
    .map(
      (line, index) =>
        `<tspan x="540" dy="${index === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <rect width="1080" height="1350" fill="#D6B7C2"/>
      <circle cx="160" cy="180" r="120" fill="none" stroke="#C35834" stroke-width="18"/>
      <circle cx="940" cy="1150" r="170" fill="none" stroke="#E487A0" stroke-width="22"/>
      <path d="M90 310 C300 250 390 360 560 300 S850 220 1010 320" fill="none" stroke="#191518" stroke-width="14"/>
      <text x="540" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#4B3D4B">
        HAMBURGUESA NÓMADA
      </text>
      <text x="540" y="205" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="78" fill="#191518">
        5º ANIVERSARIO
      </text>
      <text x="540" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#4B3D4B">
        RECONOCIMIENTO DIGITAL
      </text>
      <text x="540" y="500" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="68" fill="#191518">
        ${escapeXml(award.participantName)}
      </text>
      <text x="540" y="575" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="#4B3D4B">
        ${escapeXml(award.category)} · Posición ${award.position}
      </text>
      <text x="540" y="700" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="54" fill="#191518">
        ${prizeText}
      </text>
      <text x="540" y="865" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#4B3D4B">
        Patrocina: ${escapeXml(award.sponsorName)}
      </text>
      <image href="${qr}" x="390" y="910" width="300" height="300"/>
      <text x="540" y="1255" text-anchor="middle" font-family="monospace" font-size="28" fill="#191518">
        ${escapeXml(award.shareCode)}
      </text>
      <text x="540" y="1305" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#4B3D4B">
        Powered by IzignaMx · ${escapeXml(event.date)}
      </text>
    </svg>
  `;
}

export async function downloadPrizeCard(
  award: PublicAward,
  event: EventData,
  permalink: string
): Promise<void> {
  const svg = await createPrizeCardSvg(award, event, permalink);
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
    canvas.width = 1080;
    canvas.height = 1350;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas no disponible.");

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No fue posible crear PNG."));
      }, "image/png");
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `premio-${award.shareCode}.png`;
    link.click();
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
