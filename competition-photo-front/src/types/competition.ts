export type CompetitionStatus = 'draft' | 'published' | 'archived';

export interface CompetitionStage {
  id: string;
  competitionId: string;
  name: string;
  sortOrder: number;
  stageDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Competition {
  id: string;
  slug: string;
  title: string;
  type: string;
  city?: string | null;
  venue?: string | null;
  description?: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  status: CompetitionStatus;
  organizerId: string;
  coverUrl?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  stages: CompetitionStage[];
  photosCount?: number;
  organizerLogin: string;
  organizerFullName?: string | null;
}