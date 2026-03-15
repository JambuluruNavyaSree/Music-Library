describe('Music Player Component', () => {
  const testSong = {
    _id: 'song1',
    songName: 'Neon Nights',
    albumId: { albumName: 'Synthwave Classics' },
    artistId: [{ artistName: 'The Midnight' }],
    directorId: null,
    coverImage: 'https://via.placeholder.com/150',
    audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  };


  it('plays a song when clicked and controls render', () => {
    cy.login();

    cy.intercept('GET', '/api/songs*', {
      statusCode: 200,
      body: [testSong]
    }).as('getSongs');

    cy.visit('/songs');
    cy.wait('@getSongs');

    // Player should not be completely visible or have info initially
    cy.contains('Neon Nights').should('be.visible');
    
    // There should be a play button (using the react-icons play icon logic or hover)
    // Here we'll just click the song row
    cy.contains('Neon Nights').click();

    // Verify Player renders at bottom with song details
    // We search for the container that has 'Click for full screen player' title
    cy.get('div[title*="full screen player"]').should('be.visible');
    cy.get('div[title*="full screen player"]').contains('Neon Nights').should('be.visible');
    cy.get('div[title*="full screen player"]').contains('The Midnight').should('be.visible');
  });
});
