export const CooperativeMemberRoleEndpoints = {
  permissions: '/cooperative-member-roles/permissions',
  create: '/cooperative-member-roles',
  list: '/cooperative-member-roles',
  getById: (id: string) => `/cooperative-member-roles/${id}`,
  update: (id: string) => `/cooperative-member-roles/${id}`,
  delete: (id: string) => `/cooperative-member-roles/${id}`,

  replacePermissions: (id: string) => `/cooperative-member-roles/${id}/permissions`,
};
