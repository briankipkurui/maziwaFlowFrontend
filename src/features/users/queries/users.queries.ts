import { queryOptions } from '@tanstack/vue-query';

import { usersKeys } from './users.keys';
import { usersService } from '../services/auth.service';

export const usersQueries = {
  getUsers: () =>
    queryOptions({
      queryKey: usersKeys.list(),
      queryFn: () => usersService.getUsers(),
      staleTime: 1000 * 60 * 5,
    }),
};
