import type { BuggyUser } from '../support/ui/buggyUser'

export class NavBarPage {
    get usernameField() {
        return 'input[name="login"]'
    }
    get passwordField() {
        return 'input[name="password"]'
    }
    get loginButton() {
        return cy.get('button:contains("Login")')
    }
    get logoutButton() {
        return cy.get('a:contains("Logout")')
    }
    get registerButton() {
        return cy.get('a:contains("Register")')
    }
    get loginErrorMessage() {
        return cy.contains('Invalid username/password')
    }

	login(user: BuggyUser): void {
        cy.get(this.usernameField).clear()
        if (user.user) cy.get(this.usernameField).type(user.user)
        cy.get(this.passwordField).clear()
        if (user.password) cy.get(this.passwordField).type(user.password)
		this.loginButton.click()
	}

	logout(): void {
		this.logoutButton.click()
	}
}
