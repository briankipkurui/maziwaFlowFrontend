import { useQuery } from '@tanstack/vue-query';

import { usersQueries } from '../queries/users.queries';
import { useUsersMutations } from '../mutations/users.mutations';

export const useUsers = () => {
  const usersQuery = useQuery(usersQueries.getUsers());

  const { refreshUsers } = useUsersMutations();

  return {
    users: usersQuery.data,
    isLoadingUsers: usersQuery.isLoading,
    isFetchingUsers: usersQuery.isFetching,
    isErrorUsers: usersQuery.isError,
    usersError: usersQuery.error,
    refetchUsers: usersQuery.refetch,

    refreshUsers,
  };
};
