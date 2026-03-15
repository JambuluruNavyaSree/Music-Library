describe('Playlists Page', () => {
  const mockPlaylists = [
    {
      _id: 'play1',
      playlistName: 'Workout Mix',
      userId: 'mock-user-id',
      songs: []
    },
    {
      _id: 'play2',
      playlistName: 'Chill Vibes',
      userId: 'mock-user-id',
      songs: []
    }
  ];

  it('renders a list of user playlists', () => {
    cy.login();

    cy.intercept('GET', '/api/playlists', {
      statusCode: 200,
      body: mockPlaylists
    }).as('getPlaylists');

    cy.visit('/playlists');

    cy.contains('Workout Mix').should('be.visible');
    cy.contains('Chill Vibes').should('be.visible');
  });

  it('allows a user to create a new playlist', () => {
    cy.login();

    cy.intercept('GET', '/api/playlists', {
      statusCode: 200,
      body: mockPlaylists
    }).as('getPlaylists');

    cy.visit('/playlists');

    const newPlaylistStr = 'Study Focus';

    // Intercept POST request to mock creation
    cy.intercept('POST', '/api/playlists', {
      statusCode: 201,
      body: {
        _id: 'play3',
        playlistName: newPlaylistStr,
        userId: 'mock-user-id',
        songs: []
      }
    }).as('createPlaylist');

    // Click 'Create Playlist' button
    cy.contains('button', 'Create Playlist').click();

    // Fill in the form
    cy.get('input[placeholder="e.g. Midnight Melodies"]').type(newPlaylistStr);
    
    // Due to local state updates mapping to GET calls, mock it
    cy.intercept('GET', '/api/playlists', {
      statusCode: 200,
      body: [...mockPlaylists, { _id: 'play3', playlistName: newPlaylistStr, userId: 'mock-user-id', songs: [] }]
    }).as('getPlaylistsRefreshed');

    cy.get('.modal button[type="submit"]').click();

    // Verify alias was triggered
    cy.wait('@createPlaylist');
    cy.wait('@getPlaylistsRefreshed');
    cy.contains(newPlaylistStr).should('be.visible');
  });
});
