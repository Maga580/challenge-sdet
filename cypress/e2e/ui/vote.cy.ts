import { NavBarPage } from '../../pages/NavBarPage'

const navBarPage = new NavBarPage()

describe('Buggy Cars Vote', () => {
  beforeEach(() => {
    cy.loginAsNewUser()
    navBarPage.logoutButton.should('be.visible')
  })

  it('Records a vote and comment for a model', () => {
    const comment = `Automated comment ${Date.now()}`

    cy.openLeastCommentedModel()

    cy.voteOnModel(comment).then((votesBefore) => {
      cy.verifyVoteRegistered(comment, votesBefore)
    })
  })
})
