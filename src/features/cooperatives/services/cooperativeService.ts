import http from '@/services/axios';
import { CooperativeEndpoints } from '../endpoints/cooperativeEndpoints';
import type {
    Cooperative,
    CooperativeListParams,
    CooperativePayload,
    CooperativeResponse,
} from '../types/cooperative';

class CooperativeService {
    async list(
        params: CooperativeListParams,
    ): Promise<CooperativeResponse> {
        const { limit, ...filteredParams } = params;

        const response = await http.get<CooperativeResponse>(
            CooperativeEndpoints.list,
            {
                params: filteredParams,
            },
        );

        return response.data;
    }

    async getById(id: string): Promise<Cooperative> {
        const response = await http.get<Cooperative>(
            CooperativeEndpoints.getById(id),
        );

        return response.data;
    }

    async create(payload: CooperativePayload): Promise<Cooperative> {
        const response = await http.post<Cooperative>(
            CooperativeEndpoints.create,
            payload,
        );

        return response.data;
    }

    async update(
        id: string,
        payload: CooperativePayload,
    ): Promise<Cooperative> {
        const response = await http.patch<Cooperative>(
            CooperativeEndpoints.update(id),
            payload,
        );

        return response.data;
    }

    async delete(id: string): Promise<void> {
        await http.delete(CooperativeEndpoints.delete(id));
    }
}

export const cooperativeService = new CooperativeService();