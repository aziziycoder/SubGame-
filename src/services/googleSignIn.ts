const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '542403988321-67fapm1qe6oqih3rvl8obu9hqpacuf4v.apps.googleusercontent.com';

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Google kirish xizmatini yuklab bo‘lmadi.'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens the Google account popup and resolves with an access token for the backend to verify.
 * The token flow is used because, unlike the ID-token button, it can start from our own buttons.
 */
export async function requestGoogleAccessToken(): Promise<string> {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: (response: { access_token?: string; error?: string }) => {
        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject(new Error(response.error || 'Google orqali kirish amalga oshmadi.'));
        }
      },
      error_callback: (error: { type?: string }) => {
        reject(new Error(error?.type || 'Google oynasi yopildi.'));
      },
    });
    client.requestAccessToken();
  });
}
