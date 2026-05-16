import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import {
  createCompetition,
  createStage,
  deleteCompetition,
  deleteStage,
  getCompetitions,
  updateCompetition,
  updateStage,
  type CompetitionFormValues,
  type StageFormValues,
} from '../api/competitions';
import { getCurrentUser } from '../app/authStorage';
import CompetitionFilters from '../components/competitions/CompetitionFilters';
import CompetitionManageModal from '../components/competitions/CompetitionManageModal';
import ManageCompetitionCard from '../components/competitions/ManageCompetitionCard';
import {
  applyCompetitionFilters,
  buildCompetitionFilterOptions,
  createDefaultCompetitionFilters,
  type CompetitionFilterValues,
} from '../components/competitions/CompetitionFiltersHelpers';
import PageContainer from '../components/layout/PageContainer';
import { APP_ROUTES } from '../shared/constants';
import type { Competition } from '../types/competition';

function mapCompetitionsError(message: string) {
  if (message.includes('forbidden')) {
    return 'Недостаточно прав для выполнения действия';
  }

  if (message.includes('slug is already taken')) {
    return 'Такой идентификатор соревнования уже занят';
  }

  if (message.includes('competition slug already exists')) {
    return 'Такой идентификатор соревнования уже занят';
  }

  return message || 'Произошла ошибка';
}

export default function ManageCompetitionsPage() {
  const currentUser = getCurrentUser();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState<CompetitionFilterValues>(
    createDefaultCompetitionFilters(),
  );

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [showModal, setShowModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const canOpenPage =
    currentUser?.role === 'admin' || currentUser?.role === 'organizer';

  const visibleCompetitions = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return competitions;
    }

    if (currentUser.role === 'organizer') {
      return competitions.filter((competition) => competition.organizerId === currentUser.id);
    }

    return [];
  }, [competitions, currentUser]);

  const filterOptions = useMemo(
    () => buildCompetitionFilterOptions(visibleCompetitions),
    [visibleCompetitions],
  );

  const filteredCompetitions = useMemo(
    () => applyCompetitionFilters(visibleCompetitions, filters),
    [visibleCompetitions, filters],
  );

  const loadCompetitions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getCompetitions();
      setCompetitions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapCompetitionsError(message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCompetitions();
  }, []);

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  if (!canOpenPage) {
    return <Navigate to={APP_ROUTES.competitions} replace />;
  }

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCompetition(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (competition: Competition) => {
    setModalMode('edit');
    setSelectedCompetition(competition);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
  };

  const syncStagesAfterCreate = async (competitionId: string, stages: StageFormValues[]) => {
    for (let index = 0; index < stages.length; index += 1) {
      const stage = stages[index];

      await createStage(competitionId, {
        name: stage.name,
        sortOrder: stage.sortOrder ?? index,
        stageDate: stage.stageDate,
        isActive: stage.isActive,
      });
    }
  };

  const syncStagesAfterUpdate = async (
    competitionId: string,
    originalCompetition: Competition,
    nextStages: StageFormValues[],
  ) => {
    const originalStages = originalCompetition.stages ?? [];
    const originalIds = new Set(originalStages.map((stage) => stage.id));
    const nextIds = new Set(
      nextStages
        .filter((stage) => stage.id)
        .map((stage) => stage.id as string),
    );

    for (const stage of originalStages) {
      if (!nextIds.has(stage.id)) {
        await deleteStage(competitionId, stage.id);
      }
    }

    for (const stage of nextStages) {
      const payload = {
        name: stage.name,
        sortOrder: stage.sortOrder,
        stageDate: stage.stageDate,
        isActive: stage.isActive,
      };

      if (stage.id && originalIds.has(stage.id)) {
        await updateStage(competitionId, stage.id, payload);
      } else {
        await createStage(competitionId, payload);
      }
    }
  };

  const handleSubmitCompetition = async (
    values: CompetitionFormValues,
    stages: StageFormValues[],
  ) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        const created = await createCompetition(values);
        await syncStagesAfterCreate(created.id, stages);
        setSuccess('Соревнование успешно создано');
      } else if (selectedCompetition) {
        await updateCompetition(selectedCompetition.id, values);
        await syncStagesAfterUpdate(selectedCompetition.id, selectedCompetition, stages);
        setSuccess('Соревнование успешно обновлено');
      }

      await loadCompetitions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      const mapped = mapCompetitionsError(message);
      setError(mapped);
      throw new Error(mapped);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompetition = async () => {
    if (!selectedCompetition) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await deleteCompetition(selectedCompetition.id);
      setSuccess('Соревнование успешно удалено');
      await loadCompetitions();
      setShowModal(false);
      setSelectedCompetition(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      const mapped = mapCompetitionsError(message);
      setError(mapped);
      throw new Error(mapped);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Управление соревнованиями</h2>
          <div className="text-secondary">
            {currentUser.role === 'admin'
              ? 'Здесь отображаются все соревнования'
              : 'Здесь отображаются соревнования, созданные текущим организатором'}
          </div>
        </div>

        <Button className="rounded-pill px-4" onClick={openCreateModal}>
          Добавить соревнование
        </Button>
      </div>

      <CompetitionFilters
        value={filters}
        options={filterOptions}
        count={filteredCompetitions.length}
        onChange={setFilters}
        onReset={() => setFilters(createDefaultCompetitionFilters())}
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      {isLoading ? (
        <div className="py-5 text-center">
          <Spinner />
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <Alert variant="light" className="border rounded-4">
          Соревнования не найдены
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredCompetitions.map((competition) => (
            <Col key={competition.id} md={6} xl={4}>
              <ManageCompetitionCard competition={competition} onEdit={openEditModal} />
            </Col>
          ))}
        </Row>
      )}

      <CompetitionManageModal
        show={showModal}
        mode={modalMode}
        initialCompetition={selectedCompetition}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmitCompetition}
        onDelete={modalMode === 'edit' ? handleDeleteCompetition : undefined}
      />
    </PageContainer>
  );
}