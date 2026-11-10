import type { BuggyUser } from '../support/buggyCars/buggyUser'

export class RegisterPage {
    get usernameField() {
        return cy.get('#username')
    }
    get firstNameField() {
        return cy.get('#firstName')
    }
    get lastNameField() {
        return cy.get('#lastName')
    }
    get passwordField() {
        return cy.get('#password')
    }
    get confirmPasswordField() {
        return cy.get('#confirmPassword')
    }
    get registerButton() {
        return cy.contains('button', 'Register')
    }
    get registrationSuccessMessage() {
        return cy.contains('Registration is successful')
    }
    get registrationErrorMessage() {
        return cy.contains('Username already exists')
    }
    
	register(user: BuggyUser): void {
		this.usernameField.type(user.user)
		this.firstNameField.type('Test')
		this.lastNameField.type('Automation')
		this.passwordField.type(user.password)
		this.confirmPasswordField.type(user.password)
		this.registerButton.click()
	}
}
