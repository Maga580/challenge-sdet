import { getRequiredUrl } from '../config'
import { createBuggyUser, type BuggyUser } from './buggyUser'

interface TokenResponse {
  access_token: string
}

export function getBuggyApiUrl(): string {
  return getRequiredUrl('buggyApiUrl', 'BUGGY_API_URL')
}

export function createBuggyUserViaApi(
  user: BuggyUser = createBuggyUser(),
): Cypress.Chainable<BuggyUser> {
  return cy
    .request({
      method: 'POST',
      url: `${getBuggyApiUrl()}/users`,
      log: false,
      body: {
        username: user.user,
        firstName: 'API',
        lastName: 'Automation',
        password: user.password,
      },
    })
    .then(({ status }) => {
      if (status !== 201) {
        throw new Error(
          `Buggy Cars user registration returned ${status}, expected 201.`,
        )
      }

      return cy.wrap(user, { log: false })
    })
}

export function getTokenViaApi(user: BuggyUser): Cypress.Chainable<string> {
  const apiUrl = getBuggyApiUrl()

  return cy
    .request<TokenResponse>({
      method: 'POST',
      url: `${apiUrl}/oauth/token`,
      form: true,
      log: false,
      body: {
        grant_type: 'password',
        username: user.user,
        password: user.password,
      },
    })
    .then(({ body }) => {
      const token = body.access_token
      if (typeof token !== 'string' || token.length === 0) {
        throw new Error(
          'The Buggy Cars token endpoint returned no access_token.',
        )
      }

      return cy.wrap(token, { log: false })
    })
}

/**
 * Logs in through the API and caches the session with cy.session. The token is
 * stored in localStorage (where the app reads it) and validated against
 * /users/current whenever a cached session is restored.
 */
export function loginViaApi(user: BuggyUser) {
  const apiUrl = getBuggyApiUrl()
  const appOrigin = new URL(Cypress.config('baseUrl') as string).origin

  return cy.session(
    ['buggy', user.user],
    () => {
      getTokenViaApi(user).then((token) => {
        cy.visit('/', {
          onBeforeLoad: (window) => {
            window.localStorage.setItem('token', token)
          },
        })
      })
    },
    {
      validate() {
        cy.getAllLocalStorage({ log: false }).then((storage) => {
          const token = storage[appOrigin]?.token
          if (typeof token !== 'string' || token.length === 0) {
            throw new Error('The Buggy Cars session has no bearer token.')
          }

          cy.request({
            url: `${apiUrl}/users/current`,
            headers: { Authorization: `Bearer ${token}` },
            log: false,
          })
            .its('status', { log: false })
            .should('eq', 200)
        })
      },
    },
  )
}
