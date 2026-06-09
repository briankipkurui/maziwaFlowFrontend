<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Component } from 'vue';
import { useRoute } from 'vue-router';

import {
  Bell,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  LogOut,
  Megaphone,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from 'lucide-vue-next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ChildSidebarItem = {
  label: string;
  path: string;
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

type Theme = 'dark' | 'light';

defineProps<{
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

const route = useRoute();

const MOBILE_BREAKPOINT = 768;

const isSidebarOpen = ref(true);
const isMobile = ref(false);
const openMenus = ref<string[]>([]);
const theme = ref<Theme>('dark');

const applyTheme = (selectedTheme: Theme) => {
  document.documentElement.classList.toggle('light', selectedTheme === 'light');

  localStorage.setItem('theme', selectedTheme);
};

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme(theme.value);
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeMobileSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }
};

const syncSidebarWithViewport = () => {
  const mobileViewport = window.innerWidth < MOBILE_BREAKPOINT;

  if (mobileViewport === isMobile.value) {
    return;
  }

  isMobile.value = mobileViewport;

  // Hide the sidebar completely on mobile.
  // Restore the expanded sidebar when returning to desktop.
  isSidebarOpen.value = !mobileViewport;
};

const toggleChildMenu = (label: string) => {
  if (openMenus.value.includes(label)) {
    openMenus.value = openMenus.value.filter((item) => item !== label);
    return;
  }

  openMenus.value.push(label);
};

const isChildActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(`${path}/`);
};

const isMenuOpen = (item: SidebarItem): boolean => {
  return (
    openMenus.value.includes(item.label) ||
    item.children?.some((child) => isChildActive(child.path)) === true
  );
};

const isParentActive = (item: SidebarItem): boolean => {
  return (
    route.path === item.path || item.children?.some((child) => isChildActive(child.path)) === true
  );
};

const handleMenuClick = (item: UserMenuItem) => {
  if (item.danger) {
    emit('logout');
  }
};

watch(
  () => route.fullPath,
  () => {
    closeMobileSidebar();
  },
);

