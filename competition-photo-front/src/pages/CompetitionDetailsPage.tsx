import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Image,
  InputGroup,
  Pagination,
  ProgressBar,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Camera, Search, Upload } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
import { getCompetitionById } from '../api/competitions';
import {
  getCompetitionPhotos,
  uploadCompetitionPhotos,
  deletePhoto,
  type UploadPhotosResult,
} from '../api/photos';
import { downloadPhoto } from '../api/downloads';
import { getCurrentUser } from '../app/authStorage';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import PhotoPreviewModal from '../components/photos/PhotoPreviewModal';
import PhotoCard from '../components/photos/PhotoCard';
import UploadPhotoModal from '../components/photos/UploadPhotoModal';
import type { Competition } from '../types/competition';
import type { Photo } from '../types/photo';

const PHOTO_PAGE_SIZE = 12;

function getOrganizerName(competition: Competition) {
  return competition.organizerFullName?.trim() || competition.organizerLogin || 'Пусто';
}

function formatPlace(competition: Competition) {
  const parts = [competition.city, competition.venue].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'Пусто';
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Пусто';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTimeRange(startAt: string, endAt: string) {
  return `${formatDateTime(startAt)} — ${formatDateTime(endAt)}`;
}

function mapCompetitionStatus(status: Competition['status']) {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'published':
      return 'Опубликовано';
    case 'archived':
      return 'Архив';
    default:
      return status;
  }
}

function mapDetailsError(message: string) {
  if (message.includes('competition not found')) {
    return 'Соревнование не найдено';
  }

  if (message.includes('forbidden')) {
    return 'Недостаточно прав для просмотра соревнования';
  }

  return message || 'Не удалось загрузить данные соревнования';
}

