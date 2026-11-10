import { createBuggyUser, type BuggyUser } from '../ui/buggyUser'

interface TokenResponse {
  access_token: string
}

export function getBuggyApiUrl(): string {
  const apiUrl = Cypress.expose('buggyApiUrl') as string | undefined
  if (!apiUrl) {
    throw new Error(
      'BUGGY_API_URL is required. Add it to .env or set it in the environment before running the Buggy Cars UI tests.',
    )
  }

  return apiUrl.replace(/\/$/, '')
}

export function createBuggyUserViaApi(
  user: BuggyUser = createBuggyUser(),
): Cypress.Chainable<BuggyUser> {
  return cy.request({
    method: 'POST',
    url: `${getBuggyApiUrl()}/users`,
    log: false,
    body: {
      username: user.user,
      firstName: 'API',
      lastName: 'Automation',
      password: user.password,
    },
  }).then(({ status }) => {
    if (status !== 201) {
      throw new Error(`Buggy Cars user registration returned ${status}, expected 201.`)
    }

    return cy.wrap(user, { log: false })
  })
}

export function getTokenViaApi(user: BuggyUser): Cypress.Chainable<string> {
  const apiUrl = getBuggyApiUrl()

  return cy.request<TokenResponse>({
    method: 'POST',
    url: `${apiUrl}/oauth/token`,
    form: true,
    log: false,
    body: {
      grant_type: 'password',
      username: user.user,
      password: user.password,
    },
  }).then(({ body }) => {
    const token = body.access_token
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('The Buggy Cars token endpoint returned no access_token.')
    }

    return cy.wrap(token, { log: false })
  })
}

export function loginViaApi(user: BuggyUser): Cypress.Chainable<string> {
  const apiUrl = getBuggyApiUrl()

  return cy.session(
    ['buggy', user.user],
    () => {
      getTokenViaApi(user).then((token) => {
        return cy.visit('/', {
          onBeforeLoad: (window) => {
            window.localStorage.setItem('token', token)
          },
        })
      })
    },
    {
      validate() {
        cy.visit('/')
        cy.window().then((window) => {
          const token = window.localStorage.getItem('token')
          if (!token) {
            throw new Error('The Buggy Cars session has no bearer token.')
          }

          return cy.request({
            method: 'GET',
            url: `${apiUrl}/users/current`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
            log: false,
          }).then(({ status }) => {
            if (status !== 200) {
              throw new Error(`The Buggy Cars bearer token validation returned ${status}, expected 200.`)
            }
          })
        })
      },
    },
  ).then(() => {
    return cy.visit('/').then(() => {
      return cy.window().then((window) => {
        const token = window.localStorage.getItem('token')
        if (!token) {
          throw new Error('The Buggy Cars session has no bearer token after login.')
        }

        return token
      })
    })
  })
}