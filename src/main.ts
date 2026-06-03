import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

import './assets/main.css';
import App from './App.vue';
import router from './router';
import { initializeAuth } from './utils/initAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

// Must install Pinia first so authStore can be used
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

// Initialize auth from localStorage
initializeAuth();

app.mount('#app');
