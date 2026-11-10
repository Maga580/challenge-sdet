import { defineConfig } from 'cypress'

try {
  process.loadEnvFile()
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error
  }
}

export default defineConfig({
  e2e: {
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
    ...(process.env.BUGGY_API_URL ? { buggyApiUrl: process.env.BUGGY_API_URL } : {}),
  },
})
