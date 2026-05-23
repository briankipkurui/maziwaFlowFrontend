import usersService from '@/services/usersService';
import { usersKeys } from '../queryKeys';

export const createUsersListQuery = (page: number, limit: number) => ({
  queryKey: usersKeys.list(page, limit),
  queryFn: () => usersService.getUsers(page, limit),
});
