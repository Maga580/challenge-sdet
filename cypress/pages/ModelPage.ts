export class ModelPage {
    get votes() {
        return cy.contains('h4', 'Votes')
    }
    get commentInput() {
        return cy.get('textarea')
    }
    get voteButton() {
        return cy.contains('button', 'Vote')
    }
    get votedSuccessMessage() {
        return cy.contains('Thank you for your vote!')
    }

	vote(comment: string): void {
		this.commentInput.type(comment)
		this.voteButton.click()
	}
}
