/**
 * Central API Client for SubGame Backend (Django REST Framework / PostgreSQL)
 */
export const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'https://api.subgame.uz';

export function getAccessToken(): string | null {
  return localStorage.getItem('subgame_access_token');
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem('subgame_access_token', access);
  if (refresh) {
    localStorage.setItem('subgame_refresh_token', refresh);
  }
}

export function clearTokens(): void {
  localStorage.removeItem('subgame_access_token');
  localStorage.removeItem('subgame_refresh_token');
}

export async function fetchFromBackend<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const url = `${BACKEND_API_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const token = getAccessToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, { ...options, headers });

    // Handle token expiration: attempt refresh once if 401
    if (res.status === 401 && token) {
      const refreshToken = localStorage.getItem('subgame_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BACKEND_API_URL.replace(/\/+$/, '')}/api/v1/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.access) {
              setTokens(data.access);
              headers['Authorization'] = `Bearer ${data.access}`;
              const retryRes = await fetch(url, { ...options, headers });
              if (retryRes.ok) {
                return await retryRes.json();
              }
            }
          }
        } catch {
          clearTokens();
        }
      }
      return null;
    }

    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    // Backend offline / not reachable
    console.warn(`[Backend API] Request to ${endpoint} failed:`, err);
    return null;
  }
}
