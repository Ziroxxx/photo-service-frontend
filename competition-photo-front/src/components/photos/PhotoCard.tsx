import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import { Download, Heart, HeartFill, Trash, XLg } from 'react-bootstrap-icons';
import {
  isFavoritePhoto,
  subscribeFavoritesChanged,
  toggleFavoritePhoto,
} from '../../app/favoritesStorage';
import type { Photo } from '../../types/photo';

type FavoriteControlMode = 'toggle' | 'remove' | 'none';

type Props = {
  photo: Photo;
  stageName?: string;
  stageDate?: string | null;
  stageEndDate?: string | null;
  competitionTitle?: string;
  onOpen?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  favoriteControlMode?: FavoriteControlMode;
  onRemoveFavorite?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
};

function getAuthorName(photo: Photo) {
  return photo.authorFullName?.trim() || photo.authorLogin || 'Пусто';
}

function formatStageDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) {
    return 'Пусто';
  }

  const format = (value?: string | null) => {
    if (!value) return '';

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const startText = format(start);
  const endText = format(end);

  if (startText && endText) {
    if (startText === endText) {
      return startText;
    }

    return `${startText} — ${endText}`;
  }

  return startText || endText || 'Пусто';
}

function getPhotoBibValues(photo: Photo) {
  const bibsFromList =
    photo.bibs
      ?.map((bib) => bib.bibValue?.trim())
      .filter((bib): bib is string => Boolean(bib)) ?? [];

  const values = bibsFromList.length > 0
    ? bibsFromList
    : photo.primaryBib
      ? [photo.primaryBib]
      : [];

  return Array.from(new Set(values));
}

function renderBibStatus(photo: Photo) {
  const bibValues = getPhotoBibValues(photo);

  switch (photo.bibRecognitionStatus) {
    case 'pending':
      return <span className="small text-secondary">Ожидает распознавания номера</span>;

    case 'processing':
      return <span className="small text-primary">Распознаётся номер...</span>;

    case 'not_found':
      return <span className="small text-warning">Номер не найден</span>;

    case 'failed':
      return (
        <span className="small text-danger">
          Ошибка распознавания
          {photo.bibRecognitionError ? `: ${photo.bibRecognitionError}` : ''}
        </span>
      );

    case 'completed':
      return (
        <span className="small text-success">
          {bibValues.length > 1 ? 'Номера распознаны' : 'Номер распознан'}
        </span>
      );

    default:
      return null;
  }
}

export default function PhotoCard({
  photo,
  stageName,
  stageDate,
  stageEndDate,
  competitionTitle = '',
  onOpen,
  onDownload,
  onDelete,
  favoriteControlMode = 'toggle',
  onRemoveFavorite,
}: Props) {
  const [favorite, setFavorite] = useState(isFavoritePhoto(photo.id));

  const bibValues = useMemo(() => getPhotoBibValues(photo), [photo]);
  const bibLabel = bibValues.join(', ');

  useEffect(() => {
    setFavorite(isFavoritePhoto(photo.id));

    return subscribeFavoritesChanged(() => {
      setFavorite(isFavoritePhoto(photo.id));
    });
  }, [photo.id]);

  const imageUrl =
    photo.previewUrl ||
    photo.watermarkedUrl ||
    'https://placehold.co/800x600?text=Photo';

  const handleToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    toggleFavoritePhoto({
      photo,
      competitionTitle,
      stageName,
      stageDate,
      addedAt: new Date().toISOString(),
    });
  };

  const handleRemoveFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemoveFavorite?.(photo);
  };

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDownload?.(photo);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.(photo);
  };

  return (
    <Card
      className="border-0 shadow-sm rounded-4 overflow-hidden h-100"
      role={onOpen ? 'button' : undefined}
      onClick={() => onOpen?.(photo)}
      style={onOpen ? { cursor: 'pointer' } : undefined}
    >
      <div className="position-relative">
        <Card.Img
          src={imageUrl}
          style={{ height: 210, objectFit: 'cover' }}
        />

        {favoriteControlMode === 'toggle' ? (
          <Button
            variant="light"
            className="position-absolute top-0 start-0 m-3 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
            style={{ width: 42, height: 42 }}
            onClick={handleToggleFavorite}
          >
            {favorite ? <HeartFill className="text-danger" /> : <Heart />}
          </Button>
        ) : null}

        {favoriteControlMode === 'remove' ? (
          <Button
            variant="light"
            className="position-absolute top-0 start-0 m-3 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
            style={{ width: 42, height: 42 }}
            onClick={handleRemoveFavorite}
          >
            <XLg />
          </Button>
        ) : null}

        {bibLabel ? (
          <Badge
            bg="dark"
            pill
            className="position-absolute top-0 end-0 m-3 px-3 py-2"
          >
            № {bibLabel}
          </Badge>
        ) : null}
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="fw-bold fs-5">
              Этап: {stageName || 'Без этапа'}
            </div>

            <div className="text-secondary small">
              {formatStageDateRange(stageDate ?? photo.dayDate, stageEndDate ?? stageDate ?? photo.dayDate)}
            </div>

            <div className="mt-2">
              {renderBibStatus(photo)}
            </div>

            <div className="text-secondary small">
              Автор: <span className="fw-semibold">{getAuthorName(photo)}</span>
            </div>
          </div>

          {photo.canDownloadOriginal ? (
            <Badge bg="success-subtle" text="success" pill>
              Original
            </Badge>
          ) : null}
        </div>

        {onDownload || onDelete ? (
          <div className="mt-auto pt-3 d-flex justify-content-end gap-2 flex-wrap">
            {onDelete ? (
              <Button
                variant="outline-danger"
                className="rounded-pill d-inline-flex align-items-center gap-2"
                onClick={handleDelete}
              >
                <Trash size={16} />
                Удалить
              </Button>
            ) : null}

            {onDownload && photo.canDownloadOriginal ? (
              <Button
                variant="outline-primary"
                className="rounded-pill d-inline-flex align-items-center gap-2"
                onClick={handleDownload}
              >
                <Download size={16} />
                Скачать
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}