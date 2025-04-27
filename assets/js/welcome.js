// welcome.js - Welcome screen and audio manager for Idle Pokémon Catcher

class WelcomeScreen {
    constructor() {
      this.audioManager = new AudioManager();
      this.isGameStarted = false;
    }
  
    initialize() {
      // Create welcome screen overlay
      const overlay = document.createElement('div');
      overlay.className = 'welcome-overlay';
      
      const welcomeContainer = document.createElement('div');
      welcomeContainer.className = 'welcome-container';
      
      // Welcome content
      welcomeContainer.innerHTML = `
        <div class="welcome-logo">
          <h1>Idle Pokémon Catcher</h1>
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="Pikachu">
        </div>
        <div class="welcome-description">
          <p>Catch Pokémon, build your collection, and upgrade your trainer!</p>
          <p>Collect all Pokémon from each generation to unlock new features!</p>
        </div>
        <div class="audio-settings">
          <h3>Audio Settings</h3>
          <div class="settings-row">
            <label for="bgm-volume">Background Music:</label>
            <input type="range" id="bgm-volume" min="0" max="100" value="50">
            <button id="bgm-toggle" class="audio-toggle active">
              <span class="toggle-icon">🔊</span>
            </button>
          </div>
          <div class="settings-row">
            <label for="sfx-volume">Sound Effects:</label>
            <input type="range" id="sfx-volume" min="0" max="100" value="70">
            <button id="sfx-toggle" class="audio-toggle active">
              <span class="toggle-icon">🔊</span>
            </button>
          </div>
        </div>
        <button id="start-game" class="start-button">Start Game</button>
      `;
      
      overlay.appendChild(welcomeContainer);
      document.body.appendChild(overlay);
      
      // Add event listeners
      this.setupEventListeners();
      
      // Initialize audio
      this.audioManager.initialize();
      
      // Add welcome screen styles
      this.addWelcomeStyles();
    }
    
