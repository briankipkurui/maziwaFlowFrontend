import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { cooperativeMemberService } from '../../services/cooperativeMemberService';
import { cooperativeMemberQueryKeys } from '../queryKeys/cooperativeMemberQueryKeys';

import type { CooperativeMemberListParams } from '../../types/cooperativeMember';
import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';

export const useCooperativeMembersQuery = (
    params: Ref<CooperativeMemberListParams>,
) => {
    const {
        activeCooperativeId,
        requireActiveCooperativeId,
    } = useActiveCooperative();

    return useQuery({
        queryKey: computed(() =>
            cooperativeMemberQueryKeys.list(
                activeCooperativeId.value ?? '',
                params.value,
            ),
        ),

        queryFn: () =>
            cooperativeMemberService.list(
                requireActiveCooperativeId(),
                params.value,
            ),

        enabled: computed(() => Boolean(activeCooperativeId.value)),
    });
};

export const useCooperativeMemberQuery = (
    id: Ref<string>,
) => {
    const {
        activeCooperativeId,
        requireActiveCooperativeId,
    } = useActiveCooperative();

    return useQuery({
        queryKey: computed(() =>
            cooperativeMemberQueryKeys.detail(
                activeCooperativeId.value ?? '',
                id.value,
            ),
        ),

        queryFn: () =>
            cooperativeMemberService.getById(
                requireActiveCooperativeId(),
                id.value,
            ),

        enabled: computed(
            () => Boolean(activeCooperativeId.value && id.value),
        ),
    });
};