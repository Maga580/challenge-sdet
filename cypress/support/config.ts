/**
 * Reads a value exposed from cypress.config.ts (sourced from .env or CI variables)
 * and fails fast with an actionable message when it is missing.
 */
export function getRequiredUrl(key: string, envVar: string): string {
  const value = Cypress.expose(key) as string | undefined
  if (!value) {
    throw new Error(
      `${envVar} is required. Add it to .env (see .env.example) or set it in the environment.`,
    )
  }

  return value.replace(/\/$/, '')
}
