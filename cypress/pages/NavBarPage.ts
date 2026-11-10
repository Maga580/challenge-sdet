import type { BuggyUser } from '../support/buggyCars/buggyUser'

export class NavBarPage {
  // Raw selectors, for specs that need to build selectors outside a test
  // (e.g. data-driven cases checking native `:invalid` state).
  readonly selectors = {
    usernameField: 'input[name="login"]',
    passwordField: 'input[name="password"]',
  } as const

  get usernameField() {
    return cy.get(this.selectors.usernameField)
  }
  get passwordField() {
    return cy.get(this.selectors.passwordField)
  }
  get loginButton() {
    return cy.contains('button', 'Login')
  }
  get logoutButton() {
    return cy.contains('a', 'Logout')
  }
  get registerButton() {
    return cy.contains('a', 'Register')
  }
  get loginErrorMessage() {
    return cy.contains('Invalid username/password')
  }

  login(user: BuggyUser): void {
    this.usernameField.clear()
    if (user.user) this.usernameField.type(user.user)
    this.passwordField.clear()
    if (user.password) this.passwordField.type(user.password)
    this.loginButton.click()
  }

  logout(): void {
    this.logoutButton.click()
  }
}
