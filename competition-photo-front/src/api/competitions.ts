import { API_ROUTES } from '../shared/constants';
import { apiFetch, apiJson, apiVoid, parseApiError } from './http';
import type { Competition, CompetitionStage, CompetitionStatus } from '../types/competition';

export interface CompetitionFormValues {
    slug: string;
    title: string;
    type: string;
    city: string;
    venue: string;
    description: string;
    startAt: string;
    endAt: string;
    timezone: string;
    status: CompetitionStatus;
    coverFile: File | null;
    removeCover: boolean;
  }

export interface StageFormValues {
  id?: string;
  name: string;
  sortOrder: number;
  stageDate: string;
  isActive: boolean;
}

function appendIfNotEmpty(formData: FormData, key: string, value?: string | null) {
  if (value && value.trim() !== '') {
    formData.append(key, value.trim());
  }
}

function buildCompetitionFormData(values: CompetitionFormValues) {
    const formData = new FormData();
  
    formData.append('slug', values.slug.trim());
    formData.append('title', values.title.trim());
    formData.append('type', values.type.trim());
    appendIfNotEmpty(formData, 'city', values.city);
    appendIfNotEmpty(formData, 'venue', values.venue);
    appendIfNotEmpty(formData, 'description', values.description);
    formData.append('startAt', new Date(values.startAt).toISOString());
    formData.append('endAt', new Date(values.endAt).toISOString());
    formData.append('timezone', values.timezone.trim());
    formData.append('status', values.status);
  
    if (values.coverFile) {
      formData.append('cover', values.coverFile);
    }
  
    if (values.removeCover) {
      formData.append('removeCover', 'true');
    }
  
    return formData;
  }

export async function getCompetitions(): Promise<Competition[]> {
  const data = await apiJson<{ items: Competition[] }>(API_ROUTES.competitions.list, {
    method: 'GET',
  });

  return data.items ?? [];
}

export async function getCompetitionById(id: string): Promise<Competition> {
    return apiJson<Competition>(API_ROUTES.competitions.getById(id), {
      method: 'GET',
    });
  }

export async function createCompetition(values: CompetitionFormValues): Promise<Competition> {
  const response = await apiFetch(API_ROUTES.competitions.create, {
    method: 'POST',
    body: buildCompetitionFormData(values),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function updateCompetition(id: string, values: CompetitionFormValues): Promise<Competition> {
  const response = await apiFetch(API_ROUTES.competitions.update(id), {
    method: 'PATCH',
    body: buildCompetitionFormData(values),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function deleteCompetition(id: string): Promise<void> {
  await apiVoid(API_ROUTES.competitions.delete(id), {
    method: 'DELETE',
  });
}

export async function createStage(
  competitionId: string,
  payload: Omit<StageFormValues, 'id'>,
): Promise<CompetitionStage> {
  return apiJson<CompetitionStage>(API_ROUTES.competitions.createStage(competitionId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      sortOrder: payload.sortOrder,
      stageDate: payload.stageDate || undefined,
      isActive: payload.isActive,
    }),
  });
}

export async function updateStage(
  competitionId: string,
  stageId: string,
  payload: Omit<StageFormValues, 'id'>,
): Promise<CompetitionStage> {
  return apiJson<CompetitionStage>(API_ROUTES.competitions.updateStage(competitionId, stageId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      sortOrder: payload.sortOrder,
      stageDate: payload.stageDate || undefined,
      isActive: payload.isActive,
    }),
  });
}

export async function deleteStage(competitionId: string, stageId: string): Promise<void> {
  await apiVoid(API_ROUTES.competitions.deleteStage(competitionId, stageId), {
    method: 'DELETE',
  });
}