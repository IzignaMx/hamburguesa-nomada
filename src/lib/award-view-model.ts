import type { EventData, PublicAward, Sponsor } from "./types";

export interface AwardViewModel {
  /** Nombre público del participante */
  participantName: string;
  /** Líneas envueltas del nombre para SVG */
  participantLines: string[];
  /** Etiqueta de categoría (ej. "Trans / N.B.") */
  categoryLabel: string;
  /** Posición como texto (ej. "Posición 1") */
  positionLabel: string;
  /** Número de posición (ej. "1") */
  positionNumber: string;
  /** Título del premio */
  prizeTitle: string;
  /** Líneas envueltas del título del premio para SVG */
  prizeLines: string[];
  /** Descripción textual del premio */
  prizeDescription: string;
  /** Líneas envueltas de la descripción para SVG */
  descriptionLines: string[];
  /** Nombre público del patrocinador */
  sponsorName: string;
  /** Logo URL del patrocinador (puede ser undefined si no hay logo público) */
  sponsorLogo?: string;
  /** Código de verificación */
  shareCode: string;
  /** Permalink completo */
  permalink: string;
  /** Nombre del evento */
  eventName: string;
  /** Edición del evento */
  eventEdition: number;
  /** Fecha del evento */
  eventDate: string;
  /** Posición numérica para determinar acento */
  position: number;
}

/**
 * Construye un AwardViewModel a partir de los datos crudos.
 * Todas las transformaciones de formato viven aquí, no duplicadas en HTML/SVG.
 */
export function buildAwardViewModel(
  award: PublicAward,
  event: EventData,
  sponsor: Sponsor | undefined,
  permalink: string
): AwardViewModel {
  return {
    participantName: award.participantName,
    participantLines: [award.participantName],
    categoryLabel: award.category,
    positionLabel: `Posición ${award.position}`,
    positionNumber: String(award.position),
    prizeTitle: award.prizeTitle,
    prizeLines: [award.prizeTitle],
    prizeDescription: award.prizeDescription ?? "",
    descriptionLines: award.prizeDescription ? [award.prizeDescription] : [],
    sponsorName: sponsor?.name ?? award.sponsorName,
    sponsorLogo: sponsor?.logo,
    shareCode: award.shareCode,
    permalink,
    eventName: event.name,
    eventEdition: event.edition,
    eventDate: event.date,
    position: award.position,
  };
}
