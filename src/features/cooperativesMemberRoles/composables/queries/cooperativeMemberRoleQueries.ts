import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import type { CooperativeMemberRoleListParams } from '../../types/cooperativeMemberRoleTypes';
import { cooperativeMemberRoleQueryKeys } from '../queryKeys/cooperativeMemberRolesQueryKeys';
import { cooperativeMemberRoleService } from '../../services/cooperativeMemberRolesService';

export const useCooperativeMemberRolesQuery = (params: Ref<CooperativeMemberRoleListParams>) => {
  return useQuery({
    queryKey: computed(() => cooperativeMemberRoleQueryKeys.list(params.value)),
    queryFn: () => cooperativeMemberRoleService.list(params.value),
  });
};

export const useCooperativeMemberRoleQuery = (id: Ref<string>) => {
  return useQuery({
    queryKey: computed(() => cooperativeMemberRoleQueryKeys.detail(id.value)),

    queryFn: () => cooperativeMemberRoleService.getById(id.value),

    enabled: computed(() => Boolean(id.value)),
  });
};

export const useCooperativeMemberRolePermissionsQuery = () => {
  return useQuery({
    queryKey: computed(() => cooperativeMemberRoleQueryKeys.permissions()),

    queryFn: () => cooperativeMemberRoleService.permissions(),
  });
};