export const BACKEND_URL = '/api'
export const AUTH_CHANGED_EVENT = 'auth-changed';
export const FAVORITES_CHANGED_EVENT = 'favorites-changed';

export const API_ROUTES = {
  auth: {
    login: `${BACKEND_URL}/auth/login`,
    register: `${BACKEND_URL}/auth/register`,
    refresh: `${BACKEND_URL}/auth/refresh`,
    logout: `${BACKEND_URL}/auth/logout`,
    me: `${BACKEND_URL}/me`,
  },
  users: {
    list: `${BACKEND_URL}/users`,
    updateRole: (id: string) => `${BACKEND_URL}/users/${id}/role`,
    updateStatus: (id: string) => `${BACKEND_URL}/users/${id}/status`,
  },
  competitions: {
    list: `${BACKEND_URL}/competitions`,
    create: `${BACKEND_URL}/competitions`,
    getById: (id: string) => `${BACKEND_URL}/competitions/${id}`,
    update: (id: string) => `${BACKEND_URL}/competitions/${id}`,
    delete: (id: string) => `${BACKEND_URL}/competitions/${id}`,
    createStage: (competitionId: string) => `${BACKEND_URL}/competitions/${competitionId}/stages`,
    updateStage: (competitionId: string, stageId: string) =>
      `${BACKEND_URL}/competitions/${competitionId}/stages/${stageId}`,
    deleteStage: (competitionId: string, stageId: string) =>
      `${BACKEND_URL}/competitions/${competitionId}/stages/${stageId}`,
    access: (competitionId: string) => `${BACKEND_URL}/competitions/${competitionId}/access`,
    updateAccess: (competitionId: string, grantId: string) =>
    `${BACKEND_URL}/competitions/${competitionId}/access/${grantId}`,
    deleteAccess: (competitionId: string, grantId: string) =>
    `${BACKEND_URL}/competitions/${competitionId}/access/${grantId}`,
  },
  photos: {
    downloadSingle: (id: string) => `${BACKEND_URL}/photos/${id}/download`,
    downloadBatch: `${BACKEND_URL}/photos/download`,
  },
} as const;

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  currentUser: 'currentUser',
  favoritePhotos: 'favoritePhotos',
} as const;

export const APP_ROUTES = {
    root: '/',
    auth: '/auth',
    competitions: '/competitions',
    competitionDetails: (id: string) => `/competitions/${id}`,
    profile: '/profile',
    favorites: '/favorites',
    adminUsers: '/admin/users',
    downloadAccess: '/download-access',
    manageCompetitions: '/manage/competitions',
  } as const;