import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import type { UserDto, UserRole } from '../../api/auth';

export type UserFilterValues = {
  login: string;
  fullName: string;
  role: UserRole | 'all';
};

type Props = {
  value: UserFilterValues;
  users: UserDto[];
  filteredCount: number;
  onChange: (next: UserFilterValues) => void;
  onReset: () => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  organizer: 'Организатор',
  photographer: 'Фотограф',
  participant: 'Участник',
};

export function createDefaultUserFilters(): UserFilterValues {
  return {
    login: '',
    fullName: '',
    role: 'all',
  };
}

export function applyUserFilters(users: UserDto[], filters: UserFilterValues): UserDto[] {
  const login = filters.login.trim().toLowerCase();
  const fullName = filters.fullName.trim().toLowerCase();

  return users.filter((user) => {
    const userLogin = user.login?.toLowerCase() ?? '';
    const userFullName = user.fullName?.toLowerCase() ?? '';

    const matchesLogin = !login || userLogin.includes(login);
    const matchesFullName = !fullName || userFullName.includes(fullName);
    const matchesRole = filters.role === 'all' || user.role === filters.role;

    return matchesLogin && matchesFullName && matchesRole;
  });
}

function buildRoleOptions(users: UserDto[]) {
  const roles = Array.from(
    new Set(users.map((user) => user.role).filter(Boolean)),
  );

  return roles as UserRole[];
}

export default function UserFilters({
  value,
  users,
  filteredCount,
  onChange,
  onReset,
}: Props) {
  const roleOptions = buildRoleOptions(users);

  const updateField = <K extends keyof UserFilterValues>(
    key: K,
    nextValue: UserFilterValues[K],
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <Card className="border-0 rounded-4 mb-4">
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Поиск</h5>
            <div className="text-secondary small">
              Найдено пользователей: <b>{filteredCount}</b>
            </div>
          </div>

          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={onReset}
          >
            Сбросить
          </Button>
        </div>

        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Логин</Form.Label>
              <Form.Control
                value={value.login}
                onChange={(e) => updateField('login', e.target.value)}
                placeholder="Введите логин"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Имя</Form.Label>
              <Form.Control
                value={value.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Введите имя"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Роль</Form.Label>
              <Form.Select
                value={value.role}
                onChange={(e) => updateField('role', e.target.value as UserRole | 'all')}
              >
                <option value="all">Все роли</option>

                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}