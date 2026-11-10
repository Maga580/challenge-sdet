import { defineConfig } from 'cypress'
import { createRequire } from 'node:module'
import { rm } from 'node:fs/promises'

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
      on('after:spec', async (_spec, results) => {
        if (results && results.stats.failures === 0 && results.video) {
          await rm(results.video, { force: true })
        }
      })
    },
    baseUrl: process.env.BUGGY_BASE_URL,
    defaultCommandTimeout: 7000,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
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
