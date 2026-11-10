import { defineConfig } from 'cypress'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

try {
  process.loadEnvFile()
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error
  }
}

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: 'mochawesome',
    overwrite: true,
    html: true,
    json: true,
  },
  video: false,
  screenshotOnRunFailure: true,
  e2e: {
    setupNodeEvents(on) {
      require('cypress-mochawesome-reporter/plugin')(on)
    },
    baseUrl: process.env.BUGGY_BASE_URL,
    defaultCommandTimeout: 7000,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    petstoreUrl: process.env.PETSTORE_URL,
  },
  expose: {
    ...(process.env.BUGGY_API_URL
      ? { buggyApiUrl: process.env.BUGGY_API_URL }
      : {}),
  },
})
