import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { cooperativeMemberService } from '../../services/cooperativeMemberService';
import { cooperativeMemberQueryKeys } from '../queryKeys/cooperativeMemberQueryKeys';

import type { CooperativeMemberPayload } from '../../types/cooperativeMember';
import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';

export const useCreateCooperativeMemberMutation = () => {
  const queryClient = useQueryClient();

  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: (payload: CooperativeMemberPayload) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberService.create(cooperativeId, payload);
    },

    onSuccess: async () => {
      const cooperativeId = requireActiveCooperativeId();

      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberQueryKeys.lists(cooperativeId),
      });
    },
  });
};

export const useUpdateCooperativeMemberMutation = () => {
  const queryClient = useQueryClient();

  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CooperativeMemberPayload }) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberService.update(cooperativeId, id, payload);
    },

    onSuccess: async (_, variables) => {
      const cooperativeId = requireActiveCooperativeId();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cooperativeMemberQueryKeys.lists(cooperativeId),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberQueryKeys.detail(cooperativeId, variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteCooperativeMemberMutation = () => {
  const queryClient = useQueryClient();

  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: (id: string) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberService.delete(cooperativeId, id);
    },

    onSuccess: async (_, id) => {
      const cooperativeId = requireActiveCooperativeId();

      queryClient.removeQueries({
        queryKey: cooperativeMemberQueryKeys.detail(cooperativeId, id),
      });

      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberQueryKeys.lists(cooperativeId),
      });
    },
  });
};
