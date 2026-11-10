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

const definedOnly = (values: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value))

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
  // Public services are shared and occasionally inconsistent (e.g. Petstore may
  // briefly return 404 right after a create). One retry in CI absorbs that noise
  // without hiding consistently failing tests; interactive runs never retry.
  retries: { runMode: 1, openMode: 0 },
  // Non-secret URLs read by the specs through Cypress.expose().
  expose: definedOnly({
    buggyApiUrl: process.env.BUGGY_API_URL,
    petstoreUrl: process.env.PETSTORE_URL,
  }),
})
