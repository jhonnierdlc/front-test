/// <reference types="cypress" />

// Custom commands for Employee Management System

Cypress.Commands.add('createEmployee', (name: string, position?: string, salary?: number) => {
  cy.visit('/employees/new');
  
  // Fill form
  cy.get('[data-cy=employee-name]').type(name);
  
  if (position) {
    cy.get('[data-cy=employee-position]').type(position);
  }
  
  if (salary) {
    cy.get('[data-cy=employee-salary]').type(salary.toString());
  }
  
  // Submit form
  cy.get('[data-cy=submit-button]').click();
});

Cypress.Commands.add('waitForEmployeesAPI', () => {
  cy.intercept('GET', '/api/employees').as('getEmployees');
  cy.wait('@getEmployees');
});

Cypress.Commands.add('mockEmployeesAPI', () => {
  const mockEmployees = [
    { id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 },
    { id: 2, name: 'María García', position: 'Designer', salary: 45000 },
    { id: 3, name: 'Carlos López', position: 'Manager', salary: 60000 }
  ];

  // Mock API responses
  cy.intercept('GET', '/api/employees', { body: mockEmployees }).as('getEmployees');
  cy.intercept('GET', '/api/employees/*', { body: mockEmployees[0] }).as('getEmployee');
  cy.intercept('POST', '/api/employees', { body: { id: 4, name: 'New Employee', position: 'Tester', salary: 40000 } }).as('createEmployee');
  cy.intercept('PUT', '/api/employees/*', { body: mockEmployees[0] }).as('updateEmployee');
  cy.intercept('DELETE', '/api/employees/*', { body: { message: 'Employee deleted' } }).as('deleteEmployee');
});