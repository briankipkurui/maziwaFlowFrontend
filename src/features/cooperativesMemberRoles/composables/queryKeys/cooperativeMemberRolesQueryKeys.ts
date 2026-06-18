import type { CooperativeMemberRoleListParams } from '../../types/cooperativeMemberRoleTypes';

export const cooperativeMemberRoleQueryKeys = {
  all: ['cooperative-member-roles'] as const,

  permissions: () => [...cooperativeMemberRoleQueryKeys.all, 'permissions'] as const,

  lists: () => [...cooperativeMemberRoleQueryKeys.all, 'list'] as const,

  list: (params: CooperativeMemberRoleListParams) =>
    [...cooperativeMemberRoleQueryKeys.lists(), params] as const,

  details: () => [...cooperativeMemberRoleQueryKeys.all, 'detail'] as const,

  detail: (id: string) => [...cooperativeMemberRoleQueryKeys.details(), id] as const,
};