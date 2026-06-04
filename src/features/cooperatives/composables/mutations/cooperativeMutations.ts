import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cooperativeService } from '../../services/cooperativeService';
import { cooperativeQueryKeys } from '../queryKeys/cooperativeQueryKeys';
import type { CooperativePayload } from '../../types/cooperative';

export const useCreateCooperativeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CooperativePayload) =>
            cooperativeService.create(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: cooperativeQueryKeys.all,
            });
        },
    });
};

export const useUpdateCooperativeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: CooperativePayload;
        }) => cooperativeService.update(id, payload),

        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: cooperativeQueryKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: cooperativeQueryKeys.detail(variables.id),
                }),
            ]);
        },
    });
};

export const useDeleteCooperativeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            cooperativeService.delete(id),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: cooperativeQueryKeys.all,
            });
        },
    });
};