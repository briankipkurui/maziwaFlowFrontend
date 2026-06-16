export const CooperativeMemberEndpoints = {
  create: '/cooperative-members',
  list: '/cooperative-members',
  getById: (id: string) => `/cooperative-members/${id}`,
  update: (id: string) => `/cooperative-members/${id}`,
  delete: (id: string) => `/cooperative-members/${id}`,
};
