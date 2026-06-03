import { useMutation } from '@tanstack/vue-query';
import type { LoginRequest } from '../../types/cooperativeUnion';
import { authService } from '../../services/cooperativeUnionService';
import { useAuthFeatureStore } from '../../stores/authStore';

export const useLoginMutation = () => {
    const authStore = useAuthFeatureStore();

    return useMutation({
        mutationFn: (credentials: LoginRequest) =>
            authService.login(credentials),

        onSuccess: (data) => {
            authStore.setAuth(data);
        },
    });
};