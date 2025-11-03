/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/')

  // Esperar a que el formulario de login esté completamente listo
  cy.contains('LTGT S.A.').should('be.visible')

  // Esperar a que los inputs estén disponibles y listos para interactuar
  cy.get('input[type="email"]')
    .should('be.visible')
    .should('not.be.disabled')
    .should('be.enabled')

  cy.get('input[type="password"]')
    .should('be.visible')
    .should('not.be.disabled')
    .should('be.enabled')

  // Realizar login
  cy.get('input[type="email"]').clear().type(email)
  cy.get('input[type="password"]').clear().type(password)
  cy.get('button[type="submit"]').should('be.visible').click()

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
