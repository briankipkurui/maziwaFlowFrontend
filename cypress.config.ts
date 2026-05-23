import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.ts',

    // Viewport settings (common desktop resolution)
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,

    // Retries for flaky test resilience
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Video & Screenshots
    video: false, // Enable in CI if needed
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Experimental features
    experimentalRunAllSpecs: true,
  },
})
