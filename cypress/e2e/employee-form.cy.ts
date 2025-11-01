describe('Employee Form', () => {
  beforeEach(() => {
    cy.mockEmployeesAPI();
  });

  describe('Create Employee', () => {
    beforeEach(() => {
      cy.visit('/employees/new');
    });

    it('should display create employee form', () => {
      cy.contains('Nuevo Empleado').should('be.visible');
      cy.get('form').should('be.visible');
      
      // Check form fields
      cy.get('input[formControlName="name"]').should('be.visible');
      cy.get('input[formControlName="position"]').should('be.visible');
      cy.get('input[formControlName="salary"]').should('be.visible');
      
      // Check buttons
      cy.contains('Crear Empleado').should('be.visible');
      cy.contains('Cancelar').should('be.visible');
    });

    it('should create employee with valid data', () => {
      // Fill form
      cy.get('input[formControlName="name"]').type('Nuevo Empleado');
      cy.get('input[formControlName="position"]').type('Tester');
      cy.get('input[formControlName="salary"]').type('40000');
      
      // Submit form
      cy.contains('Crear Empleado').click();
      
      cy.wait('@createEmployee');
      cy.url().should('include', '/employees');
    });

    it('should show validation errors for required fields', () => {
      // Try to submit empty form
      cy.contains('Crear Empleado').click();
      
      // Should not navigate away
      cy.url().should('include', '/employees/new');
      
      // Check for validation errors (after touching fields)
      cy.get('input[formControlName="name"]').focus().blur();
      cy.contains('name es requerido').should('be.visible');
    });

    it('should show validation error for short name', () => {
      cy.get('input[formControlName="name"]').type('A').blur();
      cy.contains('name debe tener al menos 2 caracteres').should('be.visible');
    });

    it('should show validation error for negative salary', () => {
      cy.get('input[formControlName="salary"]').type('-1000').blur();
      cy.contains('salary debe ser mayor o igual a 0').should('be.visible');
    });

    it('should disable submit button when form is invalid', () => {
      cy.get('input[formControlName="name"]').type('A'); // Invalid - too short
      cy.contains('Crear Empleado').should('be.disabled');
    });

    it('should enable submit button when form is valid', () => {
      cy.get('input[formControlName="name"]').type('Valid Name');
      cy.get('input[formControlName="position"]').type('Developer');
      cy.get('input[formControlName="salary"]').type('50000');
      
      cy.contains('Crear Empleado').should('not.be.disabled');
    });

    it('should cancel and navigate back to employees list', () => {
      cy.contains('Cancelar').click();
      cy.url().should('include', '/employees');
    });

    it('should handle API error when creating employee', () => {
      // Mock API error
      cy.intercept('POST', '/api/employees', { statusCode: 400, body: 'Bad Request' }).as('createEmployeeError');
      
      // Fill and submit form
      cy.get('input[formControlName="name"]').type('Test Employee');
      cy.contains('Crear Empleado').click();
      
      cy.wait('@createEmployeeError');
      cy.contains('Error al crear el empleado').should('be.visible');
      cy.url().should('include', '/employees/new'); // Should stay on form
    });
  });

  describe('Edit Employee', () => {
    beforeEach(() => {
      cy.visit('/employees/edit/1');
    });

    it('should display edit employee form', () => {
      cy.wait('@getEmployee');
      
      cy.contains('Editar Empleado').should('be.visible');
      cy.get('form').should('be.visible');
      
      // Check buttons
      cy.contains('Actualizar Empleado').should('be.visible');
      cy.contains('Cancelar').should('be.visible');
    });

    it('should load existing employee data', () => {
      cy.wait('@getEmployee');
      
      // Check that form is populated with existing data
      cy.get('input[formControlName="name"]').should('have.value', 'Juan Pérez');
      cy.get('input[formControlName="position"]').should('have.value', 'Developer');
      cy.get('input[formControlName="salary"]').should('have.value', '50000');
    });

    it('should update employee with modified data', () => {
      cy.wait('@getEmployee');
      
      // Modify form data
      cy.get('input[formControlName="name"]').clear().type('Juan Pérez Updated');
      cy.get('input[formControlName="position"]').clear().type('Senior Developer');
      cy.get('input[formControlName="salary"]').clear().type('55000');
      
      // Submit form
      cy.contains('Actualizar Empleado').click();
      
      cy.wait('@updateEmployee');
      cy.url().should('include', '/employees');
    });

    it('should handle loading state when fetching employee', () => {
      // Mock slow API response
      cy.intercept('GET', '/api/employees/1', { delay: 1000, body: { id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 } }).as('getSlowEmployee');
      cy.visit('/employees/edit/1');
      
      cy.contains('Cargando empleado...').should('be.visible');
      cy.wait('@getSlowEmployee');
      cy.contains('Cargando empleado...').should('not.exist');
    });

    it('should handle error when loading employee', () => {
      // Mock API error
      cy.intercept('GET', '/api/employees/1', { statusCode: 404, body: 'Not Found' }).as('getEmployeeError');
      cy.visit('/employees/edit/1');
      cy.wait('@getEmployeeError');
      
      cy.contains('Error al cargar el empleado').should('be.visible');
    });

    it('should handle error when updating employee', () => {
      cy.wait('@getEmployee');
      
      // Mock API error for update
      cy.intercept('PUT', '/api/employees/1', { statusCode: 400, body: 'Bad Request' }).as('updateEmployeeError');
      
      // Modify and submit form
      cy.get('input[formControlName="name"]').clear().type('Updated Name');
      cy.contains('Actualizar Empleado').click();
      
      cy.wait('@updateEmployeeError');
      cy.contains('Error al actualizar el empleado').should('be.visible');
      cy.url().should('include', '/employees/edit/1'); // Should stay on form
    });

    it('should show loading state when submitting', () => {
      cy.wait('@getEmployee');
      
      // Mock slow update response
      cy.intercept('PUT', '/api/employees/1', { delay: 1000, body: {} }).as('updateSlowEmployee');
      
      cy.get('input[formControlName="name"]').clear().type('Updated Name');
      cy.contains('Actualizar Empleado').click();
      
      cy.contains('Actualizar Empleado').should('be.disabled');
      cy.contains('Cancelar').should('be.disabled');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.visit('/employees/new');
    });

    it('should validate required name field', () => {
      cy.get('input[formControlName="name"]').focus().blur();
      cy.contains('name es requerido').should('be.visible');
    });

    it('should validate minimum name length', () => {
      cy.get('input[formControlName="name"]').type('A').blur();
      cy.contains('name debe tener al menos 2 caracteres').should('be.visible');
    });

    it('should validate minimum salary value', () => {
      cy.get('input[formControlName="salary"]').type('-100').blur();
      cy.contains('salary debe ser mayor o igual a 0').should('be.visible');
    });

    it('should accept valid form data', () => {
      cy.get('input[formControlName="name"]').type('Valid Employee Name');
      cy.get('input[formControlName="position"]').type('Valid Position');
      cy.get('input[formControlName="salary"]').type('50000');
      
      // No validation errors should be visible
      cy.get('.field-error').should('not.exist');
      cy.contains('Crear Empleado').should('not.be.disabled');
    });

    it('should allow empty position field', () => {
      cy.get('input[formControlName="name"]').type('Employee Name');
      cy.get('input[formControlName="salary"]').type('50000');
      // Leave position empty
      
      cy.contains('Crear Empleado').should('not.be.disabled');
    });

    it('should allow empty salary field', () => {
      cy.get('input[formControlName="name"]').type('Employee Name');
      cy.get('input[formControlName="position"]').type('Position');
      // Leave salary empty
      
      cy.contains('Crear Empleado').should('not.be.disabled');
    });
  });
});