import type { CooperativeMemberRoleListParams } from '../../types/cooperativeMemberRoleTypes';

export const cooperativeMemberRoleQueryKeys = {
  all: ['cooperative-member-roles'] as const,

  permissions: () => [...cooperativeMemberRoleQueryKeys.all, 'permissions'] as const,

  lists: () => [...cooperativeMemberRoleQueryKeys.all, 'list'] as const,

  list: (params: CooperativeMemberRoleListParams) =>
    [...cooperativeMemberRoleQueryKeys.lists(), params] as const,

  details: (cooperativeId: string) =>
    [...cooperativeMemberRoleQueryKeys.all, cooperativeId, 'detail'] as const,

  detail: (cooperativeId: string, id: string) =>
    [...cooperativeMemberRoleQueryKeys.details(cooperativeId), id] as const,
};
