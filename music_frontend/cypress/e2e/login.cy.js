describe('Login Flow', () => {
  beforeEach(() => {
    // Navigate to the app before each test
    cy.visit('/');
  });

  it('successfully loads the landing page and shows login form', () => {
    cy.contains('MusicLib').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('allows a user to log in', () => {
    const testEmail = 'admin@musicbook.com';
    const testPassword = 'Admin@123';

    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    
    cy.contains('button', 'Sign In').click();

    cy.url().should('not.include', 'login');
  });
});
