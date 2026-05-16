export type PhotoVariant = 'original' | 'watermarked' | 'preview';
export type BibSource = 'manual' | 'ocr';

export interface PhotoVersion {
  id: string;
  photoId: string;
  variant: PhotoVariant;
  url?: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface PhotoBib {
  id: string;
  photoId: string;
  bibValue: string;
  normalizedBib: string;
  source: BibSource;
  confidence?: number | null;
  createdByUserId?: string | null;
  createdAt: string;
}

export type BibRecognitionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'not_found'
  | 'failed';

export interface Photo {
  id: string;
  competitionId: string;
  stageId?: string | null;
  authorUserId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  dayDate?: string | null;
  width?: number | null;
  height?: number | null;
  primaryBib?: string | null;
  bibRecognitionStatus: BibRecognitionStatus;
  bibRecognitionError?: string | null;
  watermarkRequired: boolean;
  createdAt: string;
  updatedAt: string;

  previewUrl?: string | null;
  watermarkedUrl?: string | null;
  canDownloadOriginal: boolean;
  versions: PhotoVersion[];
  bibs: PhotoBib[];
  authorLogin: string;
  authorFullName?: string | null;
}