onMounted(() => {
  syncSidebarWithViewport();
  window.addEventListener('resize', syncSidebarWithViewport);

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark' || savedTheme === 'light') {
    theme.value = savedTheme;
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  applyTheme(theme.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncSidebarWithViewport);
});
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 z-50 h-screen border-r border-surface bg-secondary transition-all duration-300"
      :class="[
        isMobile
          ? isSidebarOpen
            ? 'w-72 translate-x-0'
            : 'w-72 -translate-x-full'
          : isSidebarOpen
            ? 'w-72 translate-x-0'
            : 'w-20 translate-x-0',
        theme === 'light' ? 'shadow-none' : 'shadow-xl',
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Brand -->
        <div
          class="flex h-[76px] items-center border-b border-surface px-4"
          :class="isSidebarOpen ? 'justify-start' : 'justify-center'"
        >
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 shrink-0 grid-cols-3 gap-[3px] rounded-lg p-2">
              <span
                v-for="i in 9"
                :key="i"
                class="rounded-[2px]"
                :class="i === 5 || i === 7 ? 'bg-heading' : 'bg-primary'"
              />
            </div>

            <div v-if="isSidebarOpen" class="min-w-0 leading-tight">
              <h1 class="truncate text-[22px] font-extrabold tracking-tight text-heading">
                Maziwa<span class="text-primary">Flow</span>
              </h1>

              <p
                class="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-text"
              >
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sidebar Heading -->
        <div v-if="isSidebarOpen" class="px-5 pb-2 pt-6">
          <p
            class="text-[10px] font-bold uppercase tracking-[0.22em]"
            :class="theme === 'light' ? 'text-[#343434]' : 'text-subtle-text'"
          >
            {{ title }}
          </p>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-3">
          <div class="space-y-1">
            <div v-for="item in sidebarItems" :key="item.path">
              <!-- Parent Menu with Children -->
              <button
                v-if="item.children?.length"
                type="button"
                :title="!isSidebarOpen ? item.label : undefined"
                class="group relative flex w-full items-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all duration-200"
                :class="[
                  isSidebarOpen ? 'justify-between' : 'justify-center',
                  isParentActive(item)
                    ? theme === 'light'
                      ? 'border-primary bg-primary text-primary-foreground shadow-none'
                      : 'border-primary bg-primary text-primary-foreground shadow-md'
                    : theme === 'light'
                      ? 'border-transparent text-[#343434] hover:border-transparent hover:bg-transparent hover:text-[#151515]'
                      : 'border-secondary text-secondary-text hover:border-surface hover:bg-surface hover:text-heading',
                ]"
                @click="toggleChildMenu(item.label)"
              >
                <span
                  v-if="isParentActive(item)"
                  class="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-heading"
                />

                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
                    :class="[
                      isParentActive(item)
                        ? theme === 'light'
                          ? 'bg-transparent text-primary-foreground'
                          : 'bg-primary-hover text-primary-foreground'
                        : theme === 'light'
                          ? 'bg-transparent text-[#343434] group-hover:text-primary'
                          : 'bg-surface text-muted-text group-hover:text-primary',
                    ]"
                  >
                    <component :is="item.icon" class="h-[18px] w-[18px]" :stroke-width="2" />
                  </span>

                  <span v-if="isSidebarOpen" class="truncate">
                    {{ item.label }}
                  </span>
                </div>

                <span
                  v-if="isSidebarOpen"
                  class="ml-2 flex h-5 w-5 shrink-0 items-center justify-center"
                >
                  <ChevronUp v-if="isMenuOpen(item)" class="h-4 w-4" :stroke-width="2.5" />

                  <ChevronDown v-else class="h-4 w-4" :stroke-width="2.5" />
                </span>
              </button>

              <!-- Parent Menu without Children -->
              <RouterLink
                v-else
                :to="item.path"
                :title="!isSidebarOpen ? item.label : undefined"
                class="group relative flex items-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all duration-200"
                :class="[
                  isSidebarOpen ? 'justify-between' : 'justify-center',
                  isParentActive(item)
                    ? theme === 'light'
                      ? 'border-primary bg-primary text-primary-foreground shadow-none'
                      : 'border-primary bg-primary text-primary-foreground shadow-md'
                    : theme === 'light'
                      ? 'border-transparent text-[#343434] hover:border-transparent hover:bg-transparent hover:text-[#151515]'
                      : 'border-secondary text-secondary-text hover:border-surface hover:bg-surface hover:text-heading',
                ]"
                @click="closeMobileSidebar"
              >
                <span
                  v-if="isParentActive(item)"
                  class="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-heading"
                />

                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
                    :class="[
                      isParentActive(item)
                        ? theme === 'light'
                          ? 'bg-transparent text-primary-foreground'
                          : 'bg-primary-hover text-primary-foreground'
                        : theme === 'light'
                          ? 'bg-transparent text-[#343434] group-hover:text-primary'
                          : 'bg-surface text-muted-text group-hover:text-primary',
                    ]"
                  >
                    <component :is="item.icon" class="h-[18px] w-[18px]" :stroke-width="2" />
                  </span>

                  <span v-if="isSidebarOpen" class="truncate">
                    {{ item.label }}
                  </span>
                </div>

                <span
                  v-if="item.badge && isSidebarOpen"
                  class="ml-2 rounded-md bg-warning px-2 py-0.5 text-[10px] font-bold text-secondary"
                >
                  {{ item.badge }}
                </span>
              </RouterLink>

              <!-- Child Menu Items -->
              <div
                v-if="item.children?.length && isSidebarOpen && isMenuOpen(item)"
                class="ml-6 mt-2 space-y-1 border-l border-surface pl-4"
              >
                <RouterLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="relative block rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-200"
                  :class="
                    isChildActive(child.path)
                      ? theme === 'light'
                        ? 'border-primary bg-transparent text-primary shadow-none'
                        : 'border-primary bg-surface text-primary'
                      : theme === 'light'
                        ? 'border-transparent bg-transparent text-[#343434] hover:border-transparent hover:bg-transparent hover:text-[#151515]'
                        : 'border-secondary text-muted-text hover:border-surface hover:bg-surface hover:text-heading'
                  "
                  @click="closeMobileSidebar"
                >
                  <span
                    v-if="isChildActive(child.path)"
                    class="absolute -left-[18px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                  />

                  {{ child.label }}
                </RouterLink>
              </div>
            </div>
          </div>
        </nav>

        <!-- Logout -->
        <div class="border-t border-surface p-3">
          <button
            type="button"
            title="Logout"
            class="flex w-full items-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-error hover:text-error"
            :class="[
              isSidebarOpen ? 'justify-start gap-3' : 'justify-center',
              theme === 'light'
                ? 'border-transparent bg-transparent text-[#343434] shadow-none hover:bg-transparent'
                : 'border-secondary text-muted-text hover:bg-surface',
            ]"
            @click="emit('logout')"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-md"
              :class="theme === 'light' ? 'bg-transparent shadow-none' : 'bg-surface'"
            >
              <LogOut class="h-[18px] w-[18px]" :stroke-width="2" />
            </span>

            <span v-if="isSidebarOpen">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Backdrop -->
    <button
      v-if="isMobile && isSidebarOpen"
      type="button"
      aria-label="Close sidebar"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Header -->
    <header
      class="fixed right-0 top-0 z-30 flex h-[76px] items-center justify-between border-b border-surface bg-secondary transition-all duration-300"
      :class="[
        isMobile ? 'left-0 px-3' : isSidebarOpen ? 'left-72 px-6' : 'left-20 px-6',
        theme === 'light' ? 'shadow-none' : 'shadow-lg',
      ]"
    >
      <div class="flex items-center gap-4">
        <!-- Sidebar Toggle -->
        <button
          type="button"
          title="Toggle sidebar"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent bg-transparent text-secondary-text transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          @click="toggleSidebar"
        >
          <PanelLeftClose v-if="isSidebarOpen" class="h-5 w-5" :stroke-width="2" />

          <PanelLeftOpen v-else class="h-5 w-5" :stroke-width="2" />
        </button>

        <!-- Workspace Name: Hidden on small screens -->
        <div class="hidden sm:block">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle-text">Workspace</p>

          <p class="mt-1 text-sm font-semibold text-heading">
            {{ title }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <!-- Theme Toggle: Desktop only -->
        <button
          type="button"
          :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          class="hidden h-10 w-10 items-center justify-center rounded-lg border text-muted-text transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring md:flex"
          :class="
            theme === 'light'
              ? 'border-transparent bg-transparent shadow-none'
              : 'border-surface bg-surface'
          "
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" class="h-5 w-5" :stroke-width="2" />

          <Moon v-else class="h-5 w-5" :stroke-width="2" />
        </button>

        <!-- Announcements: Desktop only -->
        <button
          type="button"
          title="Announcements"
          class="hidden h-10 w-10 items-center justify-center rounded-lg border text-muted-text transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring md:flex"
          :class="
            theme === 'light'
              ? 'border-transparent bg-transparent shadow-none'
              : 'border-secondary hover:border-surface hover:bg-surface'
          "
          @click="emit('announcements')"
        >
          <Megaphone class="h-5 w-5" :stroke-width="2" />
        </button>

        <!-- Help: Desktop only -->
        <button
          type="button"
          title="Help"
          class="hidden h-10 w-10 items-center justify-center rounded-lg border text-muted-text transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring md:flex"
          :class="
            theme === 'light'
              ? 'border-transparent bg-transparent shadow-none'
              : 'border-secondary hover:border-surface hover:bg-surface'
          "
        >
          <CircleHelp class="h-5 w-5" :stroke-width="2" />
        </button>

        <!-- Notifications -->
        <button
          type="button"
          title="Notifications"
          class="relative flex h-10 w-10 items-center justify-center rounded-lg border text-muted-text transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          :class="
            theme === 'light'
              ? 'border-transparent bg-transparent shadow-none'
              : 'border-secondary hover:border-surface hover:bg-surface'
          "
        >
          <Bell class="h-5 w-5" :stroke-width="2" />

          <span
            class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-secondary bg-primary px-1 text-[10px] font-bold text-primary-foreground"
          >
            1
          </span>
        </button>

        <div class="mx-1 hidden h-8 w-px bg-surface sm:block" />

        <!-- User Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border p-1 transition-all duration-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring sm:p-1.5 sm:pr-2"
              :class="
                theme === 'light'
                  ? 'border-transparent bg-transparent shadow-none'
                  : 'border-surface bg-surface shadow-sm'
              "
            >
              <span
                class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground sm:h-9 sm:w-9 sm:text-sm"
              >
                {{ userInitials || 'BM' }}
              </span>

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
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            :side-offset="12"
            class="z-[9999] w-72 overflow-hidden rounded-lg border border-border bg-card p-0 text-card-foreground"
            :class="theme === 'light' ? 'shadow-none' : 'shadow-xl'"
          >
            <!-- User Details -->
            <DropdownMenuLabel class="px-5 py-4 font-normal">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
                >
                  {{ userInitials || 'BM' }}
                </span>

                <div class="min-w-0">
                  <p v-if="userName" class="truncate text-sm font-semibold text-heading">
                    {{ userName }}
                  </p>

                  <p class="mt-1 truncate text-xs text-muted-text">
                    {{ userEmail || 'user@email.com' }}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <!-- Mobile Quick Actions -->
            <div class="md:hidden">
              <DropdownMenuSeparator class="bg-border" />

              <div class="py-2">
                <!-- Mobile Theme Toggle -->
                <DropdownMenuItem
                  class="cursor-pointer px-5 py-3 text-sm font-medium text-secondary-text transition-colors duration-200 hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary"
                  @click="toggleTheme"
                >
                  <div class="flex items-center gap-3">
                    <Sun v-if="theme === 'dark'" class="h-[18px] w-[18px]" :stroke-width="2" />

                    <Moon v-else class="h-[18px] w-[18px]" :stroke-width="2" />

                    <span>
                      {{ theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
                    </span>
                  </div>
                </DropdownMenuItem>

                <!-- Mobile Announcements -->
                <DropdownMenuItem
                  class="cursor-pointer px-5 py-3 text-sm font-medium text-secondary-text transition-colors duration-200 hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary"
                  @click="emit('announcements')"
                >
                  <div class="flex items-center gap-3">
                    <Megaphone class="h-[18px] w-[18px]" :stroke-width="2" />

                    <span>Announcements</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </div>

            <!-- Account Links -->
            <DropdownMenuSeparator class="bg-border" />

            <div class="py-2">
              <template v-for="item in userMenuItems" :key="item.label">
                <DropdownMenuItem
                  v-if="item.path"
                  as-child
                  class="cursor-pointer p-0 focus:bg-surface"
                >
                  <RouterLink
                    :to="item.path"
                    class="block w-full px-5 py-3 text-sm font-medium text-secondary-text transition-colors duration-200 hover:bg-surface hover:text-primary"
                  >
                    {{ item.label }}
                  </RouterLink>
                </DropdownMenuItem>

                <DropdownMenuItem
                  v-else
                  class="cursor-pointer px-5 py-3 text-sm font-medium transition-colors duration-200"
                  :class="
                    item.danger
                      ? 'text-error hover:bg-surface focus:bg-surface focus:text-error'
                      : 'text-secondary-text hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary'
                  "
                  @click="handleMenuClick(item)"
                >
                  {{ item.label }}
                </DropdownMenuItem>
              </template>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <!-- Page Content -->
    <section
      class="min-h-screen pt-[76px] transition-all duration-300"
      :class="isMobile ? 'ml-0' : isSidebarOpen ? 'ml-72' : 'ml-20'"
    >
      <div class="min-h-[calc(100vh-76px)] bg-background p-5 sm:p-8">
        <div class="mx-auto max-w-[1600px]">
          <slot />
        </div>
      </div>
    </section>
  </main>
</template>
