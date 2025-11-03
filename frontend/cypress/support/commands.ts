/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard')
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.contains('button', 'Cerrar Sesión').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

export {}
