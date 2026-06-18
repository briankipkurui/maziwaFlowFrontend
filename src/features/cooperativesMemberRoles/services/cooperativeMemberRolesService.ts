import http from '@/services/axios';

import type {
  CooperativeMemberPermission,
  CooperativeMemberRole,
  CooperativeMemberRoleListParams,
  CooperativeMemberRolePayload,
  CooperativeMemberRoleResponse,
  ReplaceCooperativeMemberRolePermissionsPayload,
} from '../types/cooperativeMemberRoleTypes';
import { CooperativeMemberRoleEndpoints } from '../endpoints/cooperativeMemberRolesEndpoints';

class CooperativeMemberRoleService {
  async list(params: CooperativeMemberRoleListParams): Promise<CooperativeMemberRoleResponse> {
    const response = await http.get<CooperativeMemberRoleResponse>(
      CooperativeMemberRoleEndpoints.list,
      {
        params: {
          ...params,
        },
      },
    );

    return response.data;
  }

  async permissions(): Promise<CooperativeMemberPermission[]> {
    const response = await http.get<CooperativeMemberPermission[]>(
      CooperativeMemberRoleEndpoints.permissions,
    );

    return response.data;
  }

  async getById(cooperativeId: string, id: string): Promise<CooperativeMemberRole> {
    const response = await http.get<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.getById(id),
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
    payload: CooperativeMemberRolePayload,
  ): Promise<CooperativeMemberRole> {
    const response = await http.post<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.create,
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
    payload: CooperativeMemberRolePayload,
  ): Promise<CooperativeMemberRole> {
    const response = await http.put<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.update(id),
      payload,
      {
        params: {
          cooperativeId,
        },
      },
    );

    return response.data;
  }

  async replacePermissions(
    cooperativeId: string,
    id: string,
    payload: ReplaceCooperativeMemberRolePermissionsPayload,
  ): Promise<CooperativeMemberRole> {
    const response = await http.put<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.replacePermissions(id),
      payload,
      {
        params: {
          cooperativeId,
        },
      },
    );

    return response.data;
  }

  async delete(cooperativeId: string, id: string): Promise<void> {
    await http.delete(CooperativeMemberRoleEndpoints.delete(id), {
      params: {
        cooperativeId,
      },
    });
  }
}

export const cooperativeMemberRoleService = new CooperativeMemberRoleService();
