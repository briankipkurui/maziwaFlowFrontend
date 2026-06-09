import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

import './assets/main.css';
import App from './App.vue';
import router from './router';
import { initializeAuth } from './utils/initAuth';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Ripple from 'primevue/ripple';

import 'primeicons/primeicons.css';

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
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  ripple: true,
});

app.directive('ripple', Ripple);

// Initialize auth from localStorage
initializeAuth();

app.mount('#app');
