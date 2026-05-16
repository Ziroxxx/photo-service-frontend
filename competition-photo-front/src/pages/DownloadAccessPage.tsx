import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Spinner, Table } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import { Navigate } from 'react-router-dom';
import type { UserDto } from '../api/auth';
import {
  createCompetitionAccess,
  deleteCompetitionAccess,
  getCompetitionAccess,
  updateCompetitionAccess,
} from '../api/access';
import { getCompetitions } from '../api/competitions';
import { getUsers } from '../api/users';
import { getCurrentUser } from '../app/authStorage';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import { APP_ROUTES } from '../shared/constants';
import type { Competition } from '../types/competition';
import type { CompetitionAccessGrant } from '../types/access';
import UserFilters, {
  applyUserFilters,
  createDefaultUserFilters,
  type UserFilterValues,
} from '../components/users/UserFilters';
import { Typeahead } from 'react-bootstrap-typeahead';

type AccessDraft = {
  canDownloadOriginal: boolean;
};

function mapError(message: string) {
  if (message.includes('forbidden')) {
    return 'Недостаточно прав для выполнения действия';
  }

  if (message.includes('competition')) {
    return 'Не удалось загрузить доступы для соревнования';
  }

  return message || 'Произошла ошибка';
}

export default function DownloadAccessPage() {
  const currentUser = getCurrentUser();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [grants, setGrants] = useState<CompetitionAccessGrant[]>([]);

  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, AccessDraft>>({});

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingGrants, setIsLoadingGrants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState<UserFilterValues>(
    createDefaultUserFilters(),
  );
  
  const filteredUsers = useMemo(
    () => applyUserFilters(users, filters),
    [users, filters],
  );

  const canOpenPage =
    currentUser?.role === 'admin' || currentUser?.role === 'organizer';

  const visibleCompetitions = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return competitions;
    }

    return competitions.filter((competition) => competition.organizerId === currentUser.id);
  }, [competitions, currentUser]);

  const hasChanges = useMemo(() => Object.keys(drafts).length > 0, [drafts]);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoadingPage(true);
      setError('');

      try {
        const [competitionsData, usersData] = await Promise.all([
          getCompetitions(),
          getUsers(),
        ]);

        setCompetitions(competitionsData);
        setUsers(usersData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Произошла ошибка';
        setError(mapError(message));
      } finally {
        setIsLoadingPage(false);
      }
    };

    void loadPageData();
  }, []);

  // useEffect(() => {
  //   if (!selectedCompetitionId || !visibleCompetitions.some((item) => item.id === selectedCompetitionId)) {
  //     setSelectedCompetitionId(visibleCompetitions[0]?.id ?? '');
  //   }
  // }, [visibleCompetitions, selectedCompetitionId]);

  useEffect(() => {
    if (!selectedCompetitionId) {
      return;
    }
  
    const stillExists = visibleCompetitions.some(
      (competition) => competition.id === selectedCompetitionId,
    );
  
    if (!stillExists) {
      setSelectedCompetitionId('');
    }
  }, [visibleCompetitions, selectedCompetitionId]);

  useEffect(() => {
    if (!selectedCompetitionId) {
      setGrants([]);
      setDrafts({});
      return;
    }

    const loadGrants = async () => {
      setIsLoadingGrants(true);
      setError('');
      setSuccess('');

      try {
        const data = await getCompetitionAccess(selectedCompetitionId);
        setGrants(data.filter((item) => !item.revokedAt));
        setDrafts({});
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Произошла ошибка';
        setError(mapError(message));
      } finally {
        setIsLoadingGrants(false);
      }
    };

    void loadGrants();
  }, [selectedCompetitionId]);

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  if (!canOpenPage) {
    return <Navigate to={APP_ROUTES.competitions} replace />;
  }

  const getGrantForUser = (userId: string) => {
    return grants.find((grant) => grant.userId === userId);
  };

  const getDraftForUser = (user: UserDto): AccessDraft => {
    const existingGrant = getGrantForUser(user.id);

    return drafts[user.id] ?? {
      canDownloadOriginal: Boolean(existingGrant?.canDownloadOriginal),
    };
  };

  const handleCheckboxChange = (user: UserDto, checked: boolean) => {
    setSuccess('');
    setError('');

    const existingGrant = getGrantForUser(user.id);
    const currentValue = Boolean(existingGrant?.canDownloadOriginal);

    setDrafts((prev) => {
      const next = { ...prev };

      if (checked === currentValue) {
        delete next[user.id];
        return next;
      }

      next[user.id] = { canDownloadOriginal: checked };
      return next;
    });
  };

  const handleCancelChanges = () => {
    setDrafts({});
    setError('');
    setSuccess('');
  };

  const handleApplyChanges = async () => {
    if (!selectedCompetitionId) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const changedUserIds = Object.keys(drafts);

      for (const userId of changedUserIds) {
        const draft = drafts[userId];
        const existingGrant = getGrantForUser(userId);

        if (draft.canDownloadOriginal) {
          if (existingGrant) {
            if (!existingGrant.canDownloadOriginal) {
              await updateCompetitionAccess(selectedCompetitionId, existingGrant.id, {
                canDownloadOriginal: true,
              });
            }
          } else {
            await createCompetitionAccess(selectedCompetitionId, {
              userId,
              canDownloadOriginal: true,
            });
          }
        } else {
          if (existingGrant) {
            await deleteCompetitionAccess(selectedCompetitionId, existingGrant.id);
          }
        }
      }

      const freshGrants = await getCompetitionAccess(selectedCompetitionId);
      setGrants(freshGrants.filter((item) => !item.revokedAt));
      setDrafts({});
      setSuccess('Изменения успешно применены');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCompetition = visibleCompetitions.find(
    (competition) => competition.id === selectedCompetitionId,
  );

  return (
    <PageContainer>
      <SectionTitle
        icon={<Download size={24} />}
        title="Доступ к скачиванию"
        subtitle="Управление правом на скачивание оригиналов фотографий внутри выбранного соревнования"
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Form.Group style={{ maxWidth: 420 }}>
            <Form.Label className="fw-semibold">Выберите соревнование</Form.Label>
            <Typeahead
              id="competition-access-select"
              labelKey={(option) => {
                const competition = option as Competition;
                return competition.title;
              }}
              options={visibleCompetitions}
              selected={selectedCompetition ? [selectedCompetition] : []}
              onChange={(selected) => {
                const competition = selected[0] as Competition | undefined;
                setSelectedCompetitionId(competition?.id ?? '');
              }}
              disabled={isLoadingPage || isSubmitting || visibleCompetitions.length === 0}
              placeholder={
                visibleCompetitions.length === 0
                  ? 'Нет доступных соревнований'
                  : 'Начните вводить название соревнования'
              }
              emptyLabel="Соревнования не найдены"
            />
            {/* <Form.Select
              value={selectedCompetitionId}
              onChange={(e) => setSelectedCompetitionId(e.target.value)}
              disabled={isLoadingPage || isSubmitting}
            >
              {visibleCompetitions.length === 0 ? (
                <option value="">Нет доступных соревнований</option>
              ) : (
                visibleCompetitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.title}
                  </option>
                ))
              )}
            </Form.Select> */}
          </Form.Group>
        </Card.Body>
      </Card>

      {isLoadingPage || isLoadingGrants ? (
        <div className="py-5 text-center">
          <Spinner />
        </div>
      ) : !selectedCompetitionId ? (
        <Alert variant="light" className="border rounded-4">
          Соревнование не выбрано
        </Alert>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            <h4 className='fw-semibold'>
              Доступ к скачиванию оригиналов этого соревнования
            </h4>
            <UserFilters
              value={filters}
              users={users}
              filteredCount={filteredUsers.length}
              onChange={setFilters}
              onReset={() => setFilters(createDefaultUserFilters())}
            />
            <div className="table-responsive">
              <Table hover bordered className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Логин</th>
                    <th>Имя</th>
                    <th>Роль</th>
                    <th>Скачивать оригинал</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-secondary">
                        Пользователи не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const draft = getDraftForUser(user);
                      const rowChanged = Boolean(drafts[user.id]);

                      return (
                        <tr key={user.id} className={rowChanged ? 'table-warning' : ''}>
                          <td>{user.login || <span className="text-secondary">Пусто</span>}</td>
                          <td>{user.fullName || <span className="text-secondary">Пусто</span>}</td>
                          <td>{user.role || <span className="text-secondary">Пусто</span>}</td>
                          <td style={{ width: 220 }}>
                            <Form.Check
                              type="checkbox"
                              checked={draft.canDownloadOriginal}
                              onChange={(e) => handleCheckboxChange(user, e.target.checked)}
                              disabled={isSubmitting}
                              label="Разрешить"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {hasChanges ? (
              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={handleCancelChanges}
                  disabled={isSubmitting}
                >
                  Отменить изменения
                </Button>

                <Button
                  variant="primary"
                  className="rounded-pill px-4"
                  onClick={handleApplyChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Применение...
                    </>
                  ) : (
                    'Применить изменения'
                  )}
                </Button>
              </div>
            ) : null}
          </Card.Body>
        </Card>
      )}
    </PageContainer>
  );
}