describe('Songs Page', () => {
  const mockSongs = [
    {
      _id: 'song1',
      songName: 'Neon Nights',
      albumId: { albumName: 'Synthwave Classics' },
      artistId: [{ artistName: 'The Midnight' }],
      directorId: null,
      coverImage: 'https://via.placeholder.com/150',
      audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      _id: 'song2',
      songName: 'Acoustic Sunrise',
      albumId: null,
      artistId: [{ artistName: 'Jane Doe' }],
      directorId: { directorName: 'John Smith' },
      coverImage: 'https://via.placeholder.com/150',
      audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    }
  ];


  it('renders a list of songs from the API', () => {
    cy.login({ role: 'member' });

    // Intercept the API call to return our mock songs
    cy.intercept('GET', '/api/songs*', {
      statusCode: 200,
      body: mockSongs
    }).as('getSongs');

    cy.visit('/songs');
    cy.wait('@getSongs');

    // Check that both songs are in the DOM
    cy.contains('Neon Nights').should('be.visible');
    cy.contains('Acoustic Sunrise').should('be.visible');

    // Check artist names
    cy.contains('The Midnight').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');
  });

  it('filters songs by search query', () => {
    cy.login({ role: 'member' });

    // Intercept the API call to return our mock songs
    cy.intercept('GET', '/api/songs*', {
      statusCode: 200,
      body: mockSongs
    }).as('getSongs');

    cy.visit('/songs');
    cy.wait('@getSongs');

    // Click search toggle in navbar
    cy.get('button[title="Search"]').click();
    
    // Search for "neon"
    cy.get('input[placeholder*="Search"]').type('Neon{enter}');
    
    // Check URL
    cy.url().should('include', 'search=Neon');

    // "Neon Nights" should remain visible, "Acoustic Sunrise" should not
    cy.contains('Neon Nights').should('be.visible');
    cy.contains('Acoustic Sunrise').should('not.exist');
  });
});
