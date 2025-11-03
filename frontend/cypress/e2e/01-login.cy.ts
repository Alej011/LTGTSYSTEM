describe('Login - Admin Role', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    cy.visit('/')
  })

  it('should display login form', () => {
    // Verificar elementos del formulario de login
    cy.contains('LTGT S.A.').should('be.visible')
    cy.contains('Sistema de Gestión Empresarial').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Iniciar Sesión').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    // El navegador mostrará validación HTML5
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@email.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.get('button[type="submit"]').should('not.be.disabled')

    // Verificar mensaje de error
    cy.get('[data-testid="login-error"]', { timeout: 2000 }).should('be.visible')
    cy.get('[data-testid="login-error"]').should('contain', 'Credenciales inválidas')
  })

  it('should login successfully with admin credentials', () => {
    cy.get('input[type="email"]').type('admin@ltgt.local')
    cy.get('input[type="password"]').type('Admin123!')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')

    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible')

    cy.contains('Admin').should('be.visible')
  })

  it('should persist session after page reload', () => {
    cy.login('admin@ltgt.local', 'Admin123!')

    cy.reload()

    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should redirect to dashboard if already logged in', () => {
    cy.login('admin@ltgt.local', 'Admin123!')

    cy.visit('/')

    cy.url().should('include', '/dashboard')
  })
})
