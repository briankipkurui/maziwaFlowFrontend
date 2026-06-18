import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type {
  CooperativeMemberRolePayload,
  ReplaceCooperativeMemberRolePermissionsPayload,
} from '../../types/cooperativeMemberRoleTypes';

import { cooperativeMemberRoleService } from '../../services/cooperativeMemberRolesService';
import { cooperativeMemberRoleQueryKeys } from '../queryKeys/cooperativeMemberRolesQueryKeys';

type CooperativeMemberRoleDetailsPayload = Omit<CooperativeMemberRolePayload, 'permissionIds'>;

export const useCreateCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CooperativeMemberRoleDetailsPayload) => {
      return cooperativeMemberRoleService.create(payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberRoleQueryKeys.lists(),
      });
    },
  });
};

export const useUpdateCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CooperativeMemberRoleDetailsPayload;
    }) => {
      return cooperativeMemberRoleService.update(id, payload);
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useReplaceCooperativeMemberRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReplaceCooperativeMemberRolePermissionsPayload;
    }) => {
      return cooperativeMemberRoleService.replacePermissions(id, payload);
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.detail(variables.id),
        }),

        queryClient.invalidateQueries({
          queryKey: cooperativeMemberRoleQueryKeys.permissions(),
        }),
      ]);
    },
  });
};

export const useDeleteCooperativeMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return cooperativeMemberRoleService.delete(id);
    },

    onSuccess: async (_, id) => {
      queryClient.removeQueries({
        queryKey: cooperativeMemberRoleQueryKeys.detail(id),
      });

      await queryClient.invalidateQueries({
        queryKey: cooperativeMemberRoleQueryKeys.lists(),
      });
    },
  });
};