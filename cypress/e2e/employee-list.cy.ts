describe('Employee List', () => {
  beforeEach(() => {
    cy.mockEmployeesAPI();
    cy.visit('/employees');
  });

  it('should display employees list page', () => {
    cy.contains('Lista de Empleados').should('be.visible');
    cy.contains('Nuevo Empleado').should('be.visible');
  });

  it('should display employees table', () => {
    cy.waitForEmployeesAPI();
    
    // Check table headers
    cy.get('.employee-table thead th').should('contain', 'ID');
    cy.get('.employee-table thead th').should('contain', 'Nombre');
    cy.get('.employee-table thead th').should('contain', 'Posición');
    cy.get('.employee-table thead th').should('contain', 'Salario');
    cy.get('.employee-table thead th').should('contain', 'Acciones');
    
    // Check table rows
    cy.get('.employee-table tbody tr').should('have.length', 3);
  });

  it('should display employee data correctly', () => {
    cy.waitForEmployeesAPI();
    
    // Check first employee data
    cy.get('.employee-table tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'Juan Pérez');
      cy.get('td').eq(2).should('contain', 'Developer');
      cy.get('td').eq(3).should('contain', '$50,000');
      
      // Check action buttons
      cy.contains('Editar').should('be.visible');
      cy.contains('Eliminar').should('be.visible');
    });
  });

  it('should navigate to create employee page', () => {
    cy.contains('Nuevo Empleado').click();
    cy.url().should('include', '/employees/new');
    cy.contains('Nuevo Empleado').should('be.visible');
  });

  it('should navigate to edit employee page', () => {
    cy.waitForEmployeesAPI();
    
    cy.get('.employee-table tbody tr').first().within(() => {
      cy.contains('Editar').click();
    });
    
    cy.url().should('include', '/employees/edit/1');
    cy.contains('Editar Empleado').should('be.visible');
  });

  it('should delete employee with confirmation', () => {
    cy.waitForEmployeesAPI();
    
    // Mock window.confirm to return true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    
    cy.get('.employee-table tbody tr').first().within(() => {
      cy.contains('Eliminar').click();
    });
    
    cy.wait('@deleteEmployee');
    cy.wait('@getEmployees'); // Should reload the list
  });

  it('should not delete employee when confirmation is cancelled', () => {
    cy.waitForEmployeesAPI();
    
    // Mock window.confirm to return false
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false);
    });
    
    cy.get('.employee-table tbody tr').first().within(() => {
      cy.contains('Eliminar').click();
    });
    
    // Should not make delete API call
    cy.get('@deleteEmployee.all').should('have.length', 0);
  });

  it('should handle empty employees list', () => {
    // Mock empty employees list
    cy.intercept('GET', '/api/employees', { body: [] }).as('getEmptyEmployees');
    cy.visit('/employees');
    cy.wait('@getEmptyEmployees');
    
    cy.contains('No hay empleados registrados').should('be.visible');
    cy.contains('Agregar primer empleado').should('be.visible');
  });

  it('should handle loading state', () => {
    // Mock slow API response
    cy.intercept('GET', '/api/employees', { delay: 1000, body: [] }).as('getSlowEmployees');
    cy.visit('/employees');
    
    cy.contains('Cargando empleados...').should('be.visible');
    cy.wait('@getSlowEmployees');
    cy.contains('Cargando empleados...').should('not.exist');
  });

  it('should handle API error', () => {
    // Mock API error
    cy.intercept('GET', '/api/employees', { statusCode: 500, body: 'Server Error' }).as('getEmployeesError');
    cy.visit('/employees');
    cy.wait('@getEmployeesError');
    
    cy.contains('Error al cargar los empleados').should('be.visible');
    cy.contains('Reintentar').should('be.visible');
  });

  it('should retry loading employees after error', () => {
    // Mock API error first, then success
    cy.intercept('GET', '/api/employees', { statusCode: 500, body: 'Server Error' }).as('getEmployeesError');
    cy.visit('/employees');
    cy.wait('@getEmployeesError');
    
    // Mock successful response for retry
    cy.mockEmployeesAPI();
    
    cy.contains('Reintentar').click();
    cy.wait('@getEmployees');
    
    cy.get('.employee-table').should('be.visible');
  });

  it('should format salary correctly', () => {
    cy.waitForEmployeesAPI();
    
    // Check salary formatting
    cy.get('.employee-table tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(3).should('match', /\$[\d,]+/);
    });
  });

  it('should handle position display', () => {
    cy.waitForEmployeesAPI();
    
    // Check that positions are displayed or show default text
    cy.get('.employee-table tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(2).should('not.be.empty');
    });
  });
});