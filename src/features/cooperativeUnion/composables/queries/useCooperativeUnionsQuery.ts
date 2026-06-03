import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
// import { cooperativeUnionService } from '../services/cooperativeUnion.service';
import { cooperativeUnionQueryKeys } from '../queryKeys/cooperativeUnionQueryKeys';
import type { CooperativeUnionListParams } from '../../types/cooperativeUnion';
import { cooperativeUnionService } from '../../services/cooperativeUnionService';
// import type { CooperativeUnionListParams } from '../types/cooperativeUnion';
// 
export const useCooperativeUnionsQuery = (
    params: Ref<CooperativeUnionListParams>,
) => {
    return useQuery({
        queryKey: computed(() => cooperativeUnionQueryKeys.list(params.value)),
        queryFn: () => cooperativeUnionService.list(params.value),
    });
};