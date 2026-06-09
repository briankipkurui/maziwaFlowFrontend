<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Bell,
  ChevronDown,
  CircleHelp,
  Megaphone,
  Moon,
  Sun,
} from 'lucide-vue-next';

import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Drawer from 'primevue/drawer';
import Menu from 'primevue/menu';
import OverlayBadge from 'primevue/overlaybadge';
import PanelMenu from 'primevue/panelmenu';
import ScrollPanel from 'primevue/scrollpanel';

import type { MenuItem } from 'primevue/menuitem';

/* ============================================================
   TYPES
============================================================ */

type ChildSidebarItem = {
  label: string;
  path: string;
  icon?: Component;
  badge?: string;
  children?: ChildSidebarItem[];
};

type SidebarItem = {
  label: string;
  path: string;
  icon: Component;
  badge?: string;
  children?: ChildSidebarItem[];
};

type UserMenuItem = {
  label: string;
  path?: string;
  danger?: boolean;
};

type PrimeSidebarItem = MenuItem & {
  key: string;
  route?: string;
  iconComponent?: Component;
  badge?: string;
  level: number;
  items?: PrimeSidebarItem[];
};

type PrimeProfileItem = MenuItem & {
  danger?: boolean;
};

type Theme = 'dark' | 'light';

/* ============================================================
   PROPS AND EVENTS
============================================================ */

const props = defineProps<{
  title: string;
  subtitle: string;
  sidebarItems: SidebarItem[];

  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userMenuItems: UserMenuItem[];
}>();

const emit = defineEmits<{
  logout: [];
  announcements: [];
}>();

/* ============================================================
   STATE
============================================================ */

const route = useRoute();
const router = useRouter();

const MOBILE_BREAKPOINT = 768;

const isMobile = ref(false);
const isDrawerVisible = ref(false);
const theme = ref<Theme>('dark');

const expandedKeys = ref<Record<string, boolean>>({});

const userPopupMenu = ref<InstanceType<typeof Menu> | null>(null);

/* ============================================================
   THEME
============================================================ */

const applyTheme = (selectedTheme: Theme) => {
  document.documentElement.classList.toggle('light', selectedTheme === 'light');

  localStorage.setItem('theme', selectedTheme);
};

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';

  applyTheme(theme.value);
};

/* ============================================================
   RESPONSIVE DRAWER
============================================================ */

const syncViewport = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
};

const openDrawer = () => {
  isDrawerVisible.value = true;
};

const closeDrawer = () => {
  isDrawerVisible.value = false;
};

/* ============================================================
   ROUTE HELPERS
============================================================ */

const isRouteActive = (path?: string): boolean => {
  if (!path) {
    return false;
  }

  return route.path === path || route.path.startsWith(`${path}/`);
};

const isSidebarItemActive = (item: MenuItem): boolean => {
  const sidebarItem = item as PrimeSidebarItem;

  if (isRouteActive(sidebarItem.route)) {
    return true;
  }

  return sidebarItem.items?.some((child) => isSidebarItemActive(child)) === true;
};

/* ============================================================
   PRIMEVUE PANEL MENU MODEL
============================================================ */

const mapChildSidebarItem = (item: ChildSidebarItem, level: number): PrimeSidebarItem => {
  const hasChildren = Boolean(item.children?.length);

  return {
    key: item.path,
    label: item.label,
    route: hasChildren ? undefined : item.path,
    iconComponent: item.icon,
    badge: item.badge,
    level,

    command: hasChildren
      ? undefined
      : () => {
          void router.push(item.path).then(() => {
            closeDrawer();
          });
        },

    items: item.children?.map((child) => mapChildSidebarItem(child, level + 1)),
  };
};

const sidebarMenuItems = computed<PrimeSidebarItem[]>(() => {
  return props.sidebarItems.map((item) => {
    const hasChildren = Boolean(item.children?.length);

    return {
      key: item.path,
      label: item.label,
      route: hasChildren ? undefined : item.path,
      iconComponent: item.icon,
      badge: item.badge,
      level: 0,

      command: hasChildren
        ? undefined
        : () => {
            void router.push(item.path).then(() => {
              closeDrawer();
            });
          },

      items: item.children?.map((child) => mapChildSidebarItem(child, 1)),
    };
  });
});

