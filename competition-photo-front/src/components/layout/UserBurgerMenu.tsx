import { useState } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import {
  BoxArrowRight,
  Download,
  Heart,
  List,
  People,
  PersonCircle,
  Trophy,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { logout, type UserDto } from '../../api/auth';
import { clearAuth, getRefreshToken } from '../../app/authStorage';
import { APP_ROUTES } from '../../shared/constants';

interface UserBurgerMenuProps {
  user: UserDto;
}

export default function UserBurgerMenu({ user }: UserBurgerMenuProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user.role === 'admin';
  const canManageCompetitions = user.role === 'admin' || user.role === 'organizer';
  const canManageDownloadAccess = user.role === 'admin' || user.role === 'organizer';

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        await logout({ refreshToken });
      }
    } catch {
      // ignore
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate(APP_ROUTES.auth, { replace: true });
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={Button}
        variant="outline-secondary"
        className="rounded-pill d-inline-flex align-items-center gap-2"
      >
        <List size={18} />
        <span className="d-none d-sm-inline">Меню</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 rounded-4 p-2" style={{ minWidth: 260 }}>
        <Dropdown.Item
          className="rounded-3 d-flex align-items-center gap-2"
          onClick={() => navigate(APP_ROUTES.profile)}
        >
          <PersonCircle size={18} />
          <div>
            <div className="fw-semibold">{user.login}</div>
            <div className="small text-secondary">{user.fullName}</div>
          </div>
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item
          className="rounded-3 d-flex align-items-center gap-2"
          onClick={() => navigate(APP_ROUTES.favorites)}
        >
          <Heart size={18} />
          Понравившиеся фото
        </Dropdown.Item>

        {canManageDownloadAccess ? (
          <Dropdown.Item
            className="rounded-3 d-flex align-items-center gap-2"
            onClick={() => navigate(APP_ROUTES.downloadAccess)}
          >
            <Download size={18} />
            Доступ к скачиванию
          </Dropdown.Item>
        ) : null}

        {isAdmin ? (
          <Dropdown.Item
            className="rounded-3 d-flex align-items-center gap-2"
            onClick={() => navigate(APP_ROUTES.adminUsers)}
          >
            <People size={18} />
            Управление пользователями
          </Dropdown.Item>
        ) : null}

        {canManageCompetitions ? (
          <Dropdown.Item
            className="rounded-3 d-flex align-items-center gap-2"
            onClick={() => navigate(APP_ROUTES.manageCompetitions)}
          >
            <Trophy size={18} />
            Управление соревнованиями
          </Dropdown.Item>
        ) : null}

        <Dropdown.Divider />

        <Dropdown.Item
          className="rounded-3 d-flex align-items-center gap-2 text-danger"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Spinner size="sm" /> : <BoxArrowRight size={18} />}
          Выход
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}