import http from '@/services/axios';

import { CooperativeMemberEndpoints } from '../endpoints/cooperativeMemberEndpoints';

import type {
    CooperativeMember,
    CooperativeMemberListParams,
    CooperativeMemberPayload,
    CooperativeMemberResponse,
} from '../types/cooperativeMember';

class CooperativeMemberService {
    async list(
        cooperativeId: string,
        params: CooperativeMemberListParams,
    ): Promise<CooperativeMemberResponse> {
        const response = await http.get<CooperativeMemberResponse>(
            CooperativeMemberEndpoints.list,
            {
                params: {
                    ...params,
                    cooperativeId,
                },
            },
        );

        return response.data;
    }

    async getById(
        cooperativeId: string,
        id: string,
    ): Promise<CooperativeMember> {
        const response = await http.get<CooperativeMember>(
            CooperativeMemberEndpoints.getById(id),
            {
                params: {
                    cooperativeId,
                },
            },
        );

        return response.data;
    }

    async create(
        cooperativeId: string,
        payload: CooperativeMemberPayload,
    ): Promise<CooperativeMember> {
        const response = await http.post<CooperativeMember>(
            CooperativeMemberEndpoints.create,
            payload,
            {
                params: {
                    cooperativeId,
                },
            },
        );

        return response.data;
    }

    async update(
        cooperativeId: string,
        id: string,
        payload: CooperativeMemberPayload,
    ): Promise<CooperativeMember> {
        const response = await http.put<CooperativeMember>(
            CooperativeMemberEndpoints.update(id),
            payload,
            {
                params: {
                    cooperativeId,
                },
            },
        );

        return response.data;
    }

    async delete(
        cooperativeId: string,
        id: string,
    ): Promise<void> {
        await http.delete(CooperativeMemberEndpoints.delete(id), {
            params: {
                cooperativeId,
            },
        });
    }
}

export const cooperativeMemberService =
    new CooperativeMemberService();