export interface CompetitionAccessGrant {
    id: string;
    competitionId: string;
    userId: string;
    canViewPhotos: boolean;
    canDownloadOriginal: boolean;
    grantedByUserId: string;
    expiresAt?: string | null;
    revokedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }