import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { cooperativeQueryKeys } from '../queryKeys/cooperativeQueryKeys';
import { cooperativeService } from '../../services/cooperativeService';
import type { CooperativeListParams } from '../../types/cooperative';

export const useCooperativesQuery = (params: Ref<CooperativeListParams>) => {
  return useQuery({
    queryKey: computed(() => cooperativeQueryKeys.list(params.value)),
    queryFn: () => cooperativeService.list(params.value),
  });
};

export const useCooperativeQuery = (id: Ref<string>) => {
  return useQuery({
    queryKey: computed(() => cooperativeQueryKeys.detail(id.value)),
    queryFn: () => cooperativeService.getById(id.value),
    enabled: computed(() => Boolean(id.value)),
  });
};
