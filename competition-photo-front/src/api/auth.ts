import { API_ROUTES } from '../shared/constants';

export type UserRole = 'admin' | 'organizer' | 'photographer' | 'participant';
export type UserStatus = 'active' | 'blocked' | 'pending';

export interface UserDto {
  id: string;
  login: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  login: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface RegisterResponse {
  user: UserDto;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LogoutRequest {
  refreshToken: string;
}

interface ApiErrorResponse {
  error?: string;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error || 'Произошла ошибка';
  } catch {
    return 'Произошла ошибка';
  }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(API_ROUTES.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(API_ROUTES.auth.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function refresh(payload: RefreshRequest): Promise<RefreshResponse> {
  const response = await fetch(API_ROUTES.auth.refresh, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function logout(payload: LogoutRequest): Promise<void> {
  const response = await fetch(API_ROUTES.auth.logout, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}