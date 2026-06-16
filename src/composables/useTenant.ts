import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function useTenant() {
  const route = useRoute();
  const router = useRouter();

  const tenantCode = computed(() => {
    const tenant = route.query.tenant;

    if (Array.isArray(tenant)) {
      return tenant[0]?.toString() ?? '';
    }

    if (tenant) {
      return tenant.toString();
    }

    // Future live setup:
    // Example: default-coop.maziwaflow.com
    const host = window.location.hostname;
    const parts = host.split('.');

    if (parts.length > 2) {
      return parts[0];
    }

    return '';
  });

  const hasTenant = computed(() => !!tenantCode.value);

  const withTenantQuery = (path: string) => {
    return {
      path,
      query: tenantCode.value
        ? {
            tenant: tenantCode.value,
          }
        : {},
    };
  };

  const goToWithTenant = async (path: string) => {
    await router.push(withTenantQuery(path));
  };

  const replaceWithTenant = async (path: string) => {
    await router.replace(withTenantQuery(path));
  };

  return {
    tenantCode,
    hasTenant,
    withTenantQuery,
    goToWithTenant,
    replaceWithTenant,
  };
}
