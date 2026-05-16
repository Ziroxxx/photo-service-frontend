import { API_ROUTES } from '../shared/constants';
import { apiJson, apiVoid } from './http';
import type { CompetitionAccessGrant } from '../types/access';

type GetCompetitionAccessResponse =
  | CompetitionAccessGrant[]
  | { items: CompetitionAccessGrant[] };

export async function getCompetitionAccess(
  competitionId: string,
): Promise<CompetitionAccessGrant[]> {
  const data = await apiJson<GetCompetitionAccessResponse>(
    API_ROUTES.competitions.access(competitionId),
    {
      method: 'GET',
    },
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}

export async function createCompetitionAccess(
  competitionId: string,
  payload: {
    userId: string;
    canDownloadOriginal: boolean;
    expiresAt?: string | null;
  },
): Promise<CompetitionAccessGrant> {
  return apiJson<CompetitionAccessGrant>(API_ROUTES.competitions.access(competitionId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: payload.userId,
      canViewPhotos: true,
      canDownloadOriginal: payload.canDownloadOriginal,
      expiresAt: payload.expiresAt ?? undefined,
    }),
  });
}

export async function updateCompetitionAccess(
  competitionId: string,
  grantId: string,
  payload: {
    canDownloadOriginal: boolean;
    expiresAt?: string | null;
  },
): Promise<CompetitionAccessGrant> {
  return apiJson<CompetitionAccessGrant>(
    API_ROUTES.competitions.updateAccess(competitionId, grantId),
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        canDownloadOriginal: payload.canDownloadOriginal,
        expiresAt: payload.expiresAt ?? undefined,
      }),
    },
  );
}

export async function deleteCompetitionAccess(
  competitionId: string,
  grantId: string,
): Promise<void> {
  await apiVoid(API_ROUTES.competitions.deleteAccess(competitionId, grantId), {
    method: 'DELETE',
  });
}