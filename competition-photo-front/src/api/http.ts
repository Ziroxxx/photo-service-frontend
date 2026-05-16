import { refresh } from './auth';
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  saveAuth,
} from '../app/authStorage';
import { APP_ROUTES } from '../shared/constants';

let refreshPromise: Promise<string | null> | null = null;
const USER_NOT_ACTIVE_ERROR = 'user is not active';

export function redirectToAuth() {
  if (window.location.pathname !== APP_ROUTES.auth) {
    window.location.href = APP_ROUTES.auth;
  }
}

export function handleAuthBlockingError(message: string) {
  if (message === USER_NOT_ACTIVE_ERROR) {
    clearAuth();
    redirectToAuth();
  }
}

export async function refreshAccessTokenOrNull(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    clearAuth();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await refresh({ refreshToken: currentRefreshToken });
        saveAuth(data);
        return data.accessToken;
      } catch {
        clearAuth();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function buildHeaders(init?: HeadersInit, accessToken?: string | null) {
  const headers = new Headers(init || {});

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || 'Произошла ошибка';
  } catch {
    return 'Произошла ошибка';
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = getAccessToken();

  let response = await fetch(input, {
    ...init,
    headers: buildHeaders(init.headers, accessToken),
  });

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessTokenOrNull();

  if (!newAccessToken) {
    redirectToAuth();
    return response;
  }

  response = await fetch(input, {
    ...init,
    headers: buildHeaders(init.headers, newAccessToken),
  });

  if (response.status === 401) {
    clearAuth();
    redirectToAuth();
  }

  return response;
}

export async function apiJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(input, init);

  if (!response.ok) {
    const message = await parseApiError(response);
    handleAuthBlockingError(message);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiVoid(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<void> {
  const response = await apiFetch(input, init);

  if (!response.ok) {
    const message = await parseApiError(response);
    handleAuthBlockingError(message);
    throw new Error(await parseApiError(response));
  }
}