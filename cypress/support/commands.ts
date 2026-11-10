import { ModelPage } from '../pages/ModelPage'
import {
  createBuggyUserViaApi,
  getBuggyApiUrl,
  loginViaApi,
} from './buggyCars/buggyAuth'
import type { BuggyUser } from './buggyCars/buggyUser'

const modelPage = new ModelPage()

interface ModelSummary {
  id: string
  totalComments: number
}

interface ModelsPage {
  totalPages: number
  models: ModelSummary[]
}

const getModelsPage = (page: number) =>
  cy
    .request<ModelsPage>({
      url: `${getBuggyApiUrl()}/models`,
      qs: { page },
      log: false,
    })
    .its('body')

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Registers a fresh user through the API, logs in with cy.session (no UI
       * login) and opens the home page. Yields the created user.
       */
      loginAsNewUser(): Chainable<BuggyUser>
      /**
       * Opens the page of the model with the fewest comments (last page of the
       * overall ranking). The most popular model silently drops new comments
       * (BUGS.md, BUG-01), so the voting flow targets a non-saturated model.
       */
      openLeastCommentedModel(): Chainable<void>
      /**
       * Votes on the currently open model page with the given comment and waits
       * for the vote request. Yields the vote count displayed before voting.
       */
      voteOnModel(comment: string): Chainable<number>
      /**
       * Verifies that the vote was registered: success message, updated count and
       * the comment listed in the model's comments table.
       */
      verifyVoteRegistered(
        comment: string,
        votesBefore: number,
      ): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginAsNewUser', () => {
  return createBuggyUserViaApi().then((user) => {
    loginViaApi(user)
    cy.visit('/')
    return cy.wrap(user, { log: false })
  })
})

Cypress.Commands.add('openLeastCommentedModel', () => {
  getModelsPage(1).then(({ totalPages }) => {
    getModelsPage(totalPages).then(({ models }) => {
      const model = Cypress._.minBy(models, 'totalComments')
      if (!model) {
        throw new Error('The Buggy Cars models endpoint returned no models.')
      }
      modelPage.visit(model.id)
    })
  })
})

Cypress.Commands.add('voteOnModel', (comment: string) => {
  cy.intercept('POST', '**/vote').as('submitVote')

  modelPage.voteButton.should('be.visible')

  return modelPage.getVoteCount().then((votesBefore) => {
    expect(votesBefore, 'initial vote count').to.be.a('number').and.not.be.NaN

    modelPage.vote(comment)

    cy.wait('@submitVote').then(({ request, response }) => {
      expect(response?.statusCode).to.eq(200)
      expect(request.body).to.deep.include({ comment })
    })

    return cy.wrap(votesBefore, { log: false })
  })
})

Cypress.Commands.add(
  'verifyVoteRegistered',
  (comment: string, votesBefore: number) => {
    modelPage.votedSuccessMessage.should('be.visible')
    modelPage.voteButton.should('not.exist')

    // Shared public site: other users may vote concurrently, so the count is
    // asserted as "at least +1". The unique comment proves the vote is ours.
    modelPage.voteCount.should(($count) => {
      expect(Number($count.text().trim())).to.be.at.least(votesBefore + 1)
    })

    modelPage.commentRows.contains('td', comment).should('be.visible')
  },
)

export {}
