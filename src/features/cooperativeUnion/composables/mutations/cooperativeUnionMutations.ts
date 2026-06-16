import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { CooperativeUnionPayload } from '../../types/cooperativeUnion';
import { cooperativeUnionService } from '../../services/cooperativeUnionService';
import { cooperativeUnionQueryKeys } from '../queryKeys/cooperativeUnionQueryKeys';

export const useCreateCooperativeUnionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CooperativeUnionPayload) => cooperativeUnionService.create(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cooperativeUnionQueryKeys.all,
      });
    },
  });
};

export const useUpdateCooperativeUnionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CooperativeUnionPayload }) =>
      cooperativeUnionService.update(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cooperativeUnionQueryKeys.all,
      });
    },
  });
};
