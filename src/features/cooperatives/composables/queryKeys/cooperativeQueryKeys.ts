import type { CooperativeListParams } from '../../types/cooperative';

export const cooperativeQueryKeys = {
  all: ['cooperatives'] as const,

  lists: () => [...cooperativeQueryKeys.all, 'list'] as const,

  list: (params: CooperativeListParams) => [...cooperativeQueryKeys.lists(), params] as const,

  details: () => [...cooperativeQueryKeys.all, 'detail'] as const,

  detail: (id: string) => [...cooperativeQueryKeys.details(), id] as const,
};