function mapUploadResultMessage(result: UploadPhotosResult) {
  const successCount = result.items.length;
  const failedCount = result.failed.length;

  if (successCount > 0 && failedCount === 0) {
    return `Успешно загружено файлов: ${successCount}`;
  }

  if (successCount > 0 && failedCount > 0) {
    return `Загружено: ${successCount}, с ошибками: ${failedCount}`;
  }

  return 'Не удалось загрузить файлы';
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export default function CompetitionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = getCurrentUser();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const [selectedStage, setSelectedStage] = useState('all');
  const [bibFilter, setBibFilter] = useState('');
  const [appliedStage, setAppliedStage] = useState<string | undefined>(undefined);
  const [appliedBib, setAppliedBib] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PHOTO_PAGE_SIZE);
  const [totalPhotos, setTotalPhotos] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [isUploading, setIsUploading] = useState(false);

  const [isLoadingCompetition, setIsLoadingCompetition] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const loadCompetition = useCallback(async () => {
    if (!id) return;

    setIsLoadingCompetition(true);

    try {
      const data = await getCompetitionById(id);
      setCompetition(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapDetailsError(message));
    } finally {
      setIsLoadingCompetition(false);
    }
  }, [id]);

  const loadPhotos = useCallback(async () => {
    if (!id) return;

    setIsLoadingPhotos(true);

    try {
      const data = await getCompetitionPhotos(id, {
        stageId: appliedStage,
        bib: appliedBib || undefined,
        page,
        pageSize: PHOTO_PAGE_SIZE,
      });

      setPhotos(data.items);
      setPage(data.page);
      setPageSize(data.pageSize);
      setTotalPhotos(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapDetailsError(message));
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [id, appliedStage, appliedBib, page]);

  useEffect(() => {
    setError('');
    void loadCompetition();
  }, [loadCompetition]);

  useEffect(() => {
    if (!competition) return;

    setError('');
    void loadPhotos();
  }, [competition, loadPhotos]);

  const stageMap = useMemo(() => {
    const map = new Map<string, Competition['stages'][number]>();

    if (!competition?.stages) {
      return map;
    }

    for (const stage of competition.stages) {
      map.set(stage.id, stage);
    }

    return map;
  }, [competition]);

  const stageOptions = useMemo(() => {
    if (!competition?.stages) {
      return [];
    }

    return [...competition.stages].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [competition]);

  const canUpload = useMemo(() => {
    if (!currentUser || !competition || competition.status === 'archived') {
      return false;
    }

    if (currentUser.role === 'admin') {
      return true;
    }

    if (
      currentUser.role === 'organizer' &&
      currentUser.id === competition.organizerId
    ) {
      return true;
    }

    if (
      currentUser.role === 'photographer' &&
      competition.status === 'published'
    ) {
      return true;
    }

    return false;
  }, [competition, currentUser]);

  const canDeletePhoto = useCallback(
    (photo: Photo) => {
      if (!currentUser || !competition || competition.status === 'archived') {
        return false;
      }

      if (currentUser.role === 'admin') {
        return true;
      }

      if (
        currentUser.role === 'organizer' &&
        currentUser.id === competition.organizerId
      ) {
        return true;
      }

      if (
        currentUser.role === 'photographer' &&
        currentUser.id === photo.authorUserId
      ) {
        return true;
      }

      return false;
    },
    [competition, currentUser],
  );

  const totalPages = Math.max(1, Math.ceil(totalPhotos / pageSize));
  const visiblePages = buildPageNumbers(page, totalPages);

  const handleApplyFilters = () => {
    setAppliedStage(selectedStage === 'all' ? undefined : selectedStage);
    setAppliedBib(bibFilter.trim());
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedStage('all');
    setBibFilter('');
    setAppliedStage(undefined);
    setAppliedBib('');
    setPage(1);
  };

  const handleStartUpload = async (payload: { stageId?: string; files: File[] }) => {
    if (!id) return;

    setShowUploadModal(false);
    setUploadMessage('');
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase('uploading');

    try {
      const result = await uploadCompetitionPhotos({
        competitionId: id,
        stageId: payload.stageId,
        files: payload.files,
        onProgress: (progress, phase) => {
          setUploadProgress(progress);
          setUploadPhase(phase);
        },
      });

      setUploadProgress(100);
      setUploadPhase('done');
      setUploadMessage(mapUploadResultMessage(result));

      await Promise.all([loadCompetition(), loadPhotos()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка загрузки';
      setError(message);
      setUploadPhase('idle');
      setUploadProgress(0);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    const confirmed = window.confirm(
      `Удалить фотографию "${photo.originalFilename}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setUploadMessage('');
      await deletePhoto(photo.id);

      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
      }

      if (photos.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await Promise.all([loadCompetition(), loadPhotos()]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить фото';
      setError(message);
    }
  };

  if (isLoadingCompetition) {
    return (
      <PageContainer>
        <div className="py-5 text-center">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (!competition) {
    return (
      <PageContainer>
        <Alert variant="danger">{error || 'Соревнование не найдено'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle
        icon={<Camera size={24} />}
        title={competition.title}
        subtitle=""
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {uploadMessage ? <Alert variant="success">{uploadMessage}</Alert> : null}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Row className="g-0">
          <Col lg={4}>
            <Image
              src={competition.coverUrl || 'https://placehold.co/800x500?text=Competition'}
              fluid
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 260 }}
            />
          </Col>

          <Col lg={8}>
            <Card.Body className="p-4 p-lg-5">
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-secondary small">Тип соревнования</div>
                  <div className="fw-semibold">{competition.type}</div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Период проведения</div>
                  <div className="fw-semibold">
                    {formatDateTimeRange(competition.startAt, competition.endAt)}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Локация</div>
                  <div className="fw-semibold">{formatPlace(competition)}</div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Количество фотографий</div>
                  <div className="fw-semibold">{competition.photosCount ?? totalPhotos}</div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Количество этапов</div>
                  <div className="fw-semibold">{competition.stages?.length ?? 0}</div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Статус</div>
                  <div className="fw-semibold">{mapCompetitionStatus(competition.status)}</div>
                </Col>

                <Col md={6}>
                  <div className="text-secondary small">Организатор</div>
                  <div className="fw-semibold">{getOrganizerName(competition)}</div>
                </Col>
              </Row>

              {competition.description?.trim() ? (
                <Alert variant="primary" className="mt-4 mb-0 rounded-4">
                  {competition.description}
                </Alert>
              ) : null}
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <Row className="g-4 mb-4">
        <Col xl={canUpload ? 8 : 12}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Фильтры фотографий</h5>
                <Badge bg="secondary" pill>
                  Всего найдено: {totalPhotos}
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Label>Этап</Form.Label>
                  <Form.Select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                  >
                    <option value="all">Все этапы</option>
                    {stageOptions.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={4}>
                  <Form.Label>Номер участника</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Например, 247"
                      value={bibFilter}
                      onChange={(e) => setBibFilter(e.target.value)}
                    />
                  </InputGroup>
                </Col>

                <Col md={4}>
                  <Form.Label>Действия</Form.Label>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      className="w-100 rounded-pill"
                      onClick={handleResetFilters}
                    >
                      Сбросить
                    </Button>

                    <Button
                      variant="primary"
                      className="w-100 rounded-pill"
                      onClick={handleApplyFilters}
                    >
                      Применить
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {canUpload ? (
          <Col xl={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0">Загрузка фото</h5>
                  <Upload />
                </div>

                <p className="text-secondary small">
                  Можно загружать сразу несколько фотографий в выбранный этап.
                </p>

                <Button
                  className="w-100 rounded-pill mb-3"
                  onClick={() => setShowUploadModal(true)}
                  disabled={isUploading}
                >
                  {isUploading ? 'Идёт загрузка...' : 'Загрузить фотографии'}
                </Button>

                <div className="small text-secondary mb-2">
                  {uploadPhase === 'processing'
                    ? 'Файлы загружены, сервер обрабатывает изображения'
                    : 'Текущий прогресс загрузки'}
                </div>

                <ProgressBar
                  now={uploadProgress}
                  label={
                    uploadPhase === 'processing'
                      ? 'Обработка...'
                      : uploadProgress > 0
                        ? `${uploadProgress}%`
                        : undefined
                  }
                  animated={isUploading}
                  striped={isUploading}
                  style={{ height: 12 }}
                />
              </Card.Body>
            </Card>
          </Col>
        ) : null}
      </Row>

      {isLoadingPhotos ? (
        <div className="py-5 text-center">
          <Spinner />
        </div>
      ) : photos.length === 0 ? (
        <Alert variant="light" className="border rounded-4">
          Фотографии не найдены
        </Alert>
      ) : (
        <>
          <Row className="g-4">
            {photos.map((photo) => {
              const stage = photo.stageId ? stageMap.get(photo.stageId) : undefined;

              return (
                <Col md={6} xl={4} key={photo.id}>
                  <PhotoCard
                    photo={photo}
                    stageName={stage?.name}
                    stageDate={stage?.stageDate}
                    stageEndDate={stage?.stageEndDate}
                    competitionTitle={competition.title}
                    onOpen={(clickedPhoto) => setSelectedPhoto(clickedPhoto)}
                    onDownload={async (clickedPhoto) => {
                      try {
                        setError('');
                        await downloadPhoto(clickedPhoto.id);
                      } catch (err) {
                        const message = err instanceof Error ? err.message : 'Не удалось скачать фото';
                        setError(message);
                      }
                    }}
                    onDelete={canDeletePhoto(photo) ? handleDeletePhoto : undefined}
                  />
                </Col>
              );
            })}
          </Row>

          {totalPages > 1 ? (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className="mb-0">
                <Pagination.First
                  disabled={page === 1 || isLoadingPhotos}
                  onClick={() => setPage(1)}
                />
                <Pagination.Prev
                  disabled={page === 1 || isLoadingPhotos}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                />

                {visiblePages.map((pageNumber, index) => {
                  const previousPage = visiblePages[index - 1];
                  const shouldShowEllipsis =
                    previousPage !== undefined && pageNumber - previousPage > 1;

                  return (
                    <span key={pageNumber}>
                      {shouldShowEllipsis ? <Pagination.Ellipsis disabled /> : null}
                      <Pagination.Item
                        active={pageNumber === page}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    </span>
                  );
                })}

                <Pagination.Next
                  disabled={page === totalPages || isLoadingPhotos}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                />
                <Pagination.Last
                  disabled={page === totalPages || isLoadingPhotos}
                  onClick={() => setPage(totalPages)}
                />
              </Pagination>
            </div>
          ) : null}
        </>
      )}

      <UploadPhotoModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        competitionTitle={competition.title}
        stages={stageOptions}
        isUploading={isUploading}
        onStartUpload={handleStartUpload}
      />

      <PhotoPreviewModal
        show={Boolean(selectedPhoto)}
        onHide={() => setSelectedPhoto(null)}
        photo={selectedPhoto}
        stageName={
          selectedPhoto?.stageId
            ? stageMap.get(selectedPhoto.stageId)?.name
            : undefined
        }
      />
    </PageContainer>
  );
}