import { HomePage } from '../../pages/HomePage'
import { NavBarPage } from '../../pages/NavBarPage'
import {
  createBuggyUserViaApi,
  loginViaApi,
} from '../../support/buggyCars/buggyAuth'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

const homePage = new HomePage()
const navBarPage = new NavBarPage()

describe('Buggy Cars Vote', () => {
  beforeEach(() => {
    createBuggyUserViaApi(createBuggyUser()).then((user) => {
      loginViaApi(user)
    })
    cy.visit('/')
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
