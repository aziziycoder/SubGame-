export type TranslationRequestStatus = 'open' | 'accepted' | 'rejected' | 'done';

export const TRANSLATION_REQUEST_STATUS_LABELS: Record<TranslationRequestStatus, string> = {
  open: 'Ovoz yig‘ilmoqda',
  accepted: 'Tarjimaga olindi',
  rejected: 'Rad etildi',
  done: 'Tarjima qilindi',
};

export interface SiteGameSummary {
  slug: string;
  title: string;
  subtitleStatus: string;
}

export interface TranslationRequest {
  id: number;
  steamAppId: number;
  title: string;
  imageUrl: string;
  status: TranslationRequestStatus;
  votes: number;
  hasVoted: boolean;
  /** Place in the whole ranking; null when the list was filtered by a search. */
  rank: number | null;
  game: SiteGameSummary | null;
  createdAt: string;
  /** Only sent to admins. */
  adminNote?: string;
}

export interface TranslationRequestPage {
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  results: TranslationRequest[];
}

export interface SteamSearchResult {
  steamAppId: number;
  title: string;
  imageUrl: string;
  /** Set when the game is already on the site. */
  siteGame: SiteGameSummary | null;
  /** Set when someone has already requested it. */
  request: TranslationRequest | null;
}

export const steamStoreUrl = (steamAppId: number) => `https://store.steampowered.com/app/${steamAppId}/`;
