// ***********************************************
// Custom Cypress Commands
// ***********************************************

Cypress.Commands.add('login', (userOverrides = {}) => {
  const defaultUser = {
    id: 'mock-user-id',
    name: 'Test Admin',
    email: 'admin@musicbook.com',
    role: 'admin',
    ...userOverrides,
  };

  const mockToken = 'mock-jwt-token';

  // Use cy.session to persist auth state across tests
  // The cache ID depends on the user role/email to allow switching roles
  cy.session([defaultUser.email, defaultUser.role], () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', mockToken);
      win.localStorage.setItem('user', JSON.stringify(defaultUser));
    });
  }, {
    validate() {
      // Basic validation: checking if localStorage still has the user
      return cy.window().then((win) => {
        return !!win.localStorage.getItem('user');
      });
    }
  });

  // Baseline intercepts to prevent 401 redirects from unmocked requests
  // These stay outside the session because they are per-test mocks
  // These are fallbacks - tests should call cy.login() BEFORE their specific intercepts
  cy.intercept('GET', '/api/users/play-history', { statusCode: 200, body: [] });
  cy.intercept('GET', '/api/albums', { statusCode: 200, body: [] });
  cy.intercept('GET', '/api/artists', { statusCode: 200, body: [] });
  cy.intercept('GET', '/api/directors', { statusCode: 200, body: [] });
  cy.intercept('GET', '/api/playlists', { statusCode: 200, body: [] });
  cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });

  // Mock any direct profile fetches if the app does them
  cy.intercept('GET', '/api/auth/profile', {
    statusCode: 200,
    body: { user: defaultUser }
  }).as('getProfile');
});
