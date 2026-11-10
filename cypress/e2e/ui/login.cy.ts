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

      cy.window()
        .its('localStorage')
        .invoke('getItem', 'token')
        .should('be.a', 'string')
      navBarPage.logoutButton.should('be.visible')
      navBarPage.loginButton.should('not.exist')
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
    {
      caseName: 'empty username',
      user: '',
      password: 'Some-pass-1!',
      invalidFields: [navBarPage.selectors.usernameField],
    },
    {
      caseName: 'empty password',
      user: 'someuser',
      password: '',
      invalidFields: [navBarPage.selectors.passwordField],
    },
    {
      caseName: 'both fields empty',
      user: '',
      password: '',
      invalidFields: [
        navBarPage.selectors.usernameField,
        navBarPage.selectors.passwordField,
      ],
    },
  ]

  emptyCases.forEach(({ caseName, user, password, invalidFields }) => {
    it(`Login with ${caseName} displays an error`, () => {
      cy.intercept('POST', '**/oauth/token', cy.spy().as('loginRequest'))

      homePage.visit()
      navBarPage.login({ user, password })

      invalidFields.forEach((field) => {
        cy.get(field)
          .should('match', ':invalid')
          .invoke('prop', 'validationMessage')
          .should('be.a', 'string')
          .and('not.be.empty')
      })

      navBarPage.logoutButton.should('not.exist')
      cy.get('@loginRequest').should('not.have.been.called')
    })
  })
})
