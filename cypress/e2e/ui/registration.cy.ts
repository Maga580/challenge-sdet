import { NavBarPage } from '../../pages/NavBarPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { getTokenViaApi } from '../../support/buggyCars/buggyAuth'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

const navBarPage = new NavBarPage()
const registerPage = new RegisterPage()

describe('Buggy Cars Registration', () => {
    it('Successful register a new user with valid credentials', () => {
        const user = createBuggyUser()
        cy.intercept('POST', '**/users').as('register')

        cy.visit('/')
        navBarPage.registerButton.click()
        registerPage.register(user)

        cy.wait('@register').its('response.statusCode').should('eq', 201)
        registerPage.registrationSuccessMessage.should('be.visible')
        getTokenViaApi(user).should('be.a', 'string')
    })
})