import { apiRequest } from './apiClient';
import type {
  SteamSearchResult,
  TranslationRequest,
  TranslationRequestPage,
  TranslationRequestStatus,
} from '../types/translationRequest';

/** `active` is open and accepted requests together: the ones still worth voting on. */
export type TranslationRequestFilter = 'active' | 'all' | TranslationRequestStatus;

export async function searchSteamGames(query: string): Promise<SteamSearchResult[]> {
  const data = await apiRequest<{ results: SteamSearchResult[] }>(
    `api/v1/issues/requests/search/?q=${encodeURIComponent(query)}`
  );
  return data.results;
}

export function getTranslationRequests(
  filter: TranslationRequestFilter,
  page = 1,
  search = ''
): Promise<TranslationRequestPage> {
  const params = new URLSearchParams({ status: filter, page: String(page) });
  if (search.trim()) params.set('search', search.trim());
  return apiRequest<TranslationRequestPage>(`api/v1/issues/requests/?${params}`);
}

/** Votes for a Steam game. The first vote for a game creates its request. */
export function voteForGame(steamAppId: number): Promise<TranslationRequest> {
  return apiRequest<TranslationRequest>('api/v1/issues/requests/vote/', {
    method: 'POST',
    body: JSON.stringify({ steamAppId }),
  });
}

/** Takes the vote back. `request` is null when that was the last vote and the request is gone. */
export function removeVote(requestId: number): Promise<{ deleted: boolean; request: TranslationRequest | null }> {
  return apiRequest(`api/v1/issues/requests/${requestId}/vote/`, { method: 'DELETE' });
}

export function updateTranslationRequest(
  requestId: number,
  changes: { status?: TranslationRequestStatus; gameSlug?: string | null; adminNote?: string }
): Promise<TranslationRequest> {
  return apiRequest<TranslationRequest>(`api/v1/issues/admin/requests/${requestId}/`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export async function deleteTranslationRequest(requestId: number): Promise<void> {
  await apiRequest(`api/v1/issues/admin/requests/${requestId}/`, { method: 'DELETE' });
}
