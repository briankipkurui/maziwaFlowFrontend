declare module 'pinia-plugin-persistedstate' {
  import type { PiniaPluginContext } from 'pinia';

  type PersistedStateOptions = Record<string, unknown>;

  const persistedState: (options?: PersistedStateOptions) => (context: PiniaPluginContext) => void;

  export default persistedState;
}
