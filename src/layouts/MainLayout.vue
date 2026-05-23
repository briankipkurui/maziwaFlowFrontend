<script setup lang="ts">
// Main layout - Dashboard shell with sidebar and header
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Menu, ChevronsLeft, Home } from 'lucide-vue-next';

const route = useRoute();
const isCollapsed = ref(false);

// Define your navigation items here
const menuItems = [{ name: 'Home', path: '/', icon: 'home' }];

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      ]"
    >
      <!-- Logo/Brand Area -->
      <div class="flex items-center justify-center border-b border-gray-200 py-4 px-4 h-14">
        <span v-if="!isCollapsed" class="font-semibold text-gray-800">Your App</span>
      </div>

      <!-- Menu Items -->
      <nav class="mt-4 px-2 flex flex-col gap-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            route.path === item.path ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-100',
            isCollapsed ? 'justify-center' : '',
          ]"
          :title="isCollapsed ? item.name : ''"
        >
          <Home v-if="item.icon === 'home'" class="h-5 w-5 flex-shrink-0" />
          <span v-if="!isCollapsed">{{ item.name }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div
      :class="[
        'flex min-h-screen flex-1 flex-col transition-all duration-300',
        isCollapsed ? 'ml-16' : 'ml-64',
      ]"
    >
      <!-- Top Header Bar -->
      <header
        class="sticky top-0 z-30 flex h-14 items-center justify-between bg-white border-b border-gray-200 px-6"
      >
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="cursor-pointer flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Menu v-if="isCollapsed" class="h-6 w-6" />
            <ChevronsLeft v-else class="h-6 w-6" />
          </button>
          <h1 class="text-lg font-semibold text-gray-800">{{ route.meta.title || 'Home' }}</h1>
        </div>
      </header>

      <main class="grow px-6 py-6">
        <slot />
      </main>

      <footer class="border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Your Company
      </footer>
    </div>
  </div>
</template>
