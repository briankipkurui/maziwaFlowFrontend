import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteParamsRaw } from 'vue-router';

export function useRouteParams() {
  const route = useRoute() as RouteLocationNormalizedLoaded;
  const router = useRouter();

  const params = route.params;
  const query = route.query;
  const path = route.path;

  function getParam<T = string | null>(key: string, fallback: T | null = null): T | null {
    const val = route.params[key as keyof typeof route.params] as unknown;
    if (val === undefined) return fallback;
    return val as unknown as T;
  }

  function getQuery<T = string | null>(key: string, fallback: T | null = null): T | null {
    const val = route.query[key];
    if (val === undefined) return fallback;
    // prefer first value when query param is an array
    if (Array.isArray(val)) return val[0] as unknown as T;
    return val as unknown as T;
  }

  const coopId = computed(() => {
    const id = route.params.id ?? route.params.coopId ?? null;
    if (id == null) return null;
    return typeof id === 'string' ? id : String(id);
  });

  async function navigateTo(
    nameOrLocation: string | RouteLocationRaw,
    params?: RouteParamsRaw,
    replace = false,
  ) {
    const location: RouteLocationRaw =
      typeof nameOrLocation === 'string' ? { name: nameOrLocation, params } : nameOrLocation;
    if (replace) return router.replace(location);
    return router.push(location);
  }

  function ensureIdValid(validator?: (v: string | null) => boolean) {
    const v = coopId.value;
    if (!validator) return v != null && v !== '';
    return validator(v);
  }

  return {
    route,
    router,
    params,
    query,
    path,
    getParam,
    getQuery,
    coopId,
    navigateTo,
    ensureIdValid,
  };
}

export type UseRouteParams = ReturnType<typeof useRouteParams>;
