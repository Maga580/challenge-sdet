import { HomePage } from '../../pages/HomePage'
import { ModelPage } from '../../pages/ModelPage'
import { NavBarPage } from '../../pages/NavBarPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

  const homePage = new HomePage()
  const modelPage = new ModelPage()
  const navBarPage = new NavBarPage()
  const registerPage = new RegisterPage()

describe('Buggy Cars UI flows', () => {
  it('Register a new user', () => {
    const user = createBuggyUser()
    homePage.visit()
    homePage.popularMake.should('be.visible')
    
    registerPage.register(user)
    cy.contains('Registration is successful').should('be.visible')
  })

  it('Successful log in with the user created during the test', () => {
    const user = createBuggyUser()
    homePage.visit()
    homePage.popularMake.should('be.visible')
    
    registerPage.register(user)
    cy.contains('Registration is successful').should('be.visible')

    homePage.visit()
    homePage.popularMake.should('be.visible')

    navBarPage.login(user)
    cy.contains('a', 'Logout').should('be.visible')
  })

  it('shows an error for invalid credentials', () => {
    homePage.visit()
    homePage.popularMake.should('be.visible')
    navBarPage.login({ user: `invalid-user`, password: 'invalid-password' })

    cy.contains('Invalid username/password').should('be.visible')
    cy.contains('a', 'Logout').should('not.exist')
  })

  it('blocks login when the required fields are empty', () => {
    homePage.visit()
    homePage.popularMake.should('be.visible')

    navBarPage.loginButton.click()

    cy.get(`${navBarPage.usernameField}:invalid`).should('exist')
    cy.get(`${navBarPage.passwordField}:invalid`).should('exist')
    cy.contains('a', 'Logout').should('not.exist')
  })

  it('records a vote and comment for a model', () => {
    const user = createBuggyUser()
    const comment = `UI vote ${Date.now()}`
    homePage.visit()
    homePage.popularMake.should('be.visible')

    registerPage.register(user)
    cy.contains('Registration is successful').should('be.visible')

    homePage.visit()
    homePage.popularMake.should('be.visible')

    navBarPage.login(user)
    navBarPage.logoutButton.should('be.visible')
    cy.intercept('GET', '**/models/**').as('modelDetails')
    homePage.openPopularModel()
    cy.wait('@modelDetails')

    cy.intercept('POST', '**/vote').as('submitVote')
    modelPage.vote(comment)
    cy.wait('@submitVote').then(({ request, response }) => {
      expect(response?.statusCode).to.eq(200)
      expect(JSON.stringify(request.body)).to.contain(comment)
    })

    cy.intercept('GET', '**/models/**').as('refreshedModelDetails')
    homePage.visit()
    homePage.openPopularModel()
    cy.wait('@refreshedModelDetails').then(({ response }) => {
      expect(response?.statusCode).to.eq(200)
      expect(JSON.stringify(response?.body)).to.contain(comment)
    })
  })

  it('logs out the user created during the test', () => {
    const user = createBuggyUser()
    homePage.visit()
    registerPage.register(user)
    cy.contains('Registration is successful').should('be.visible')

    homePage.visit()
    navBarPage.login(user)
    cy.contains('a', 'Logout').should('be.visible')
    navBarPage.logout()

    cy.get('input[name="login"]').should('be.visible')
    cy.contains('a', 'Logout').should('not.exist')
  })
})