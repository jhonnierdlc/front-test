describe('Employee Management Integration', () => {
  beforeEach(() => {
    cy.mockEmployeesAPI();
  });

  it('should complete full employee lifecycle', () => {
    // Start at dashboard
    cy.visit('/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
    
    // Navigate to create employee
    cy.contains('Agregar Empleado').click();
    cy.url().should('include', '/employees/new');
    
    // Create new employee
    cy.get('input[formControlName="name"]').type('Integration Test Employee');
    cy.get('input[formControlName="position"]').type('QA Engineer');
    cy.get('input[formControlName="salary"]').type('45000');
    cy.contains('Crear Empleado').click();
    
    cy.wait('@createEmployee');
    cy.url().should('include', '/employees');
    
    // Verify employee appears in list
    cy.waitForEmployeesAPI();
    cy.contains('Integration Test Employee').should('be.visible');
    
    // Edit the employee
    cy.get('.employee-table tbody tr').contains('Integration Test Employee')
      .parent('tr').within(() => {
        cy.contains('Editar').click();
      });
    
    cy.url().should('match', /\/employees\/edit\/\d+/);
    cy.wait('@getEmployee');
    
    // Update employee data
    cy.get('input[formControlName="name"]').clear().type('Updated Integration Employee');
    cy.get('input[formControlName="position"]').clear().type('Senior QA Engineer');
    cy.get('input[formControlName="salary"]').clear().type('50000');
    cy.contains('Actualizar Empleado').click();
    
    cy.wait('@updateEmployee');
    cy.url().should('include', '/employees');
    
    // Verify updated data
    cy.waitForEmployeesAPI();
    cy.contains('Updated Integration Employee').should('be.visible');
    cy.contains('Senior QA Engineer').should('be.visible');
    
    // Delete the employee
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    
    cy.get('.employee-table tbody tr').contains('Updated Integration Employee')
      .parent('tr').within(() => {
        cy.contains('Eliminar').click();
      });
    
    cy.wait('@deleteEmployee');
    cy.wait('@getEmployees');
    
    // Verify employee is removed from list
    cy.contains('Updated Integration Employee').should('not.exist');
  });

  it('should handle error scenarios gracefully', () => {
    // Test API error handling
    cy.intercept('GET', '/api/employees', { statusCode: 500, body: 'Server Error' }).as('getEmployeesError');
    cy.visit('/employees');
    cy.wait('@getEmployeesError');
    
    cy.contains('Error al cargar los empleados').should('be.visible');
    cy.contains('Reintentar').should('be.visible');
    
    // Test retry functionality
    cy.mockEmployeesAPI();
    cy.contains('Reintentar').click();
    cy.wait('@getEmployees');
    cy.get('.employee-table').should('be.visible');
  });

  it('should maintain data consistency across views', () => {
    cy.visit('/dashboard');
    cy.waitForEmployeesAPI();
    
    // Check dashboard statistics
    cy.contains('3').should('be.visible'); // Total employees
    
    // Navigate to employees list
    cy.contains('Ver Todos los Empleados').click();
    cy.waitForEmployeesAPI();
    
    // Verify same number of employees in table
    cy.get('.employee-table tbody tr').should('have.length', 3);
    
    // Go back to dashboard
    cy.contains('Dashboard').click();
    cy.waitForEmployeesAPI();
    
    // Statistics should remain consistent
    cy.contains('3').should('be.visible');
  });

  it('should handle form validation across different scenarios', () => {
    cy.visit('/employees/new');
    
    // Test empty form submission
    cy.contains('Crear Empleado').click();
    cy.url().should('include', '/employees/new');
    
    // Test partial form completion
    cy.get('input[formControlName="name"]').type('Test Employee');
    cy.contains('Crear Empleado').should('not.be.disabled');
    
    // Test invalid data
    cy.get('input[formControlName="salary"]').type('-1000');
    cy.get('input[formControlName="salary"]').blur();
    cy.contains('salary debe ser mayor o igual a 0').should('be.visible');
    
    // Fix validation error
    cy.get('input[formControlName="salary"]').clear().type('40000');
    cy.contains('salary debe ser mayor o igual a 0').should('not.exist');
    
    // Submit valid form
    cy.contains('Crear Empleado').click();
    cy.wait('@createEmployee');
    cy.url().should('include', '/employees');
  });

  it('should handle navigation edge cases', () => {
    // Test navigation to non-existent employee
    cy.visit('/employees/edit/999');
    cy.intercept('GET', '/api/employees/999', { statusCode: 404, body: 'Not Found' }).as('getEmployeeNotFound');
    cy.wait('@getEmployeeNotFound');
    cy.contains('Error al cargar el empleado').should('be.visible');
    
    // Test navigation with invalid routes
    cy.visit('/invalid-route');
    // Should handle gracefully (depending on routing configuration)
    
    // Test deep linking
    cy.visit('/employees/edit/1');
    cy.wait('@getEmployee');
    cy.contains('Editar Empleado').should('be.visible');
    cy.get('input[formControlName="name"]').should('have.value', 'Juan Pérez');
  });

  it('should handle concurrent operations', () => {
    cy.visit('/employees');
    cy.waitForEmployeesAPI();
    
    // Simulate multiple quick operations
    cy.get('.employee-table tbody tr').first().within(() => {
      cy.contains('Editar').click();
    });
    
    cy.url().should('include', '/employees/edit/1');
    cy.wait('@getEmployee');
    
    // Quick navigation back and forth
    cy.contains('Cancelar').click();
    cy.url().should('include', '/employees');
    
    cy.contains('Nuevo Empleado').click();
    cy.url().should('include', '/employees/new');
    
    cy.contains('Cancelar').click();
    cy.url().should('include', '/employees');
    
    // Should maintain stable state
    cy.get('.employee-table').should('be.visible');
    cy.get('.employee-table tbody tr').should('have.length', 3);
  });

  it('should handle responsive design', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.visit('/dashboard');
    cy.waitForEmployeesAPI();
    
    // Dashboard should be responsive
    cy.get('.dashboard-container').should('be.visible');
    cy.get('.stats-grid').should('be.visible');
    
    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.visit('/employees');
    cy.waitForEmployeesAPI();
    
    // Table should be responsive
    cy.get('.employee-table').should('be.visible');
    
    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.visit('/employees/new');
    
    // Form should be responsive
    cy.get('form').should('be.visible');
    cy.get('.form-container').should('be.visible');
  });
});