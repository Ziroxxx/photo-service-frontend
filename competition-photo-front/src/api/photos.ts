import { BACKEND_URL } from '../shared/constants';
import { getAccessToken, clearAuth } from '../app/authStorage';
import { redirectToAuth, refreshAccessTokenOrNull, apiVoid } from './http';
import type { Photo } from '../types/photo';

export interface GetCompetitionPhotosParams {
  stageId?: string;
  bib?: string;
  page?: number;
  pageSize?: number;
}

export interface GetCompetitionPhotosResponse {
  items: Photo[];
  page: number;
  pageSize: number;
  total: number;
}

export interface UploadCompetitionPhotosPayload {
  competitionId: string;
  stageId?: string;
  files: File[];
  onProgress?: (progress: number, phase: 'uploading' | 'processing') => void;
}

export interface UploadPhotoItemResult {
  fileName: string;
  photo?: Photo;
  error?: string;
}

export interface UploadPhotosResult {
  items: UploadPhotoItemResult[];
  failed: UploadPhotoItemResult[];
}

function buildCompetitionPhotosUrl(
  competitionId: string,
  params: GetCompetitionPhotosParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.stageId) {
    searchParams.set('stageId', params.stageId);
  }

  if (params.bib && params.bib.trim() !== '') {
    searchParams.set('bib', params.bib.trim());
  }

  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  if (params.pageSize) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  const query = searchParams.toString();
  const base = `${BACKEND_URL}/competitions/${encodeURIComponent(competitionId)}/photos`;

  return query ? `${base}?${query}` : base;
}

export async function getCompetitionPhotos(
  competitionId: string,
  params: GetCompetitionPhotosParams = {},
): Promise<GetCompetitionPhotosResponse> {
  const response = await fetch(buildCompetitionPhotosUrl(competitionId, params), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ''}`,
    },
  });

  if (!response.ok) {
    let message = 'Произошла ошибка';
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

function parseXhrError(xhr: XMLHttpRequest): string {
  try {
    const data = JSON.parse(xhr.responseText) as { error?: string };
    return data.error || 'Произошла ошибка при загрузке';
  } catch {
    return 'Произошла ошибка при загрузке';
  }
}

function performUploadRequest(
  token: string,
  payload: UploadCompetitionPhotosPayload,
): Promise<UploadPhotosResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    if (payload.stageId) {
      formData.append('stageId', payload.stageId);
    }

    for (const file of payload.files) {
      formData.append('files', file);
    }

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${BACKEND_URL}/competitions/${encodeURIComponent(payload.competitionId)}/photos/upload`,
    );
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const percent = Math.round((event.loaded / event.total) * 100);
      payload.onProgress?.(percent, 'uploading');
    };

    xhr.upload.onload = () => {
      payload.onProgress?.(100, 'processing');
    };

    xhr.onerror = () => {
      reject(new Error('Не удалось загрузить файлы'));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadPhotosResult;
          resolve(data);
        } catch {
          reject(new Error('Некорректный ответ сервера'));
        }
        return;
      }

      if (xhr.status === 401) {
        reject(new Error('__unauthorized__'));
        return;
      }

      reject(new Error(parseXhrError(xhr)));
    };

    xhr.send(formData);
  });
}

export async function uploadCompetitionPhotos(
  payload: UploadCompetitionPhotosPayload,
): Promise<UploadPhotosResult> {
  const currentToken = getAccessToken();

  if (!currentToken) {
    redirectToAuth();
    throw new Error('Не найден access token');
  }

  try {
    return await performUploadRequest(currentToken, payload);
  } catch (err) {
    if (!(err instanceof Error) || err.message !== '__unauthorized__') {
      throw err;
    }

    const refreshedToken = await refreshAccessTokenOrNull();

    if (!refreshedToken) {
      clearAuth();
      redirectToAuth();
      throw new Error('Сессия истекла');
    }

    return performUploadRequest(refreshedToken, payload);
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiVoid(`${BACKEND_URL}/photos/${encodeURIComponent(photoId)}`, {
    method: 'DELETE',
  });
}