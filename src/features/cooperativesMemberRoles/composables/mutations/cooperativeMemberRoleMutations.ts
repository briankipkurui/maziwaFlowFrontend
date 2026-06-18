import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type {
  CooperativeMemberRolePayload,
  ReplaceCooperativeMemberRolePermissionsPayload,
} from '../../types/cooperativeMemberRoleTypes';

import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';
import { cooperativeMemberRoleService } from '../../services/cooperativeMemberRolesService';
import { cooperativeMemberRoleQueryKeys } from '../queryKeys/cooperativeMemberRolesQueryKeys';

export const useCreateCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: (payload: CooperativeMemberRolePayload) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberRoleService.create(cooperativeId, payload);
    },

    onSuccess: async () => {
      const cooperativeId = requireActiveCooperativeId();

      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberRoleQueryKeys.lists(cooperativeId),
      });
    },
  });
};

export const useUpdateCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CooperativeMemberRolePayload }) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberRoleService.update(cooperativeId, id, payload);
    },

    onSuccess: async (_, variables) => {
      const cooperativeId = requireActiveCooperativeId();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.lists(cooperativeId),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.detail(cooperativeId, variables.id),
        }),
      ]);
    },
  });
};

export const useReplaceCooperativeMemberRolePermissionsMutation = () => {
  const queryClient = useQueryClient();
  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReplaceCooperativeMemberRolePermissionsPayload;
    }) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberRoleService.replacePermissions(cooperativeId, id, payload);
    },

    onSuccess: async (_, variables) => {
      const cooperativeId = requireActiveCooperativeId();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.lists(cooperativeId),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.detail(cooperativeId, variables.id),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.permissions(cooperativeId),
        }),
      ]);
    },
  });
};

export const useDeleteCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  const { requireActiveCooperativeId } = useActiveCooperative();

  return useMutation({
    mutationFn: (id: string) => {
      const cooperativeId = requireActiveCooperativeId();

      return cooperativeMemberRoleService.delete(cooperativeId, id);
    },

    onSuccess: async (_, id) => {
      const cooperativeId = requireActiveCooperativeId();

      queryClient.removeQueries({
        queryKey: cooperativeMemberRoleQueryKeys.detail(cooperativeId, id),
      });

      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberRoleQueryKeys.lists(cooperativeId),
      });
    },
  });
};
