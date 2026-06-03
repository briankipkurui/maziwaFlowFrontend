import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { usersKeys } from '../queries/users.keys';
// import { usersService } from '../services/users.service';

export const useUsersMutations = () => {
    const queryClient = useQueryClient();

    const refreshUsers = async () => {
        await queryClient.invalidateQueries({
            queryKey: usersKeys.all,
        });
    };

    return {
        refreshUsers,
    };
};