const getSidebarIcon = (item: MenuItem): Component | undefined => {
  return (item as PrimeSidebarItem).iconComponent;
};

const getSidebarBadge = (item: MenuItem): string | undefined => {
  return (item as PrimeSidebarItem).badge;
};

const getSidebarLevel = (item: MenuItem): number => {
  return (item as PrimeSidebarItem).level ?? 0;
};

const collectActiveParentKeys = (
  items: PrimeSidebarItem[],
  collectedKeys: Record<string, boolean>,
): boolean => {
  let containsActiveRoute = false;

  for (const item of items) {
    const itemIsActive = isRouteActive(item.route);

    const childIsActive = item.items?.length
      ? collectActiveParentKeys(item.items, collectedKeys)
      : false;

    if (childIsActive) {
      collectedKeys[item.key] = true;
    }

    if (itemIsActive || childIsActive) {
      containsActiveRoute = true;
    }
  }

  return containsActiveRoute;
};

const expandActiveMenus = () => {
  const activeKeys: Record<string, boolean> = {};

  collectActiveParentKeys(sidebarMenuItems.value, activeKeys);

  expandedKeys.value = {
    ...expandedKeys.value,
    ...activeKeys,
  };
};

watch(
  [sidebarMenuItems, () => route.path],
  () => {
    expandActiveMenus();
  },
  {
    immediate: true,
  },
);

/* ============================================================
   PRIMEVUE PROFILE MENU
============================================================ */

const toggleUserPopupMenu = (event: Event) => {
  userPopupMenu.value?.toggle(event);
};

const profileMenuItems = computed<PrimeProfileItem[]>(() => {
  const items: PrimeProfileItem[] = [];

  if (isMobile.value) {
    items.push(
      {
        label: theme.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: theme.value === 'dark' ? 'pi pi-sun' : 'pi pi-moon',
        command: toggleTheme,
      },
      {
        label: 'Announcements',
        icon: 'pi pi-megaphone',
        command: () => emit('announcements'),
      },
      {
        separator: true,
      },
    );
  }

  items.push(
    ...props.userMenuItems.map((item) => ({
      label: item.label,
      icon: item.danger ? 'pi pi-sign-out' : 'pi pi-user',
      danger: item.danger,

      command: () => {
        if (item.danger) {
          emit('logout');

          return;
        }

        if (item.path) {
          void router.push(item.path);
        }
      },
    })),
  );

  return items;
});

/* ============================================================
   INITIALIZATION
============================================================ */

