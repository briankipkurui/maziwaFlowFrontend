import http from './axios';
import { USERS_ENDPOINTS } from './endpoints/users';
import type {
  BaseResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from '@/types';

class UsersService {
  async getUsers(page = 1, limit = 10): Promise<UsersListResponse> {
    const response = await http.get<UsersListResponse>(USERS_ENDPOINTS.USERS(page, limit));
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<BaseResponse> {
    const response = await http.post<BaseResponse>(USERS_ENDPOINTS.CREATE, data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<BaseResponse> {
    const response = await http.patch<BaseResponse>(USERS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  }
}

export default new UsersService();
