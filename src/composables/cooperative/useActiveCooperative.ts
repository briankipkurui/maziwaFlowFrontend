import { useAuthFeatureStore } from '@/features/auth/stores/authStore';
import { storeToRefs } from 'pinia';


export const useActiveCooperative = () => {
    const authStore = useAuthFeatureStore();

    const { activeCooperativeId, activeCooperative } = storeToRefs(authStore);

    const requireActiveCooperativeId = (): string => {
        const cooperativeId = activeCooperativeId.value;

        if (!cooperativeId) {
            throw new Error(
                'No cooperative is linked to the logged-in account. Please log in again.',
            );
        }

        return cooperativeId;
    };

    return {
        activeCooperativeId,
        activeCooperative,
        requireActiveCooperativeId,
    };
};