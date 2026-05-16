import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { PlusLg, Trash } from 'react-bootstrap-icons';
import type { Competition, CompetitionStatus } from '../../types/competition';
import type { CompetitionFormValues, StageFormValues } from '../../api/competitions';
import {
  validateCompetitionForm,
  type CompetitionFieldErrors,
  type StageFieldError,
} from './CompetitionValidation';

type Props = {
  show: boolean;
  mode: 'create' | 'edit';
  initialCompetition?: Competition | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CompetitionFormValues, stages: StageFormValues[]) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const DEFAULT_TIMEZONE = 'Europe/Moscow';

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function createDefaultStage(): StageFormValues {
  return {
    name: 'Основной этап',
    sortOrder: 0,
    stageDate: '',
    isActive: true,
  };
}

function createDefaultValues(): CompetitionFormValues {
  const now = new Date();
  const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return {
    slug: '',
    title: '',
    type: '',
    city: '',
    venue: '',
    description: '',
    startAt: toDateTimeLocal(now.toISOString()),
    endAt: toDateTimeLocal(end.toISOString()),
    timezone: DEFAULT_TIMEZONE,
    status: 'draft',
    coverFile: null,
    removeCover: false,
  };
}

function buildValuesFromCompetition(competition: Competition): CompetitionFormValues {
  return {
    slug: competition.slug,
    title: competition.title,
    type: competition.type,
    city: competition.city ?? '',
    venue: competition.venue ?? '',
    description: competition.description ?? '',
    startAt: toDateTimeLocal(competition.startAt),
    endAt: toDateTimeLocal(competition.endAt),
    timezone: competition.timezone,
    status: competition.status,
    coverFile: null,
    removeCover: false,
  };
}

function buildStagesFromCompetition(competition: Competition): StageFormValues[] {
  if (!competition.stages?.length) {
    return [createDefaultStage()];
  }

  return competition.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    sortOrder: stage.sortOrder,
    stageDate: stage.stageDate ?? '',
    isActive: true,
  }));
}

function mapStatusLabel(status: CompetitionStatus) {
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

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Form.Label>
      {children} <span className="text-danger">*</span>
    </Form.Label>
  );
}

function ErrorSpace({ message }: { message?: string }) {
  return (
    <div
      className={message ? 'text-danger small mt-1' : 'mt-1'}
      style={{ minHeight: '1.25rem' }}
    >
      {message ?? ''}
    </div>
  );
}

