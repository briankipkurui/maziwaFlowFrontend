import type { CooperativeMemberListParams } from '../../types/cooperativeMember';

export const cooperativeMemberQueryKeys = {
  all: ['cooperative-members'] as const,

  lists: (cooperativeId: string) =>
    [...cooperativeMemberQueryKeys.all, cooperativeId, 'list'] as const,

  list: (cooperativeId: string, params: CooperativeMemberListParams) =>
    [...cooperativeMemberQueryKeys.lists(cooperativeId), params] as const,

  details: (cooperativeId: string) =>
    [...cooperativeMemberQueryKeys.all, cooperativeId, 'detail'] as const,

  detail: (cooperativeId: string, id: string) =>
    [...cooperativeMemberQueryKeys.details(cooperativeId), id] as const,
};
