export interface BuggyUser {
  user: string
  password: string
}

export function createBuggyUser(): BuggyUser {
  const unique = `${Date.now()}${Cypress._.random(1000, 9999)}`
  return {
    user: `qa${unique}`,
    password: `Qa${unique}!`,
  }
}