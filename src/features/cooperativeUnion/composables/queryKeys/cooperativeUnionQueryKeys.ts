// import type { CooperativeUnionListParams } from '../types/cooperativeUnion';

import type { CooperativeUnionListParams } from '../../types/cooperativeUnion';

export const cooperativeUnionQueryKeys = {
  all: ['cooperative-unions'] as const,

  lists: () => [...cooperativeUnionQueryKeys.all, 'list'] as const,

  list: (params: CooperativeUnionListParams) =>
    [...cooperativeUnionQueryKeys.lists(), params] as const,
};
