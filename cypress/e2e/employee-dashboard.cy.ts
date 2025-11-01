describe('Employee Dashboard', () => {
  beforeEach(() => {
    cy.mockEmployeesAPI();
    cy.visit('/dashboard');
  });

  it('should display dashboard title', () => {
    cy.contains('Dashboard de Empleados').should('be.visible');
    cy.contains('Resumen general del sistema de gestión de empleados').should('be.visible');
  });

  it('should display employee statistics', () => {
    cy.waitForEmployeesAPI();
    
    // Check statistics cards
    cy.get('.stat-card').should('have.length.at.least', 3);
    
    // Total employees
    cy.contains('Total Empleados').should('be.visible');
    cy.contains('3').should('be.visible');
    
    // Average salary
    cy.contains('Salario Promedio').should('be.visible');
    cy.contains('$51,667').should('be.visible'); // (50000 + 45000 + 60000) / 3
    
    // Recent employees
    cy.contains('Empleados Recientes').should('be.visible');
  });

  it('should display quick actions', () => {
    cy.get('.quick-actions').should('be.visible');
    cy.contains('Acciones Rápidas').should('be.visible');
    
    // Check action buttons
    cy.contains('Agregar Empleado').should('be.visible');
    cy.contains('Ver Todos los Empleados').should('be.visible');
  });

  it('should navigate to create employee page', () => {
    cy.contains('Agregar Empleado').click();
    cy.url().should('include', '/employees/new');
    cy.contains('Nuevo Empleado').should('be.visible');
  });

  it('should navigate to employees list page', () => {
    cy.contains('Ver Todos los Empleados').click();
    cy.url().should('include', '/employees');
    cy.contains('Lista de Empleados').should('be.visible');
  });

  it('should display recent employees', () => {
    cy.waitForEmployeesAPI();
    
    cy.get('.recent-employees').should('be.visible');
    cy.get('.employee-card').should('have.length.at.least', 1);
    
    // Check employee data
    cy.contains('Juan Pérez').should('be.visible');
    cy.contains('Developer').should('be.visible');
    cy.contains('$50,000').should('be.visible');
  });

  it('should handle empty state', () => {
    // Mock empty employees list
    cy.intercept('GET', '/api/employees', { body: [] }).as('getEmptyEmployees');
    cy.visit('/dashboard');
    cy.wait('@getEmptyEmployees');
    
    cy.contains('¡Comienza agregando empleados!').should('be.visible');
    cy.contains('No tienes empleados registrados aún').should('be.visible');
    cy.contains('Agregar Primer Empleado').should('be.visible');
  });

  it('should handle loading state', () => {
    // Mock slow API response
    cy.intercept('GET', '/api/employees', { delay: 1000, body: [] }).as('getSlowEmployees');
    cy.visit('/dashboard');
    
    cy.contains('Cargando datos del dashboard...').should('be.visible');
    cy.wait('@getSlowEmployees');
    cy.contains('Cargando datos del dashboard...').should('not.exist');
  });
});