import type { UserDto } from '../api/auth';
import { AUTH_CHANGED_EVENT, STORAGE_KEYS } from '../shared/constants';

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function saveAuth(data: {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}) {
  localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(data.user));
  notifyAuthChanged();
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  notifyAuthChanged();
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function getCurrentUser(): UserDto | null {
  const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserDto;
  } catch {
    return null;
  }
}

export function subscribeAuthChanged(listener: () => void) {
  window.addEventListener(AUTH_CHANGED_EVENT, listener);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, listener);
}