export default function CompetitionManageModal({
  show,
  mode,
  initialCompetition,
  isSubmitting,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [values, setValues] = useState<CompetitionFormValues>(createDefaultValues());
  const [stages, setStages] = useState<StageFormValues[]>([createDefaultStage()]);
  const [coverFileName, setCoverFileName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CompetitionFieldErrors>({});
  const [stageErrors, setStageErrors] = useState<StageFieldError[]>([]);
  const [commonErrors, setCommonErrors] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (mode === 'edit' && initialCompetition) {
      setValues(buildValuesFromCompetition(initialCompetition));
      setStages(buildStagesFromCompetition(initialCompetition));
      setCoverFileName('');
    } else {
      setValues(createDefaultValues());
      setStages([createDefaultStage()]);
      setCoverFileName('');
    }

    setSubmitError('');
    setFieldErrors({});
    setStageErrors([]);
    setCommonErrors([]);
    setIsDeleting(false);
  }, [show, mode, initialCompetition]);

  const isDirty = useMemo(() => {
    if (mode === 'create') return true;
    if (!initialCompetition) return false;

    const originalValues = buildValuesFromCompetition(initialCompetition);
    const originalStages = buildStagesFromCompetition(initialCompetition);

    return (
      JSON.stringify({ ...values, coverFile: values.coverFile ? '__file__' : null }) !==
        JSON.stringify({ ...originalValues, coverFile: null }) ||
      JSON.stringify(stages) !== JSON.stringify(originalStages)
    );
  }, [mode, initialCompetition, stages, values]);

  const canRemoveCover = useMemo(() => {
    if (values.coverFile) return true;
    if (mode === 'edit' && initialCompetition?.coverUrl && !values.removeCover) return true;
    return false;
  }, [values.coverFile, values.removeCover, mode, initialCompetition]);

  const handleFieldChange = <K extends keyof CompetitionFormValues>(key: K, value: CompetitionFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSubmitError('');
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setCommonErrors([]);
  };

  const handleStageChange = <K extends keyof StageFormValues>(
    index: number,
    key: K,
    value: StageFormValues[K],
  ) => {
    setStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, [key]: value } : stage)),
    );

    setSubmitError('');
    setCommonErrors([]);
    setStageErrors((prev) =>
      prev.map((stageError, i) =>
        i === index ? { ...stageError, [key === 'name' ? 'name' : 'stageDate']: undefined } : stageError,
      ),
    );
  };

  const handleAddStage = () => {
    setStages((prev) => [
      ...prev,
      {
        name: `Этап ${prev.length + 1}`,
        sortOrder: prev.length,
        stageDate: '',
        isActive: true,
      },
    ]);

    setStageErrors((prev) => [...prev, {}]);
  };

  const handleRemoveStage = (index: number) => {
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [createDefaultStage()];
    });

    setStageErrors((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{}];
    });

    setCommonErrors([]);
    setSubmitError('');
  };

  const handleRemoveCover = () => {
    setValues((prev) => ({
      ...prev,
      coverFile: null,
      removeCover: mode === 'edit' && Boolean(initialCompetition?.coverUrl),
    }));
    setCoverFileName('');
  };

  const resetToInitial = () => {
    if (mode === 'edit' && initialCompetition) {
      setValues(buildValuesFromCompetition(initialCompetition));
      setStages(buildStagesFromCompetition(initialCompetition));
      setCoverFileName('');
    } else {
      setValues(createDefaultValues());
      setStages([createDefaultStage()]);
      setCoverFileName('');
    }

    setSubmitError('');
    setFieldErrors({});
    setStageErrors([]);
    setCommonErrors([]);
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const validation = validateCompetitionForm(values, stages);
    setFieldErrors(validation.fieldErrors);
    setStageErrors(validation.stageErrors);
    setCommonErrors(validation.commonErrors);

    if (!validation.isValid) {
      return;
    }

    try {
      await onSubmit(values, stages);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setSubmitError(message);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !initialCompetition) return;

    const confirmed = window.confirm(
      `Удалить соревнование "${initialCompetition.title}"?`,
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setSubmitError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={isSubmitting || isDeleting ? undefined : onClose} centered size="xl">
      <Modal.Header closeButton={!isSubmitting && !isDeleting}>
        <Modal.Title>
          {mode === 'create' ? 'Добавить соревнование' : 'Изменить соревнование'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <RequiredLabel>Идентификатор (slug)</RequiredLabel>
              <Form.Control
                value={values.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                placeholder="московский-марафон-2026"
                isInvalid={Boolean(fieldErrors.slug)}
                disabled={isSubmitting || isDeleting}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.slug}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <RequiredLabel>Название</RequiredLabel>
              <Form.Control
                value={values.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Введите название"
                isInvalid={Boolean(fieldErrors.title)}
                disabled={isSubmitting || isDeleting}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.title}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <RequiredLabel>Тип</RequiredLabel>
              <Form.Control
                value={values.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                placeholder="марафон"
                isInvalid={Boolean(fieldErrors.type)}
                disabled={isSubmitting || isDeleting}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.type}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={values.status}
                onChange={(e) => handleFieldChange('status', e.target.value as CompetitionStatus)}
                disabled={isSubmitting || isDeleting}
              >
                {(['draft', 'published', 'archived'] as CompetitionStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {mapStatusLabel(status)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Город</Form.Label>
              <Form.Control
                value={values.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="Москва"
                disabled={isSubmitting || isDeleting}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Площадка</Form.Label>
              <Form.Control
                value={values.venue}
                onChange={(e) => handleFieldChange('venue', e.target.value)}
                placeholder="Лужники"
                disabled={isSubmitting || isDeleting}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <RequiredLabel>Дата начала</RequiredLabel>
              <Form.Control
                type="datetime-local"
                value={values.startAt}
                onChange={(e) => handleFieldChange('startAt', e.target.value)}
                isInvalid={Boolean(fieldErrors.startAt)}
                disabled={isSubmitting || isDeleting}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.startAt}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <RequiredLabel>Дата окончания</RequiredLabel>
              <Form.Control
                type="datetime-local"
                value={values.endAt}
                onChange={(e) => handleFieldChange('endAt', e.target.value)}
                isInvalid={Boolean(fieldErrors.endAt)}
                disabled={isSubmitting || isDeleting}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.endAt}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Таймзона</Form.Label>
              <Form.Control
                value={values.timezone}
                onChange={(e) => handleFieldChange('timezone', e.target.value)}
                disabled={isSubmitting || isDeleting}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Обложка соревнования</Form.Label>

              <div className="d-flex gap-2 align-items-start">
                <Form.Control
                  className="flex-grow-1"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const input = e.currentTarget as HTMLInputElement;
                    const file = input.files?.[0] ?? null;
                    handleFieldChange('coverFile', file);
                    handleFieldChange('removeCover', false);
                    setCoverFileName(file?.name ?? '');
                  }}
                  disabled={isSubmitting || isDeleting}
                />

                <Button
                  variant="outline-danger"
                  className="text-nowrap"
                  onClick={handleRemoveCover}
                  disabled={!canRemoveCover || isSubmitting || isDeleting}
                >
                  Удалить изображение
                </Button>
              </div>

              <Form.Text className="text-secondary">
                {coverFileName
                  ? `Выбран файл: ${coverFileName}`
                  : values.removeCover
                    ? 'Текущая обложка будет удалена'
                    : mode === 'edit'
                      ? 'Можно загрузить новую обложку'
                      : 'Выберите изображение'}
              </Form.Text>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={values.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Описание соревнования"
                disabled={isSubmitting || isDeleting}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h5 className="fw-bold mb-0">Этапы</h5>

          <Button
            variant="outline-primary"
            className="rounded-pill d-inline-flex align-items-center gap-2"
            onClick={handleAddStage}
            disabled={isSubmitting || isDeleting}
          >
            <PlusLg />
            Добавить этап
          </Button>
        </div>

        <div className="d-flex flex-column gap-3">
          {stages.map((stage, index) => (
            <div key={stage.id ?? `new-${index}`} className="border rounded-4 p-3">
              <Row className="g-3">
                <Col md={5}>
                  <Form.Group>
                    <RequiredLabel>Название этапа</RequiredLabel>
                    <Form.Control
                      value={stage.name}
                      onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                      isInvalid={Boolean(stageErrors[index]?.name)}
                      disabled={isSubmitting || isDeleting}
                    />
                    <ErrorSpace message={stageErrors[index]?.name} />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Порядок</Form.Label>
                    <Form.Control
                      type="number"
                      value={stage.sortOrder}
                      onChange={(e) => handleStageChange(index, 'sortOrder', Number(e.target.value))}
                      disabled={isSubmitting || isDeleting}
                    />
                    <ErrorSpace />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <RequiredLabel>Дата этапа</RequiredLabel>
                    <Form.Control
                      type="date"
                      value={stage.stageDate}
                      onChange={(e) => handleStageChange(index, 'stageDate', e.target.value)}
                      isInvalid={Boolean(stageErrors[index]?.stageDate)}
                      disabled={isSubmitting || isDeleting}
                    />
                    <ErrorSpace message={stageErrors[index]?.stageDate} />
                  </Form.Group>
                </Col>

                <Col md={1} className="d-flex align-items-start">
                  <Button
                    variant="outline-danger"
                    className="w-100 mt-4"
                    onClick={() => handleRemoveStage(index)}
                    disabled={isSubmitting || isDeleting || stages.length === 1}
                  >
                    <Trash />
                  </Button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="flex-column align-items-stretch">
        {commonErrors.length > 0 ? (
          <div className="w-100">
            {commonErrors.map((error, index) => (
              <div key={`${error}-${index}`} className="text-danger small mb-1">
                {error}
              </div>
            ))}
          </div>
        ) : null}

        {submitError ? (
          <Alert variant="danger" className="w-100 mb-2">
            {submitError}
          </Alert>
        ) : null}

        <div className="d-flex w-100 justify-content-between gap-2 flex-wrap">
          <div className="d-flex gap-2">
            {mode === 'edit' ? (
              <Button
                variant="outline-danger"
                className="rounded-pill"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Удаление...
                  </>
                ) : (
                  'Удалить соревнование'
                )}
              </Button>
            ) : null}
          </div>

          <div className="d-flex gap-2">
            {mode === 'create' ? (
              <>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                >
                  Закрыть
                </Button>

                <Button
                  className="rounded-pill px-4"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Сохранение...
                    </>
                  ) : (
                    'Добавить'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill"
                  onClick={resetToInitial}
                  disabled={isSubmitting || isDeleting}
                >
                  Отменить изменения
                </Button>

                <Button
                  className="rounded-pill px-4"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting || !isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Сохранение...
                    </>
                  ) : (
                    'Применить изменения'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}