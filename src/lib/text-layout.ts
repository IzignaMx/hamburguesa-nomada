/**
 * Text Layout — utilidades de layout de texto basadas en
 * CanvasRenderingContext2D.measureText().
 *
 * Todas las funciones operan sobre un contexto 2D precargado con fuente.
 */

export interface TextStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number; /* multiplicador ej. 1.2 */
}

export interface TextLayoutResult {
  lines: string[];
  fits: boolean;
  actualFontSize: number;
}

/**
 * Configura el font de un contexto 2D a partir de TextStyle.
 */
export function applyStyle(ctx: CanvasRenderingContext2D, style: TextStyle): void {
  ctx.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}"`;
}

/**
 * Mide el ancho de un texto en píxeles.
 */
export function measureTextWidth(ctx: CanvasRenderingContext2D, text: string): number {
  return ctx.measureText(text).width;
}

/**
 * Envuelve texto por ancho máximo (píxeles), no por caracteres.
 * Rompe entre palabras; si una palabra excede el ancho, la fuerza a su propia línea.
 */
export function wrapTextByWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (measureTextWidth(ctx, next) > maxWidth && current) {
      lines.push(current);
      if (lines.length >= maxLines) break;
      current = word;
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

/**
 * Intenta ajustar texto dentro de una caja reduciendo fontSize hasta `minSize`.
 * Retorna líneas envueltas, fontSize final, y si cupo completo.
 */
export function fitTextToBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  maxHeight: number,
  style: TextStyle,
  minSize = 24
): TextLayoutResult {
  let currentSize = style.fontSize;
  let lines: string[] = [];

  while (currentSize >= minSize) {
    applyStyle(ctx, { ...style, fontSize: currentSize });
    lines = wrapTextByWidth(ctx, text, maxWidth, maxLines);
    const totalHeight = lines.length * style.lineHeight * currentSize;

    if (totalHeight <= maxHeight) {
      return {
        lines,
        fits: true,
        actualFontSize: currentSize,
      };
    }

    currentSize -= 2;
  }

  /* Último intento con minSize */
  applyStyle(ctx, { ...style, fontSize: minSize });
  lines = wrapTextByWidth(ctx, text, maxWidth, maxLines);

  return {
    lines,
    fits: lines.length <= maxLines,
    actualFontSize: minSize,
  };
}

/**
 * Trunca líneas con elipsis si exceden maxWidth.
 * Modifica las líneas in-place.
 */
export function truncateLinesWithEllipsis(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number
): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (measureTextWidth(ctx, line) > maxWidth) {
      let truncated = line;
      while (truncated.length > 0 && measureTextWidth(ctx, truncated + "…") > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      lines[i] = truncated + "…";
    }
  }
}
