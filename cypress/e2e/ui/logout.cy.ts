import { NavBarPage } from '../../pages/NavBarPage'

const navBarPage = new NavBarPage()

describe('Buggy Cars Logout', () => {
  beforeEach(() => {
    cy.loginAsNewUser()
    navBarPage.logoutButton.should('be.visible')
  })

  it('Successful logout the user', () => {
    navBarPage.logout()

    cy.window().its('localStorage').invoke('getItem', 'token').should('be.null')
    navBarPage.logoutButton.should('not.exist')
    navBarPage.loginButton.should('be.visible')
  })
})
