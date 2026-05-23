import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { createUserMutation, updateUserMutation } from './api/mutations/users';
import { createUsersListQuery } from './api/queries/users';

export function useUsers(page: Ref<number> = { value: 1 } as Ref<number>, limit = 10) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: computed(() => createUsersListQuery(page.value, limit).queryKey),
    queryFn: () => createUsersListQuery(page.value, limit).queryFn(),
  });

  const createUserMut = useMutation(createUserMutation(queryClient));
  const updateUserMut = useMutation(updateUserMutation(queryClient));

  return {
    // Query
    users: usersQuery.data,
    isLoadingUsers: usersQuery.isLoading,
    isFetchingUsers: usersQuery.isFetching,
    usersError: usersQuery.error,
    refetchUsers: usersQuery.refetch,

    // Create
    createUser: createUserMut.mutate,
    createUserAsync: createUserMut.mutateAsync,
    isCreatingUser: createUserMut.isPending,
    createUserError: createUserMut.error,

    // Update
    updateUser: updateUserMut.mutate,
    updateUserAsync: updateUserMut.mutateAsync,
    isUpdatingUser: updateUserMut.isPending,
    updateUserError: updateUserMut.error,
  };
}
