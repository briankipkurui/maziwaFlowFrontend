describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the home page correctly', () => {
    cy.contains('Platcorp UI starter').should('be.visible');
  });

  it('has correct page title', () => {
    cy.title().should('not.be.empty');
  });
});
