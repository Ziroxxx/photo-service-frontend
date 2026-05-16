import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getCurrentUser } from './authStorage';
import { APP_ROUTES } from '../shared/constants';
import AuthPage from '../pages/AuthPage';
import CompetitionsPage from '../pages/CompetitionsPage';
import CompetitionDetailsPage from '../pages/CompetitionDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import FavoritesPage from '../pages/FavoritesPage';
import DownloadAccessPage from '../pages/DownloadAccessPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import ManageCompetitionsPage from '../pages/ManageCompetitionsPage';

function RootRedirect() {
  const currentUser = getCurrentUser();
  return <Navigate to={currentUser ? APP_ROUTES.competitions : APP_ROUTES.auth} replace />;
}

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.root,
    element: <RootRedirect />,
  },
  {
    path: APP_ROUTES.auth,
    element: <AuthPage />,
  },
  {
    path: APP_ROUTES.competitions,
    element: <CompetitionsPage />,
  },
  {
    path: '/competitions/:id',
    element: <CompetitionDetailsPage />,
  },
  {
    path: APP_ROUTES.profile,
    element: <ProfilePage />,
  },
  {
    path: APP_ROUTES.favorites,
    element: <FavoritesPage />,
  },
  {
    path: APP_ROUTES.downloadAccess,
    element: <DownloadAccessPage />,
  },
  {
    path: APP_ROUTES.adminUsers,
    element: <AdminUsersPage />,
  },
  {
    path: APP_ROUTES.manageCompetitions,
    element: <ManageCompetitionsPage />,
  },
]);