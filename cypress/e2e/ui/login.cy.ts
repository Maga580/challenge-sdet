import { HomePage } from '../../pages/HomePage'
import { NavBarPage } from '../../pages/NavBarPage'
import { createBuggyUserViaApi } from '../../support/buggyCars/buggyAuth'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

const homePage = new HomePage()
const navBarPage = new NavBarPage()

describe('Buggy Cars login', () => {
  it('Successful login with valid credentials', () => {
    createBuggyUserViaApi(createBuggyUser()).then((user) => {
      cy.intercept('POST', '**/oauth/token').as('login')

      homePage.visit()
      navBarPage.login(user)

      cy.wait('@login').its('response.statusCode').should('eq', 200)
      navBarPage.logoutButton.should('be.visible')
      navBarPage.loginButton.should('not.exist')

      cy.window().its('localStorage').invoke('getItem', 'token').should('be.a', 'string')
      navBarPage.logoutButton.should('be.visible')
    })
  })

  it('Login with invalid credentials displays an error', () => {
    cy.intercept('POST', '**/oauth/token').as('login')

    homePage.visit()
    navBarPage.login(createBuggyUser())

    cy.wait('@login').its('response.statusCode').should('be.within', 400, 401)
    navBarPage.loginErrorMessage.should('be.visible')
    navBarPage.logoutButton.should('not.exist')
  })

  const emptyCases = [
    { caseName: 'empty username', user: '', password: 'Some-pass-1!' },
    { caseName: 'empty password', user: 'someuser', password: '' },
    { caseName: 'both fields empty', user: '', password: '' },
  ]

    emptyCases.forEach(({ caseName, user, password }) => {
        it(`Login with ${caseName} displays an error`, () => {
            cy.intercept('POST', '**/oauth/token', cy.spy().as('loginRequest'))

            homePage.visit()
            navBarPage.login({ user, password })

            if (user === '') {
                cy.get(`${navBarPage.usernameField}:invalid`).should('exist')
            }
            if (password === '') {
                cy.get(`${navBarPage.passwordField}:invalid`).should('exist')
            }
            if (user !== '' && password !== '') {
                navBarPage.loginErrorMessage.should('be.visible')
            }

            navBarPage.logoutButton.should('not.exist')
            cy.get('@loginRequest').should('not.have.been.called')
        })
    })
})