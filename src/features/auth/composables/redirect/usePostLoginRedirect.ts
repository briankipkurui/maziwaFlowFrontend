import { useTenant } from '@/composables/useTenant';

interface AuthRole {
  name?: string | null;
}

interface AuthUser {
  role?: AuthRole | null;
  roles?: AuthRole[] | null;
}

const normalizeRoleName = (roleName?: string | null): string => {
  return (
    roleName
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_') ?? ''
  );
};

/**
 * Add or change role-based destinations here.
 *
 * The key is the normalized role name returned by the backend.
 * Spaces and hyphens are automatically converted to underscores.
 */
const roleRoutes: Record<string, string> = {
  super_admin: '/admin',
  default_admin: '/admin',
  cooperative_admin: '/cooperative-admin',
  cooperative_manager: '/cooperative-admin',
  vet: '/vet',
  member: '/',
};

const defaultAuthenticatedRoute = '/';

export const usePostLoginRedirect = () => {
  const { goToWithTenant, replaceWithTenant } = useTenant();

  const getUserRoleNames = (user: AuthUser): string[] => {
    const roleNames = [user.role?.name, ...(user.roles?.map((role) => role.name) ?? [])];

    return roleNames.map(normalizeRoleName).filter(Boolean);
  };

  const getPostLoginRoute = (user: AuthUser): string => {
    const roleNames = getUserRoleNames(user);

    for (const roleName of roleNames) {
      const route = roleRoutes[roleName];

      if (route) {
        return route;
      }
    }

    return defaultAuthenticatedRoute;
  };

  const redirectAfterLogin = async (user: AuthUser): Promise<void> => {
    const route = getPostLoginRoute(user);

    await goToWithTenant(route);
  };

  const preserveLoginRoute = async (): Promise<void> => {
    await replaceWithTenant('/login');
  };

  return {
    redirectAfterLogin,
    preserveLoginRoute,
    getPostLoginRoute,
  };
};
