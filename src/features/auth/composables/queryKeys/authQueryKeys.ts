export const authQueryKeys = {
  all: ['auth'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
  currentUser: () => [...authQueryKeys.all, 'current-user'] as const,
};
