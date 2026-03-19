import { createBrowserRouter } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import CompetitionsPage from '../pages/CompetitionsPage';
import CompetitionDetailsPage from '../pages/CompetitionDetailsPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AuthPage />,
    },
    {
      path: '/competitions',
      element: <CompetitionsPage />,
    },
    {
      path: '/competitions/:id',
      element: <CompetitionDetailsPage />,
    },
  ],
);