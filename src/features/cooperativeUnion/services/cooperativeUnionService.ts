import http from '@/services/axios';
import { CooperativeUnionEndpoints } from '../endpoints/coperativeUnionEndpoints';
import type { CooperativeUnionListParams, CooperativeUnionResponse } from '../types/cooperativeUnion';

class CooperativeUnionService {
    async list(
        params: CooperativeUnionListParams,
    ): Promise<CooperativeUnionResponse> {
        const response = await http.get<CooperativeUnionResponse>(
            CooperativeUnionEndpoints.list,
            { params },
        );

        return response.data;
    }
}

export const cooperativeUnionService = new CooperativeUnionService();