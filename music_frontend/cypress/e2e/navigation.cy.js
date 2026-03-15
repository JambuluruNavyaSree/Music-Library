describe('Navigation Flow', () => {
  beforeEach(() => {
    // Intercept multiple endpoints so they don't break the UI if the backend isn't perfect
    cy.intercept('GET', '/api/songs*', []).as('getSongs');
    cy.intercept('GET', '/api/playlists', []).as('getPlaylists');
    cy.intercept('GET', '/api/artists', []).as('getArtists');
    cy.intercept('GET', '/api/directors', []).as('getDirectors');
    
    // Login natively bypasses the UI and goes straight to home
    cy.login({ role: 'member' });
    cy.visit('/');
  });

  it('navigates through the main sidebar links', () => {
    // Assert Home renders - matches text in Home.js
    cy.contains(/Good (morning|afternoon|evening)/).should('be.visible');
    cy.contains('Welcome to your Personal Library').should('be.visible');

    // Go to Songs
    cy.contains('nav a', 'All Songs').click();
    cy.url().should('include', '/songs');
    cy.contains('h1', 'All Songs').should('be.visible');

    // Go to Playlists/Library
    cy.contains('nav a', 'Library').click();
    cy.url().should('include', '/playlists');
    cy.contains('h1', 'My Library').should('be.visible');

    // Go to Artists
    cy.contains('nav a', 'Artists').click();
    cy.url().should('include', '/artists');
    cy.contains('h1', 'Artists').should('be.visible');

    // Go to Directors
    cy.contains('nav a', 'Directors').click();
    cy.url().should('include', '/directors');
    cy.contains('h1', 'Directors').should('be.visible');

    // Check Profile - it's a link around the avatar, title="My Profile"
    cy.get('a[title="My Profile"]').click();
    cy.url().should('include', '/profile');
    cy.contains('h1', 'My Profile').should('be.visible');
  });
});
