export type SubtitleStatus = 'Tayyor' | 'Tekshirilmoqda' | 'Ishlab chiqilmoqda' | 'Jarayonda' | 'Rejada' | 'Tez kunda';

export interface SystemRequirements {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  directX: string;
  storage: string;
  additionalNotes?: string;
}

export interface OfficialStoreLink {
  name: 'Steam' | 'Epic Games' | 'GOG' | 'PlayStation' | 'Xbox' | 'Boshqa';
  url: string;
  priceNote?: string;
}

export interface InstallationStep {
  step: number;
  title: string;
  description: string;
  pathOrCommand?: string;
  note?: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  cover: string;
  cardImage?: string;
  heroImage: string;
  torrentUrl?: string;
  gameplayVideoUrl?: string;
  screenshots: string[];
  shortDescription: string;
  fullDescription: string;
  releaseYear: number;
  developer: string;
  publisher: string;
  genres: string[];
  platforms: ('PC' | 'PlayStation 5' | 'PlayStation 4' | 'Xbox Series X/S' | 'Xbox One')[];
  officialStoreLinks: OfficialStoreLink[];
  price: string; // e.g. "Do‘konda tekshirish" or official price note
  priceNote: string; // Explains game price vs subtitle free/paid
  
  // Subtitle information
  subtitleStatus: SubtitleStatus;
  subtitleLanguage: 'O‘zbekcha (Lotin)' | 'O‘zbekcha (Kirill)' | 'O‘zbekcha';
  subtitleVersion: string;
  subtitleLastUpdated: string;
  subtitleCompatibility: string;
  subtitleFormat: string; // e.g., "ZIP / .loc / .bin"
  subtitleSize?: string;
  subtitleDownloadUrl?: string; // Real or direct link
  subtitlePrice: 'Bepul' | 'Pullik' | 'Tez kunda';
  subtitleTranslationType: string;
  
  // Installation & Requirements
  installationGuide: InstallationStep[];
  knownIssues?: string[];
  minimumRequirements: SystemRequirements;
  recommendedRequirements: SystemRequirements;
  isFeatured: boolean;
  tags?: string[];

  // Launcher integration parameters
  defaultExeName?: string;
  targetFileName?: string;
  targetRelativeDir?: string;
  keyPrefix?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface GameSuggestion {
  gameTitle: string;
  platform: string;
  steamUrl?: string;
  userEmail?: string;
  note?: string;
}

export interface IssueReport {
  gameId: string;
  gameTitle: string;
  issueType: 'Tarjima xatosi' | 'O‘rnatish muammosi' | 'Versiya nomutanosibligi' | 'Boshqa';
  gameVersion?: string;
  description: string;
  userContact?: string;
}
