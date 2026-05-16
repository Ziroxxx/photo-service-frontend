import { API_ROUTES } from '../shared/constants';
import { apiFetch, parseApiError } from './http';

function extractFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallback;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(objectUrl);
}

export async function downloadPhoto(photoId: string) {
  const response = await apiFetch(API_ROUTES.photos.downloadSingle(photoId), {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const blob = await response.blob();
  const filename = extractFilename(
    response.headers.get('Content-Disposition'),
    `photo-${photoId}.jpg`,
  );

  triggerBlobDownload(blob, filename);
}

export async function downloadPhotosBatch(photoIds: string[]) {
  if (photoIds.length === 0) {
    throw new Error('Нет фотографий для скачивания');
  }

  const response = await apiFetch(API_ROUTES.photos.downloadBatch, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photoIds }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const blob = await response.blob();
  const defaultName = photoIds.length === 1 ? `photo-${photoIds[0]}.jpg` : 'photos.zip';
  const filename = extractFilename(
    response.headers.get('Content-Disposition'),
    defaultName,
  );

  triggerBlobDownload(blob, filename);
}