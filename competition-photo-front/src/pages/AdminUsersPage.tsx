import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Spinner, Table } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { type UserDto, type UserRole, type UserStatus } from '../api/auth';
import { getUsers, updateUserRole, updateUserStatus } from '../api/users';
import { getCurrentUser } from '../app/authStorage';
import PageContainer from '../components/layout/PageContainer';
import { APP_ROUTES } from '../shared/constants';
import UserFilters, {
  applyUserFilters,
  createDefaultUserFilters,
  type UserFilterValues,
} from '../components/users/UserFilters';

type UserDraft = {
  role: UserRole;
  status: UserStatus;
};

const ROLE_OPTIONS: UserRole[] = ['admin', 'organizer', 'photographer', 'participant'];
const STATUS_OPTIONS: UserStatus[] = ['active', 'blocked'];

function formatValue(value?: string | null) {
  if (!value || value.trim() === '') {
    return <span className="text-secondary">Пусто</span>;
  }

  return value;
}

function formatDate(value?: string | null) {
  if (!value) {
    return <span className="text-secondary">Пусто</span>;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return <span className="text-secondary">Пусто</span>;
  }

  return date.toLocaleString('ru-RU');
}

function mapUsersError(message: string) {
  if (message.includes('forbidden')) {
    return 'Недостаточно прав для выполнения действия';
  }

  if (message.includes('invalid')) {
    return 'Некорректные данные';
  }

  return message || 'Произошла ошибка';
}

export default function AdminUsersPage() {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState<UserFilterValues>(createDefaultUserFilters)

  const hasChanges = useMemo(() => Object.keys(drafts).length > 0, [drafts]);
  const filteredUsers = useMemo(() => applyUserFilters(users, filters), [users, filters])

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapUsersError(message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to={APP_ROUTES.competitions} replace />;
  }

  const getDraftForUser = (user: UserDto): UserDraft => {
    return drafts[user.id] ?? {
      role: user.role,
      status: user.status,
    };
  };

  const upsertDraft = (user: UserDto, nextDraft: UserDraft) => {
    const unchanged = nextDraft.role === user.role && nextDraft.status === user.status;

    setDrafts((prev) => {
      const next = { ...prev };

      if (unchanged) {
        delete next[user.id];
        return next;
      }

      next[user.id] = nextDraft;
      return next;
    });
  };

  const handleRoleChange = (user: UserDto, role: UserRole) => {
    setSuccess('');
    const currentDraft = getDraftForUser(user);
    upsertDraft(user, { ...currentDraft, role });
  };

  const handleStatusChange = (user: UserDto, status: UserStatus) => {
    setSuccess('');
    const currentDraft = getDraftForUser(user);
    upsertDraft(user, { ...currentDraft, status });
  };

  const handleCancelChanges = () => {
    setDrafts({});
    setSuccess('');
    setError('');
  };

  const handleApplyChanges = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      for (const user of users) {
        const draft = drafts[user.id];
        if (!draft) continue;

        if (draft.role !== user.role) {
          await updateUserRole(user.id, draft.role);
        }

        if (draft.status !== user.status) {
          await updateUserStatus(user.id, draft.status);
        }
      }

      setDrafts({});
      setSuccess('Изменения успешно применены');
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapUsersError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer fluid>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">Управление пользователями</h2>
              <div className="text-secondary">
                Изменяйте роли и статусы пользователей.
              </div>
            </div>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          {isLoading ? (
            <div className="py-5 text-center">
              <Spinner />
            </div>
          ) : (
            <>
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
                      <th>ID</th>
                      <th>Логин</th>
                      <th>Имя</th>
                      <th>Роль</th>
                      <th>Статус</th>
                      <th>Создан</th>
                      <th>Обновлён</th>
                      <th>Последний вход</th>
                      <th>Новый статус</th>
                      <th>Новая роль</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-4 text-secondary">
                          Пользователи не найдены
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const draft = getDraftForUser(user);
                        const rowChanged = Boolean(drafts[user.id]);

                        return (
                          <tr key={user.id} className={rowChanged ? 'table-warning' : ''}>
                            <td style={{ minWidth: 220 }}>{user.id}</td>
                            <td>{formatValue(user.login)}</td>
                            <td>{formatValue(user.fullName)}</td>
                            <td>{formatValue(user.role)}</td>
                            <td>{formatValue(user.status)}</td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>{formatDate(user.updatedAt)}</td>
                            <td>{formatDate(user.lastLoginAt)}</td>

                            <td style={{ minWidth: 180 }}>
                              <Form.Select
                                value={draft.status}
                                onChange={(e) =>
                                  handleStatusChange(user, e.target.value as UserStatus)
                                }
                                disabled={isSubmitting}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>

                            <td style={{ minWidth: 180 }}>
                              <Form.Select
                                value={draft.role}
                                onChange={(e) =>
                                  handleRoleChange(user, e.target.value as UserRole)
                                }
                                disabled={isSubmitting}
                              >
                                {ROLE_OPTIONS.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </Form.Select>
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
            </>
          )}
        </Card.Body>
      </Card>
    </PageContainer>
  );
}