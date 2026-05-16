import type { Photo } from '../types/photo';
import { FAVORITES_CHANGED_EVENT, STORAGE_KEYS } from '../shared/constants';

export interface FavoritePhotoItem {
  photo: Photo;
  competitionTitle: string;
  stageName?: string;
  stageDate?: string | null;
  addedAt: string;
}

function notifyFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}

function saveFavoritePhotos(items: FavoritePhotoItem[]) {
  localStorage.setItem(STORAGE_KEYS.favoritePhotos, JSON.stringify(items));
  notifyFavoritesChanged();
}

export function getFavoritePhotos(): FavoritePhotoItem[] {
  const raw = localStorage.getItem(STORAGE_KEYS.favoritePhotos);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as FavoritePhotoItem[];
  } catch {
    return [];
  }
}

export function isFavoritePhoto(photoId: string): boolean {
  return getFavoritePhotos().some((item) => item.photo.id === photoId);
}

export function addFavoritePhoto(item: FavoritePhotoItem) {
  const current = getFavoritePhotos();

  if (current.some((entry) => entry.photo.id === item.photo.id)) {
    return;
  }

  saveFavoritePhotos([item, ...current]);
}

export function removeFavoritePhoto(photoId: string) {
  const current = getFavoritePhotos();
  saveFavoritePhotos(current.filter((item) => item.photo.id !== photoId));
}

export function toggleFavoritePhoto(item: FavoritePhotoItem) {
  if (isFavoritePhoto(item.photo.id)) {
    removeFavoritePhoto(item.photo.id);
    return;
  }

  addFavoritePhoto(item);
}

export function subscribeFavoritesChanged(listener: () => void) {
  window.addEventListener(FAVORITES_CHANGED_EVENT, listener);
  return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, listener);
}