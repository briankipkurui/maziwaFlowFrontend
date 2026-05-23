import type { PaginatedResponse } from './common';

export interface BaseUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CreateUserRequest extends BaseUser {
  password: string;
}

export type UpdateUserRequest = BaseUser;

export interface UserItem extends BaseUser {
  id: number;
  isEmailVerified: boolean;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UsersListResponse = PaginatedResponse<UserItem>;
