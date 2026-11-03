/**
 * Central API Client for SubGame Backend (Django REST Framework / PostgreSQL)
 */
export const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'subgame.uz' || window.location.hostname.endsWith('.subgame.uz'))
    ? ''
    : 'https://api.subgame.uz');

const API_ROOT = BACKEND_API_URL.replace(/\/+$/, '');

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

/**
 * Failed backend request. `status` is 0 when the server could not be reached at all.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = localStorage.getItem('subgame_refresh_token');
  if (!refresh) return false;

  const res = await fetch(`${API_ROOT}/api/v1/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  if (!data.access) return false;
  setTokens(data.access, data.refresh);
  return true;
}

function send(url: string, options: RequestInit): Promise<Response> {
  const token = getAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

/**
 * DRF reports validation problems as { field: ['message'] } rather than { error: 'message' }.
 */
function describeError(data: any): string {
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    const [field, messages] = Object.entries(data)[0] || [];
    if (field) return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
  }
  return 'Server xatolik qaytardi.';
}

/**
 * Sends a request and throws ApiError on any failure. Use for writes, so a failed
 * action is shown to the admin or user instead of looking like a success.
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_ROOT}/${endpoint.replace(/^\/+/, '')}`;

  let res: Response;
  try {
    res = await send(url, options);
    if (res.status === 401 && (await refreshAccessToken())) {
      res = await send(url, options);
    }
  } catch {
    throw new ApiError(0, 'Serverga ulanib bo‘lmadi. Internet aloqangizni tekshiring.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, describeError(data), data);
  }
  return data as T;
}

/**
 * Read helper for data that has a sensible empty state: returns null instead of throwing.
 */
export async function fetchFromBackend<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    return await apiRequest<T>(endpoint, options);
  } catch (err) {
    console.warn(`[Backend API] Request to ${endpoint} failed:`, err);
    return null;
  }
}

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

function uploadOnce(file: File, folder: string, onProgress: (percent: number) => void): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);

    // XMLHttpRequest because fetch cannot report upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_ROOT}/api/v1/games/admin/upload/`);
    const token = getAccessToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new ApiError(0, 'Serverga ulanib bo‘lmadi.'));
    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON bodies come from nginx, e.g. 413 when the file is over its size limit
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else if (xhr.status === 413) {
        reject(new ApiError(413, 'Fayl hajmi juda katta.'));
      } else {
        reject(new ApiError(xhr.status, describeError(data), data));
      }
    };
    xhr.send(body);
  });
}

/**
 * Uploads a file to the backend's media storage (admins only).
 */
export async function uploadAdminFile(
  file: File,
  folder: string,
  onProgress: (percent: number) => void
): Promise<UploadedFile> {
  try {
    return await uploadOnce(file, folder, onProgress);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && (await refreshAccessToken())) {
      return uploadOnce(file, folder, onProgress);
    }
    throw err;
  }
}
