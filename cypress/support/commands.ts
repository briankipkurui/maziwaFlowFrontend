/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

// Custom command: Select element by data-testid attribute
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Custom command: Clear session storage and local storage
Cypress.Commands.add('clearAppStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Select DOM element by data-testid attribute
       * @example cy.getByTestId('login-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Clear localStorage and sessionStorage
       * @example cy.clearAppStorage()
       */
      clearAppStorage(): Chainable<void>;
    }
  }
}

export {};
