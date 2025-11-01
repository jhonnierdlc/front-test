// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for employee management
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to create an employee via UI
       * @example cy.createEmployee('John Doe', 'Developer', 50000)
       */
      createEmployee(name: string, position?: string, salary?: number): Chainable<void>;
      
      /**
       * Custom command to wait for API response
       * @example cy.waitForEmployeesAPI()
       */
      waitForEmployeesAPI(): Chainable<void>;
      
      /**
       * Custom command to intercept and mock API calls
       * @example cy.mockEmployeesAPI()
       */
      mockEmployeesAPI(): Chainable<void>;
    }
  }
}