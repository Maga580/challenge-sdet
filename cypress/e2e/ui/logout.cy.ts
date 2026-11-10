import { NavBarPage } from '../../pages/NavBarPage'
import { createBuggyUserViaApi, loginViaApi } from '../../support/buggyCars/buggyAuth'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

const navBarPage = new NavBarPage()

describe('Buggy Cars Logout', () => {
    beforeEach(() => {
        createBuggyUserViaApi(createBuggyUser()).then((user) => {
        loginViaApi(user)
        })
        cy.visit('/')
        navBarPage.logoutButton.should('be.visible')
    })

    it('Successful logout the user', () => {
        navBarPage.logout()

        cy.window().its('localStorage').invoke('getItem', 'token').should('be.null')
        navBarPage.logoutButton.should('not.exist')
        navBarPage.loginButton.should('be.visible')
    })
})