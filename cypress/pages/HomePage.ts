export class HomePage {
    get popularMake() {
        return cy.get('a[href^="/make/"]')
    }
    get popularModel() {
        return cy.get('a[href^="/model/"]')
    }

    get overallRating() {
        return cy.get('a[href^="/overall/"]')
    }
    
	visit(): void {
		cy.visit('/')
	}

    openPopularMake(): void {
        this.popularMake.click()
    }

	openPopularModel(): void {
		this.popularModel.click()
	}

    openOverallRating(): void {
        this.overallRating.click()
    }
}
