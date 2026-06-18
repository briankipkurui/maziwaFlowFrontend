import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import type { CooperativeMemberRoleListParams } from '../../types/cooperativeMemberRoleTypes';
import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';
import { cooperativeMemberRoleQueryKeys } from '../queryKeys/cooperativeMemberRolesQueryKeys';
import { cooperativeMemberRoleService } from '../../services/cooperativeMemberRolesService';

export const useCooperativeMemberRolesQuery = (params: Ref<CooperativeMemberRoleListParams>) => {
  return useQuery({
    queryKey: computed(() => cooperativeMemberRoleQueryKeys.list(params.value)),
    queryFn: () => cooperativeMemberRoleService.list(params.value),
  });
};

export const useCooperativeMemberRoleQuery = (id: Ref<string>) => {
  const { activeCooperativeId, requireActiveCooperativeId } = useActiveCooperative();

  return useQuery({
    queryKey: computed(() =>
      cooperativeMemberRoleQueryKeys.detail(activeCooperativeId.value ?? '', id.value),
    ),

    queryFn: () => cooperativeMemberRoleService.getById(requireActiveCooperativeId(), id.value),

    enabled: computed(() => Boolean(activeCooperativeId.value && id.value)),
  });
};

export const useCooperativeMemberRolePermissionsQuery = () => {
  const { activeCooperativeId } = useActiveCooperative();

  return useQuery({
    queryKey: computed(() => cooperativeMemberRoleQueryKeys.permissions()),

    queryFn: () => cooperativeMemberRoleService.permissions(),

    enabled: computed(() => Boolean(activeCooperativeId.value)),
  });
};
