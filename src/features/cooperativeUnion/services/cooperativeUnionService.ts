import http from '@/services/axios';
import { CooperativeUnionEndpoints } from '../endpoints/coperativeUnionEndpoints';
import type {
  CooperativeUnion,
  CooperativeUnionListParams,
  CooperativeUnionPayload,
  CooperativeUnionResponse,
} from '../types/cooperativeUnion';

class CooperativeUnionService {
  // async list(
  //     params: CooperativeUnionListParams,
  // ): Promise<CooperativeUnionResponse> {
  //     const response = await http.get<CooperativeUnionResponse>(
  //         CooperativeUnionEndpoints.list,
  //         { params },
  //     );

  //     return response.data;
  // }

  async list(params: CooperativeUnionListParams): Promise<CooperativeUnionResponse> {
    const { limit, ...filteredParams } = params;

    const response = await http.get<CooperativeUnionResponse>(CooperativeUnionEndpoints.list, {
      params: filteredParams,
    });

    return response.data;
  }
  async create(payload: CooperativeUnionPayload): Promise<CooperativeUnion> {
    const response = await http.post<CooperativeUnion>(CooperativeUnionEndpoints.create, payload);

    return response.data;
  }

  async update(id: string, payload: CooperativeUnionPayload): Promise<CooperativeUnion> {
    const response = await http.patch<CooperativeUnion>(
      CooperativeUnionEndpoints.update(id),
      payload,
    );

    return response.data;
  }
}

export const cooperativeUnionService = new CooperativeUnionService();
