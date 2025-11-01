describe('Navigation', () => {
  beforeEach(() => {
    cy.mockEmployeesAPI();
  });

  it('should navigate through main menu', () => {
    cy.visit('/');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
    
    // Navigate to employees list
    cy.contains('Lista de Empleados').click();
    cy.url().should('include', '/employees');
    cy.contains('Lista de Empleados').should('be.visible');
    
    // Navigate to new employee
    cy.contains('Nuevo Empleado').click();
    cy.url().should('include', '/employees/new');
    cy.contains('Nuevo Empleado').should('be.visible');
    
    // Navigate back to dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
  });

  it('should display application header', () => {
    cy.visit('/');
    
    cy.get('.app-header').should('be.visible');
    cy.contains('Gestión de Empleados').should('be.visible');
    
    // Check navigation menu
    cy.get('.nav-menu').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Lista de Empleados').should('be.visible');
    cy.contains('Nuevo Empleado').should('be.visible');
  });

  it('should highlight active navigation link', () => {
    cy.visit('/dashboard');
    cy.get('.nav-menu a[href="/dashboard"]').should('have.class', 'nav-link');
    
    cy.visit('/employees');
    cy.get('.nav-menu a[href="/employees"]').should('have.class', 'nav-link');
    
    cy.visit('/employees/new');
    cy.get('.nav-menu a[href="/employees/new"]').should('have.class', 'nav-link');
  });

  it('should handle direct URL navigation', () => {
    // Direct navigation to dashboard
    cy.visit('/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
    
    // Direct navigation to employees list
    cy.visit('/employees');
    cy.contains('Lista de Empleados').should('be.visible');
    
    // Direct navigation to new employee form
    cy.visit('/employees/new');
    cy.contains('Nuevo Empleado').should('be.visible');
    
    // Direct navigation to edit employee form
    cy.visit('/employees/edit/1');
    cy.contains('Editar Empleado').should('be.visible');
  });

  it('should redirect root path to dashboard', () => {
    cy.visit('/');
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
  });

  it('should handle browser back and forward navigation', () => {
    cy.visit('/dashboard');
    cy.contains('Lista de Empleados').click();
    cy.url().should('include', '/employees');
    
    // Go back
    cy.go('back');
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard de Empleados').should('be.visible');
    
    // Go forward
    cy.go('forward');
    cy.url().should('include', '/employees');
    cy.contains('Lista de Empleados').should('be.visible');
  });

  it('should maintain navigation state across page refreshes', () => {
    cy.visit('/employees');
    cy.contains('Lista de Empleados').should('be.visible');
    
    cy.reload();
    cy.url().should('include', '/employees');
    cy.contains('Lista de Empleados').should('be.visible');
  });
});