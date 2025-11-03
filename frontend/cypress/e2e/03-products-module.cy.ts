describe('Products Module - Admin Role', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.clearAllSessionStorage()
    cy.login('admin@ltgt.local', 'Admin123!')
    cy.contains('a', 'Productos').click()
    cy.url().should('include', '/products')
  })

  it('should display products list', () => {
    cy.contains('Gestión de Productos').should('be.visible')

    cy.get('table').should('exist')
    cy.get('tbody tr').should('have.length.at.least', 1)

    // Verificar columnas de la tabla
    cy.contains('th', 'Producto').should('be.visible')
    cy.contains('th', 'Marca').should('be.visible')
    cy.contains('th', 'SKU').should('be.visible')
    cy.contains('th', 'Precio').should('be.visible')
    cy.contains('th', 'Stock').should('be.visible')
    cy.contains('th', 'Estado').should('be.visible')
    cy.contains('th', 'Acciones').should('be.visible')
  })

  it('should search products by name', () => {
    cy.get('input[placeholder*="Buscar"]').should('be.visible')

    cy.get('input[placeholder*="Buscar"]').type('Dell')

    cy.wait(1000)

    cy.get('tbody tr').should('exist')
    cy.contains('tbody', 'Dell').should('be.visible')
  })

  it('should filter products by category', () => {
    cy.contains('Todas las categorías').click()

    cy.get('[role="option"]').then(($options) => {
      if ($options.length > 1) {
        cy.wrap($options[1]).click()
      }
    })

    cy.wait(1000)

    cy.get('tbody tr').should('exist')
  })

  it('should filter products by status', () => {
    cy.contains('Todos los estados').click()

    cy.get('[role="option"]').contains('Activo').click()

    cy.wait(1000)

    cy.get('tbody tr').should('exist')
  })


  it('should create a new product successfully', () => {
    cy.contains('button', 'Nuevo Producto').click()

    // Llenar formulario
    const timestamp = Date.now()
    cy.get('input[id="name"]').type(`Producto Test ${timestamp}`)
    cy.get('input[id="sku"]').type(`TEST-${timestamp}`)
    cy.get('textarea[id="description"]').type('Descripción de prueba para producto test')

    cy.contains('Seleccionar marca').click()
    cy.get('[role="option"]').first().click()

    cy.contains('Seleccionar categoría').click()
    cy.get('[role="option"]').first().click()

    cy.get('input[id="price"]').type('999.99')
    cy.get('input[id="stock"]').type('50')

    cy.contains('button', 'Crear Producto').click()

    cy.contains('Gestión de Productos', { timeout: 10000 }).should('be.visible')
    cy.contains(`Producto Test ${timestamp}`).should('be.visible')
  })

  it('should update a product successfully', () => {
    cy.get('tbody tr').first().find('td').last().find('button').first().click()

    const timestamp = Date.now()
    cy.get('input[id="name"]').clear().type(`Producto Editado ${timestamp}`)

    cy.contains('button', 'Actualizar').click()

    cy.contains('Gestión de Productos', { timeout: 10000 }).should('be.visible')
    cy.contains(`Producto Editado ${timestamp}`).should('be.visible')
  })

})