    setupEventListeners() {
      // Start game button
      document.getElementById('start-game').addEventListener('click', () => {
        this.startGame();
      });
      
      // BGM volume control
      document.getElementById('bgm-volume').addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        this.audioManager.setBgmVolume(volume);
      });
      
      // SFX volume control
      document.getElementById('sfx-volume').addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        this.audioManager.setSfxVolume(volume);
      });
      
      // BGM toggle
      document.getElementById('bgm-toggle').addEventListener('click', (e) => {
        const button = e.currentTarget;
        const icon = button.querySelector('.toggle-icon');
        
        if (button.classList.contains('active')) {
          button.classList.remove('active');
          icon.textContent = '🔇';
          this.audioManager.muteBgm(true);
        } else {
          button.classList.add('active');
          icon.textContent = '🔊';
          this.audioManager.muteBgm(false);
        }
      });
      
      // SFX toggle
      document.getElementById('sfx-toggle').addEventListener('click', (e) => {
        const button = e.currentTarget;
        const icon = button.querySelector('.toggle-icon');
        
        if (button.classList.contains('active')) {
          button.classList.remove('active');
          icon.textContent = '🔇';
          this.audioManager.muteSfx(true);
        } else {
          button.classList.add('active');
          icon.textContent = '🔊';
          this.audioManager.muteSfx(false);
        }
      });
    }
    
    startGame() {
      if (this.isGameStarted) return;
      this.isGameStarted = true;
      
      // Hide welcome screen with animation
      const overlay = document.querySelector('.welcome-overlay');
      overlay.classList.add('fade-out');
      
      // Start background music
      this.audioManager.playBgm('main');
      
      // Remove overlay after animation
      setTimeout(() => {
        overlay.remove();
        
        // Initialize the game
        const game = new PokemonGame();
        const ui = new GameUI(game);
        ui.startGameLoop();
        
        // Attach audioManager to the game instance
        game.audioManager = this.audioManager;
        
        // Initialize the UI-Game audio connection
        this.initializeGameAudioHandlers(game, ui);
        
        console.log('Idle Pokémon Catcher started!');
      }, 1000);
    }
    
    initializeGameAudioHandlers(game, ui) {
      // Override catchPokemon method to add sounds
      const originalCatchMethod = game.catchPokemon;
      game.catchPokemon = async function() {
        const results = await originalCatchMethod.call(this);
        
        // Play appropriate sounds based on results
        results.forEach(result => {
          if (result.caught) {
            if (result.isShiny) {
              this.audioManager.playSfx('shiny')
            } else if (MYTHICAL_POKEMON.has(result.name.toLowerCase())) {
              this.audioManager.playSfx('mythical');
            } else if (LEGENDARY_POKEMON.has(result.name.toLowerCase())) {
              this.audioManager.playSfx('legendary');
            } else {
              this.audioManager.playSfx('catch');
            }
          } else {
            this.audioManager.playSfx('miss');
          }
        });
        
        return results;
      };
      
      // Add sounds to generation completion
      const originalGenCheck = game.checkGenerationCompletion;
      game.checkGenerationCompletion = function() {
        const result = originalGenCheck.call(this);
        if (result) {
          this.audioManager.playSfx('genComplete');
        }
        return result;
      };
      
      // Add sounds to upgrades
      const upgradeButtons = [
        'upgrade-speed',
        'upgrade-quality',
        'upgrade-multiplier',
        'upgrade-autorelease',
        'upgrade-mythicalbooster',
        'upgrade-greatball',
        'upgrade-ultraball',
        'upgrade-masterball'
      ];
      
      upgradeButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        const originalClickHandler = btn.onclick;
        
        btn.onclick = (e) => {
          const result = originalClickHandler ? originalClickHandler(e) : undefined;
          game.audioManager.playSfx('upgrade');
          return result;
        };
      });

      // Add sounds effect to rebirth upgrades
      const rebirthButtons = [
        'rebirth-button',
        'upgrade-permanent-speed',
        'upgrade-permanent-coin',
        'upgrade-shiny-boost'
      ];

      rebirthButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        const originalClickHandler = btn.onclick;
        
        btn.onclick = (e) => {
          const result = originalClickHandler ? originalClickHandler(e) : undefined;
          game.audioManager.playSfx('rebirth');
          return result;
        };
      });
      
    }
    
    addWelcomeStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .welcome-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 1;
          transition: opacity 1s ease-out;
        }
        
        .welcome-overlay.fade-out {
          opacity: 0;
        }
        
        .welcome-container {
          background: linear-gradient(135deg, #2c3e50, #4c6987);
          border-radius: 15px;
          padding: 30px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          text-align: center;
          color: white;
        }
        
        .welcome-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .welcome-logo h1 {
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(135deg, #3498db, #9b59b6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        .welcome-logo img {
          width: 80px;
          height: 80px;
          filter: drop-shadow(0 0 10px rgba(255, 255, 0, 0.7));
          animation: float 3s ease-in-out infinite;
        }
        
        .welcome-description {
          margin-bottom: 30px;
          font-size: 1.1rem;
          line-height: 1.5;
        }
        
        .audio-settings {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 30px;
        }
        
        .audio-settings h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #3498db;
        }
        
        .settings-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding: 5px;
        }
        
        .settings-row label {
          width: 150px;
          text-align: left;
          margin-right: 10px;
        }
        
        .settings-row input[type="range"] {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: #34495e;
          outline: none;
          margin-right: 15px;
          cursor: pointer;
        }
        
        .settings-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3498db;
          cursor: pointer;
        }
        
        .audio-toggle {
          background: none;
          border: 2px solid #3498db;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          padding: 0;
          transition: all 0.2s;
        }
        
        .audio-toggle.active {
          background: #3498db;
        }
        
        .audio-toggle:hover {
          transform: scale(1.1);
        }
        
        .start-button {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.2rem;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .start-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          background: linear-gradient(135deg, #2980b9, #3498db);
        }
        
        .start-button:active {
          transform: translateY(1px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @media (max-width: 768px) {
          .welcome-logo {
            flex-direction: column;
            gap: 10px;
          }
          
          .welcome-logo h1 {
            font-size: 1.8rem;
          }
          
          .settings-row {
            flex-wrap: wrap;
          }
          
          .settings-row label {
            width: 100%;
            margin-bottom: 5px;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
  
  class AudioManager {
    constructor() {
      this.bgmVolume = 0.5;  // Default to 50%
      this.sfxVolume = 0.7;  // Default to 70%
      this.bgmMuted = false;
      this.sfxMuted = false;
      
      this.bgm = {};  // Background music tracks
      this.sfx = {};  // Sound effects
      
      this.currentBgm = null;
    }
    
    initialize() {
      // Load background music
      this.bgm = {
        main: new Audio('./assets/audio/theme.wav'),
        battle: new Audio('./assets/audio/theme.wav')
      };
      
      // Set bgm to loop
      for (const track in this.bgm) {
        this.bgm[track].loop = true;
        this.bgm[track].volume = this.bgmVolume;
      }
      
      // Load sound effects
      this.sfx = {
        catch: new Audio('./assets/audio/catch.mp3'),
        legendary: new Audio('./assets/audio/legendary.mp3'),
        mythical: new Audio('./assets/audio/mythical.mp3'),
        miss: new Audio('./assets/audio/miss.mp3'),
        upgrade: new Audio('./assets/audio/SFX_LEVEL_UP.wav'),
        rebirth: new Audio('./assets/audio/rebirth.mp3'),
        shiny: new Audio('./assets/audio/shiny.mp3'),
        genComplete: new Audio('./assets/audio/genComplete.mp3')
      };
      
      // Set sfx volumes
      for (const sound in this.sfx) {
        this.sfx[sound].volume = this.sfxVolume;
      }
      
      // Handle audio loading errors
      for (const track in this.bgm) {
        this.bgm[track].onerror = () => console.error(`Error loading BGM: ${track}`);
      }
      
      for (const sound in this.sfx) {
        this.sfx[sound].onerror = () => console.error(`Error loading SFX: ${sound}`);
      }
      
      // Fix for mobile - preload sounds on user interaction
      document.addEventListener('click', () => {
        for (const track in this.bgm) {
          const audio = this.bgm[track];
          audio.load();
          audio.play().then(() => audio.pause()).catch(e => console.log("Audio preload silently failed as expected", e));
        }
        
        for (const sound in this.sfx) {
          const audio = this.sfx[sound];
          audio.load();
          audio.play().then(() => audio.pause()).catch(e => console.log("Audio preload silently failed as expected", e));
        }
      }, { once: true });
    }
    
    playBgm(trackName) {
      // Stop current bgm if playing
      if (this.currentBgm && !this.currentBgm.paused) {
        this.currentBgm.pause();
        this.currentBgm.currentTime = 0;
      }
      
      // Play new track if it exists and not muted
      if (this.bgm[trackName] && !this.bgmMuted) {
        this.currentBgm = this.bgm[trackName];
        this.currentBgm.currentTime = 0;
        
        // Handle promise rejection for autoplay restrictions
        const playPromise = this.currentBgm.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Autoplay prevented: User must interact with the page first");
          });
        }
      }
    }
    
    playSfx(soundName) {
      // Play sound effect if it exists and not muted
      if (this.sfx[soundName] && !this.sfxMuted) {
        // Clone the audio to allow multiple instances playing at once
        const sound = this.sfx[soundName].cloneNode();
        sound.volume = this.sfxVolume;
        
        // Handle promise rejection for autoplay restrictions
        const playPromise = sound.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log(`Could not play sound ${soundName}: ${error}`);
          });
        }
      }
    }
    
    setBgmVolume(volume) {
      this.bgmVolume = volume;
      for (const track in this.bgm) {
        this.bgm[track].volume = volume;
      }
    }
    
    setSfxVolume(volume) {
      this.sfxVolume = volume;
      for (const sound in this.sfx) {
        this.sfx[sound].volume = volume;
      }
    }
    
    muteBgm(mute) {
      this.bgmMuted = mute;
      if (mute && this.currentBgm) {
        this.currentBgm.pause();
      } else if (!mute && this.currentBgm) {
        this.currentBgm.play().catch(error => {
          console.log("Failed to resume music: User must interact with the page first");
        });
      }
    }
    
    muteSfx(mute) {
      this.sfxMuted = mute;
    }
    
    // Function to change music on specific events
    changeBgm(trackName) {
      if (this.currentBgm !== this.bgm[trackName]) {
        this.playBgm(trackName);
      }
    }
  }
  
  // Initialize welcome screen when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Replace the main.js initialization with our welcome screen
    const welcome = new WelcomeScreen();
    welcome.initialize();
    
    console.log('Welcome screen initialized!');
  });