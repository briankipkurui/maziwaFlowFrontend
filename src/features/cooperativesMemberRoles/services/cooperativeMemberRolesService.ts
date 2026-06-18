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

type CooperativeMemberRoleDetailsPayload = Omit<CooperativeMemberRolePayload, 'permissionIds'>;

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

  async getById(id: string): Promise<CooperativeMemberRole> {
    const response = await http.get<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.getById(id),
    );

    return response.data;
  }

  async create(payload: CooperativeMemberRoleDetailsPayload): Promise<CooperativeMemberRole> {
    const response = await http.post<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.create,
      payload,
    );

    return response.data;
  }

  async update(
    id: string,
    payload: CooperativeMemberRoleDetailsPayload,
  ): Promise<CooperativeMemberRole> {
    const response = await http.put<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.update(id),
      payload,
    );

    return response.data;
  }

  async replacePermissions(
    id: string,
    payload: ReplaceCooperativeMemberRolePermissionsPayload,
  ): Promise<CooperativeMemberRole> {
    const response = await http.put<CooperativeMemberRole>(
      CooperativeMemberRoleEndpoints.replacePermissions(id),
      payload,
    );

    return response.data;
  }

  async delete(id: string): Promise<void> {
    await http.delete(CooperativeMemberRoleEndpoints.delete(id));
  }
}

export const cooperativeMemberRoleService = new CooperativeMemberRoleService();