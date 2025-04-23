// Main game initialization

// Initialize the game on page load
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new PokemonGame();
    
    // Initialize UI
    const ui = new GameUI(game);
    
    // Start the game loop
    ui.startGameLoop();
    
    console.log('Idle Pokémon Catcher initialized!');
  });