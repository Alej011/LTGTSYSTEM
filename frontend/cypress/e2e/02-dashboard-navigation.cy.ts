describe('Dashboard Navigation - Admin Role', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    cy.login('admin@ltgt.local', 'Admin123!')
  })

  it('should display dashboard with all admin sections', () => {
    cy.url().should('include', '/dashboard')

    cy.contains('Dashboard').should('be.visible')
    cy.contains('Admin').should('be.visible')

    cy.contains('Productos').should('be.visible')
    cy.contains('Usuarios').should('be.visible')
  })

  it('should navigate to Products module', () => {
    // Verificar navegación
    cy.contains('a', 'Productos').click()

    cy.url().should('include', '/products')

    cy.contains('Gestión de Productos', { timeout: 10000 }).should('be.visible')

    cy.contains('button', 'Nuevo Producto').should('be.visible')
  })

  it('should navigate to Users module', () => {
    cy.contains('a', 'Usuarios').click()

    cy.url().should('include', '/users')

    cy.contains('Gestión de Usuarios', { timeout: 10000 }).should('be.visible')

    cy.contains('button', 'Nuevo Usuario').should('be.visible')
  })

  it('should return to dashboard from products', () => {
    cy.contains('a', 'Productos').click()
    cy.url().should('include', '/products')

    cy.contains('button', 'Volver al Dashboard').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should return to dashboard from users', () => {
    cy.contains('a', 'Usuarios').click()
    cy.url().should('include', '/users')

    cy.contains('button', 'Volver al Dashboard').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.contains('button', 'Cerrar Sesión').click()

    cy.url().should('eq', Cypress.config().baseUrl + '/')

    cy.visit('/dashboard')

    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should display user info in header', () => {
    cy.contains('Admin').should('be.visible')

    cy.contains('button', 'Cerrar Sesión').should('be.visible')
  })
})
