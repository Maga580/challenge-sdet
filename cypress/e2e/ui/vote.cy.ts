import { HomePage } from '../../pages/HomePage'
import { ModelPage } from '../../pages/ModelPage'
import { NavBarPage } from '../../pages/NavBarPage'
import {
  createBuggyUserViaApi,
  loginViaApi,
} from '../../support/buggyCars/buggyAuth'
import { createBuggyUser } from '../../support/buggyCars/buggyUser'

const homePage = new HomePage()
const modelPage = new ModelPage()
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
    homePage.openPopularModel()
    modelPage.voteButton.should('be.visible')

    let votesBefore: number = 0
    modelPage.votes.invoke('text').then((text) => {
      votesBefore = Number(text.trim())
    })

    const comment = `Comment ${Date.now()}`
    cy.intercept('POST', '**/vote').as('submitVote')

    modelPage.vote(comment)
    cy.wait('@submitVote').its('response.statusCode').should('eq', 200)
    modelPage.votedSuccessMessage.should('be.visible')

    modelPage.votes.should('contain', votesBefore + 1)
  })
})
