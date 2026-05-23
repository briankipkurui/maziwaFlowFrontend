export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export const usersKeys = {
  all: ['users'] as const,
  list: (page: number, limit: number) => [...usersKeys.all, 'list', { page, limit }] as const,
};
