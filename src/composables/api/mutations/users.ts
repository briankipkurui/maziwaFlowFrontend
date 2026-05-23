import type { QueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import usersService from '@/services/usersService';
import { usersKeys } from '../queryKeys';
import type { BaseResponse, CreateUserRequest, UpdateUserRequest, ApiError } from '@/types';
import type { AxiosError } from 'axios';

export const createUserMutation = (queryClient: QueryClient) => ({
  mutationFn: (data: CreateUserRequest): Promise<BaseResponse> => usersService.createUser(data),
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || 'User created successfully.');
    queryClient.invalidateQueries({ queryKey: usersKeys.all });
  },
  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to create user.';
    toast.error(message);
  },
});

export const updateUserMutation = (queryClient: QueryClient) => ({
  mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }): Promise<BaseResponse> =>
    usersService.updateUser(id, data),
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || 'User updated successfully.');
    queryClient.invalidateQueries({ queryKey: usersKeys.all });
  },
  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to update user.';
    toast.error(message);
  },
});
