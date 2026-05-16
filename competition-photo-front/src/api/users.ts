import { type UserDto, type UserRole, type UserStatus } from './auth';
import { API_ROUTES } from '../shared/constants';
import { apiJson } from './http';

interface ListUsersResponse {
  items: UserDto[];
}

export async function getUsers(): Promise<UserDto[]> {
  const data = await apiJson<ListUsersResponse>(API_ROUTES.users.list, {
    method: 'GET',
  });

  return data.items ?? [];
}

export async function updateUserRole(userId: string, role: UserRole): Promise<UserDto> {
  return apiJson<UserDto>(API_ROUTES.users.updateRole(userId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<UserDto> {
  return apiJson<UserDto>(API_ROUTES.users.updateStatus(userId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
}