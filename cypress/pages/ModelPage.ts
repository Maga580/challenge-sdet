export class ModelPage {
  get voteCount() {
    return cy.contains('h4', 'Votes').find('strong')
  }
  get commentInput() {
    return cy.get('#comment')
  }
  get voteButton() {
    return cy.contains('button', 'Vote')
  }
  get votedSuccessMessage() {
    return cy.contains('Thank you for your vote!')
  }
  get commentRows() {
    return cy.get('table tbody tr')
  }

  visit(modelId: string): void {
    cy.visit(`/model/${encodeURIComponent(modelId)}`)
  }

  getVoteCount(): Cypress.Chainable<number> {
    return this.voteCount.invoke('text').then((text) => Number(text.trim()))
  }

  vote(comment: string): void {
    this.commentInput.type(comment)
    this.voteButton.click()
  }
}
