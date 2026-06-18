export interface CooperativeMemberPermission {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CooperativeMemberRolePermission {
  id: string;
  roleId?: string;
  permissionId?: string;
  permission?: CooperativeMemberPermission;
  createdAt?: string;
  updatedAt?: string;
}

export interface CooperativeMemberRole {
  id: string;
  cooperativeId: string;
  name: string;
  description?: string | null;
  permissions?: CooperativeMemberPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CooperativeMemberRolePayload {
  name: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface ReplaceCooperativeMemberRolePermissionsPayload {
  permissionIds: string[];
}

export interface CooperativeMemberRoleListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CooperativeMemberRoleResponse {
  totalItems: number;
  results: CooperativeMemberRole[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  limit: number;
}
