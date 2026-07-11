export interface Place {
  name: string;
  audience?: string;
  address?: string;
  mapUrl?: string;
}

export interface EventData {
  id: string;
  name: string;
  edition: number;
  date: string;
  timezone: string;
  riderMeetingTime: string;
  startTime: string;
  meetingPoint: Place;
  publicStartTime: string;
  publicAdmission: string;
  publicVenue: Place;
  awardsTime?: string;
  awardsVenue: Place;
  feeMxn: number;
  riderAdmissionIncludes?: string;
  instagramUrl: string;
}

export interface Sponsor {
  id: string;
  name: string;
  type: string;
  logo: string;
  url?: string;
  instagram?: string;
  description?: string;
  contribution?: string;
  source?: string;
  needsReplacement?: boolean;
  identificationConfidence?: string;
  sourceGridPosition?: string;
}

export interface Prize {
  prizeId: string;
  title: string;
  description?: string;
  sponsorId: string;
  ruleCategory: string;
  rulePosition: number;
  quantity: number;
  priority: number;
  allowMultiple: boolean;
  active: boolean;
}

export interface RaceResult {
  participantId: string;
  participantName: string;
  category: string;
  position: number;
  finishTime?: string;
  status: string;
}

export interface PublicAward {
  awardId: string;
  shareCode: string;
  participantName: string;
  category: string;
  position: number;
  prizeId: string;
  prizeTitle: string;
  prizeDescription?: string;
  sponsorId: string;
  sponsorName: string;
  assignedAt: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}

export interface PublicPayload {
  version: string;
  generatedAt: string;
  event: EventData;
  sponsors: Sponsor[];
  prizes: Prize[];
  results: RaceResult[];
  awards: PublicAward[];
}