onMounted(() => {
  syncViewport();

  window.addEventListener('resize', syncViewport);

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark' || savedTheme === 'light') {
    theme.value = savedTheme;
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  applyTheme(theme.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport);
});
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- ======================================================= -->
    <!-- PRIMEVUE DRAWER -->
    <!-- ======================================================= -->

    <Drawer
      id="admin-sidebar"
      v-model:visible="isDrawerVisible"
      position="left"
      :show-close-icon="false"
      class="!w-full sm:!w-[360px]"
    >
      <template #container="{ closeCallback }">
        <div class="flex h-full flex-col bg-secondary text-secondary-text">
          <!-- ================================================= -->
          <!-- BRAND -->
          <!-- ================================================= -->

          <div class="flex h-[78px] shrink-0 items-center justify-between px-5">
            <div class="flex min-w-0 items-center gap-3">
              <!-- Logo -->
              <div class="grid h-11 w-11 shrink-0 grid-cols-3 gap-[3px] rounded-xl bg-surface p-2">
                <span
                  v-for="i in 9"
                  :key="i"
                  class="rounded-[2px]"
                  :class="i === 5 || i === 7 ? 'bg-heading' : 'bg-primary'"
                />
              </div>

              <div class="min-w-0 leading-tight">
                <h1 class="truncate text-[21px] font-extrabold tracking-tight text-heading">
                  Maziwa<span class="text-primary">Flow</span>
                </h1>

                <p
                  class="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-muted-text"
                >
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <Button
              icon="pi pi-times"
              rounded
              outlined
              severity="secondary"
              aria-label="Close sidebar"
              @click="closeCallback"
            />
          </div>

          <Divider class="!my-0" />

          <!-- ================================================= -->
          <!-- NAVIGATION -->
          <!-- ================================================= -->

          <div class="min-h-0 flex-1">
            <ScrollPanel class="h-full">
              <div class="px-4 py-6">
                <p
                  class="mb-4 px-2 text-[11px] font-extrabold uppercase tracking-[0.28em]"
                  :class="theme === 'light' ? 'text-[#343434]' : 'text-subtle-text'"
                >
                  {{ title }}
                </p>

                <PanelMenu
                  v-model:expanded-keys="expandedKeys"
                  :model="sidebarMenuItems"
                  multiple
                  unstyled
                  class="w-full"
                >
                  <template #item="{ item, props: panelMenuProps, hasSubmenu, active }">
                    <a
                      v-ripple
                      v-bind="panelMenuProps.action"
                      class="group mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200"
                      :class="
                        isSidebarItemActive(item)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : theme === 'light'
                            ? 'text-[#343434] hover:bg-orange-50 hover:text-primary'
                            : 'text-secondary-text hover:bg-surface hover:text-primary'
                      "
                      :style="{
                        paddingLeft: `${12 + getSidebarLevel(item) * 18}px`,
                      }"
                    >
                      <!-- Menu Icon -->
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
                        :class="
                          isSidebarItemActive(item)
                            ? 'bg-white/15 text-primary-foreground'
                            : theme === 'light'
                              ? 'bg-[#f4f4f5] text-[#5f6368] group-hover:bg-orange-100 group-hover:text-primary'
                              : 'bg-surface text-muted-text group-hover:text-primary'
                        "
                      >
                        <component
                          v-if="getSidebarIcon(item)"
                          :is="getSidebarIcon(item)"
                          class="h-[18px] w-[18px]"
                          :stroke-width="2"
                        />

                        <i v-else class="pi pi-circle-fill text-[7px]" />
                      </span>

                      <!-- Label -->
                      <span class="min-w-0 flex-1 truncate">
                        {{ item.label }}
                      </span>

                      <!-- Optional Badge -->
                      <Badge
                        v-if="getSidebarBadge(item)"
                        :value="getSidebarBadge(item)"
                        severity="contrast"
                      />

                      <!-- Expand Arrow -->
                      <i
                        v-if="hasSubmenu"
                        class="pi text-xs transition-transform duration-200"
                        :class="active ? 'pi-chevron-down' : 'pi-chevron-right'"
                      />
                    </a>
                  </template>
                </PanelMenu>
              </div>
            </ScrollPanel>
          </div>

          <!-- ================================================= -->
          <!-- DRAWER FOOTER -->
          <!-- ================================================= -->

          <Divider class="!my-0" />

          <div class="flex shrink-0 items-center gap-3 px-5 py-4">
            <Avatar
              :label="userInitials || 'BM'"
              shape="circle"
              class="!bg-primary !text-primary-foreground"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-heading">
                {{ userName || 'User Name' }}
              </p>

              <p class="truncate text-xs text-muted-text">
                {{ userEmail || 'user@email.com' }}
              </p>
            </div>

            <Button
              icon="pi pi-sign-out"
              rounded
              text
              severity="danger"
              aria-label="Logout"
              @click="emit('logout')"
            />
          </div>
        </div>
      </template>
    </Drawer>

    <!-- ======================================================= -->
    <!-- HEADER -->
    <!-- ======================================================= -->

    <header
      class="fixed left-0 right-0 top-0 z-30 flex h-[76px] items-center justify-between border-b border-surface bg-secondary px-3 transition-all duration-300 sm:px-6"
      :class="theme === 'light' ? 'shadow-none' : 'shadow-lg'"
    >
      <div class="flex items-center gap-4">
        <!-- Open Drawer -->
        <Button
          icon="pi pi-bars"
          text
          rounded
          severity="secondary"
          aria-label="Open sidebar"
          aria-controls="admin-sidebar"
          :aria-expanded="isDrawerVisible"
          @click="openDrawer"
        />

        <!-- Workspace -->
        <div class="hidden sm:block">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle-text">Workspace</p>

          <p class="mt-1 text-sm font-semibold text-heading">
            {{ title }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <!-- Theme -->
        <Button
          text
          rounded
          severity="secondary"
          class="!hidden md:!inline-flex"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" class="h-5 w-5" :stroke-width="2" />

          <Moon v-else class="h-5 w-5" :stroke-width="2" />
        </Button>

        <!-- Announcements -->
        <Button
          text
          rounded
          severity="secondary"
          class="!hidden md:!inline-flex"
          aria-label="Announcements"
          @click="emit('announcements')"
        >
          <Megaphone class="h-5 w-5" :stroke-width="2" />
        </Button>

        <!-- Help -->
        <Button text rounded severity="secondary" class="!hidden md:!inline-flex" aria-label="Help">
          <CircleHelp class="h-5 w-5" :stroke-width="2" />
        </Button>

        <!-- Notifications -->
        <OverlayBadge value="1" severity="warn">
          <Button text rounded severity="secondary" aria-label="Notifications">
            <Bell class="h-5 w-5" :stroke-width="2" />
          </Button>
        </OverlayBadge>

        <div class="mx-1 hidden h-8 w-px bg-surface sm:block" />

        <!-- =================================================== -->
        <!-- PROFILE POPUP MENU -->
        <!-- =================================================== -->

        <div>
          <button
            type="button"
            aria-haspopup="true"
            aria-controls="user-popup-menu"
            class="flex items-center gap-2 rounded-xl border border-surface bg-surface p-1 transition-colors duration-200 hover:border-primary sm:p-1.5 sm:pr-2"
            @click="toggleUserPopupMenu"
          >
            <Avatar
              :label="userInitials || 'BM'"
              shape="circle"
              class="!h-8 !w-8 !bg-primary !text-xs !font-bold !text-primary-foreground sm:!h-9 sm:!w-9"
            />

            <span
              v-if="userName"
              class="hidden max-w-32 truncate text-sm font-semibold text-heading lg:block"
            >
              {{ userName }}
            </span>

            <ChevronDown
              class="hidden h-4 w-4 shrink-0 text-muted-text lg:block"
              :stroke-width="2.5"
            />
          </button>

          <Menu
            id="user-popup-menu"
            ref="userPopupMenu"
            :model="profileMenuItems"
            popup
            class="z-[9999] mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card p-0 text-card-foreground shadow-xl"
          >
            <!-- User Summary -->
            <template #start>
              <div class="border-b border-border px-5 py-4">
                <div class="flex items-center gap-3">
                  <Avatar
                    :label="userInitials || 'BM'"
                    shape="circle"
                    class="!bg-primary !font-bold !text-primary-foreground"
                  />

                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-heading">
                      {{ userName || 'User Name' }}
                    </p>

                    <p class="mt-1 truncate text-xs text-muted-text">
                      {{ userEmail || 'user@email.com' }}
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Popup Items -->
            <template #item="{ item, props: menuItemProps }">
              <a
                v-ripple
                v-bind="menuItemProps.action"
                class="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-200 hover:bg-surface hover:text-primary"
                :class="item.danger ? 'text-error hover:text-error' : 'text-secondary-text'"
              >
                <span :class="item.icon" class="text-[16px]" />

                <span>
                  {{ item.label }}
                </span>
              </a>
            </template>
          </Menu>
        </div>
      </div>
    </header>

    <!-- ======================================================= -->
    <!-- PAGE CONTENT -->
    <!-- ======================================================= -->

    <section class="min-h-screen pt-[76px]">
      <div class="min-h-[calc(100vh-76px)] bg-background p-5 sm:p-8">
        <div class="mx-auto max-w-[1600px]">
          <slot />
        </div>
      </div>
    </section>
  </main>
</template>
