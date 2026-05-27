<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

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
  icon: string;
  badge?: string;
  children?: ChildSidebarItem[];
};

type UserMenuItem = {
  label: string;
  path?: string;
  danger?: boolean;
};

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
}>();

const route = useRoute();

const isSidebarOpen = ref(true);
const openMenus = ref<string[]>([]);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleChildMenu = (label: string) => {
  if (openMenus.value.includes(label)) {
    openMenus.value = openMenus.value.filter((item) => item !== label);
  } else {
    openMenus.value.push(label);
  }
};

const isMenuOpen = (item: SidebarItem) => {
  return (
    openMenus.value.includes(item.label) ||
    item.children?.some(
      (child) => route.path === child.path || route.path.startsWith(child.path + '/'),
    )
  );
};

const isParentActive = (item: SidebarItem) => {
  return (
    route.path === item.path ||
    item.children?.some(
      (child) => route.path === child.path || route.path.startsWith(child.path + '/'),
    )
  );
};

const handleMenuClick = (item: UserMenuItem) => {
  if (item.danger) {
    emit('logout');
  }
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white shadow-sm transition-all duration-300"
      :class="isSidebarOpen ? 'w-72' : 'w-20'"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div
          class="flex h-[76px] items-center border-b border-slate-100 px-4"
          :class="isSidebarOpen ? 'justify-start' : 'justify-center'"
        >
          <div class="flex items-center gap-3">
            <div class="grid grid-cols-3 gap-[3px]">
              <span v-for="i in 9" :key="i" class="h-2.5 w-2.5 rounded-[2px] bg-blue-600" />
            </div>

            <div v-if="isSidebarOpen" class="leading-tight">
              <h1 class="text-[25px] font-semibold tracking-tight text-blue-600">MaziwaFlow</h1>
              <p class="mt-0.5 text-xs font-medium text-slate-400">
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sidebar Title -->
        <div v-if="isSidebarOpen" class="px-5 pb-2 pt-5">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {{ title }}
          </p>
        </div>

        <!-- Links -->
        <nav class="flex-1 overflow-y-auto px-3 py-3">
          <div class="space-y-1.5">
            <div v-for="item in sidebarItems" :key="item.path">
              <!-- Parent with children -->
              <button
                v-if="item.children?.length"
                type="button"
                class="group flex w-full items-center rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-200"
                :class="[
                  isSidebarOpen ? 'justify-between' : 'justify-center',
                  isParentActive(item)
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700',
                ]"
                @click="toggleChildMenu(item.label)"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition"
                    :class="isParentActive(item) ? 'bg-white text-blue-700' : 'text-slate-500'"
                  >
                    {{ item.icon }}
                  </span>

                  <span v-if="isSidebarOpen">
                    {{ item.label }}
                  </span>
                </div>

                <span
                  v-if="isSidebarOpen"
                  class="text-xs transition-transform duration-200"
                  :class="isMenuOpen(item) ? 'rotate-180' : ''"
                >
                  ▼
                </span>
              </button>

              <!-- Parent without children -->
              <RouterLink
                v-else
                :to="item.path"
                class="group flex items-center rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-200"
                :class="[
                  isSidebarOpen ? 'justify-between' : 'justify-center',
                  isParentActive(item)
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700',
                ]"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition"
                    :class="isParentActive(item) ? 'bg-white text-blue-700' : 'text-slate-500'"
                  >
                    {{ item.icon }}
                  </span>

                  <span v-if="isSidebarOpen">
                    {{ item.label }}
                  </span>
                </div>

                <span
                  v-if="item.badge && isSidebarOpen"
                  class="rounded-full bg-yellow-400 px-2 py-[2px] text-[10px] font-bold text-slate-900"
                >
                  {{ item.badge }}
                </span>
              </RouterLink>

              <!-- Children -->
              <div
                v-if="item.children?.length && isSidebarOpen && isMenuOpen(item)"
                class="ml-8 mt-2 space-y-1 border-l border-slate-200 pl-4"
              >
                <RouterLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="block rounded-lg px-3 py-2.5 text-sm font-medium transition"
                  :class="
                    route.path === child.path || route.path.startsWith(child.path + '/')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-blue-700'
                  "
                >
                  {{ child.label }}
                </RouterLink>
              </div>
            </div>
          </div>
        </nav>

        <!-- Bottom -->
        <div class="border-t border-slate-200 p-3">
          <button
            type="button"
            class="flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            :class="isSidebarOpen ? 'gap-3 justify-start' : 'justify-center'"
            @click="emit('logout')"
          >
            <span class="text-lg">↩</span>
            <span v-if="isSidebarOpen">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Top Bar -->
    <header
      class="fixed right-0 top-0 z-50 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-8 shadow-sm backdrop-blur transition-all duration-300"
      :class="isSidebarOpen ? 'left-72' : 'left-20'"
    >
      <!-- Toggle Button -->
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        @click="toggleSidebar"
      >
        <span v-if="isSidebarOpen">☰</span>
        <span v-else>☷</span>
      </button>

      <div class="flex items-center gap-4">
        <button
          class="flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
          type="button"
        >
          📣
        </button>

        <button
          class="flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
          type="button"
        >
          ?
        </button>

        <button
          class="relative flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
          type="button"
        >
          🔔
          <span
            class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[11px] font-bold text-white"
          >
            1
          </span>
        </button>

        <!-- Avatar Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
            >
              {{ userInitials || 'BM' }}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            :side-offset="12"
            class="z-[9999] w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xl"
          >
            <DropdownMenuLabel class="px-5 py-4 font-normal">
              <p class="text-sm font-medium text-slate-500">Signed in as</p>
              <p class="mt-1 truncate text-sm font-semibold text-slate-900">
                {{ userEmail || 'user@email.com' }}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div class="py-2">
              <template v-for="item in userMenuItems" :key="item.label">
                <DropdownMenuItem v-if="item.path" as-child class="cursor-pointer p-0">
                  <RouterLink
                    :to="item.path"
                    class="block w-full px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {{ item.label }}
                  </RouterLink>
                </DropdownMenuItem>

                <DropdownMenuItem
                  v-else
                  class="cursor-pointer px-5 py-3 text-sm font-medium transition"
                  :class="
                    item.danger
                      ? 'text-red-600 focus:text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
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
      :class="isSidebarOpen ? 'ml-72' : 'ml-20'"
    >
      <div class="p-8">
        <slot />
      </div>
    </section>
  </main>
</template>
