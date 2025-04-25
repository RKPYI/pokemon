// UI handling and rendering

class GameUI {
  constructor(game) {
    this.game = game;
    this.pokemonCache = new Map(); // Cache for Pokémon data to avoid re-fetching
    this.currentSortBy = 'rarity';
    this.initUI();
  }
  

  initUI() {
      // Initialize UI elements
      this.updateStats();
      this.renderPokedex();
      
      // Set up event listeners for basic upgrades
      document.getElementById('upgrade-speed').addEventListener('click', () => {
      if (this.game.upgradeSpeed()) {
          this.updateStats();
          this.restartGameLoop();
      }
      });
      
      document.getElementById('upgrade-quality').addEventListener('click', () => {
      if (this.game.upgradeQuality()) {
          this.updateStats();
      }
      });
      
      document.getElementById('upgrade-multiplier').addEventListener('click', () => {
      if (this.game.upgradeCoinMultiplier()) {
          this.updateStats();
      }
      });
      
      document.getElementById('upgrade-autorelease').addEventListener('click', () => {
      if (this.game.enableAutoRelease()) {
          this.updateStats();
      }
      });

      document.getElementById('upgrade-mythicalbooster').addEventListener('click', () => {
        if (this.game.upgradeMythicalBooster()) {
          this.updateStats();
          // Update the button cost
          document.getElementById('mythicalBoosterCost').textContent = this.game.getMythicalBoosterCost();
        }
      });
      
      // Set up event listeners for Pokeball upgrades
      document.getElementById('upgrade-greatball').addEventListener('click', () => {
      if (this.game.upgradePokeBall('greatBall')) {
          this.updateStats();
      }
      });
      
      document.getElementById('upgrade-ultraball').addEventListener('click', () => {
      if (this.game.upgradePokeBall('ultraBall')) {
          this.updateStats();
      }
      });
      
      document.getElementById('upgrade-masterball').addEventListener('click', () => {
      if (this.game.upgradePokeBall('masterBall')) {
          this.updateStats();
      }
      });
      
      document.getElementById('sort-by').addEventListener('change', (e) => {
      this.currentSortBy = e.target.value;
      this.renderPokedex(this.currentSortBy);
      });

      // Setup collapsible sections for mobile
      this.setupCollapsibleSections();

      document.getElementById('toggle-dex-mode').addEventListener('click', () => {
        this.game.toggleDexMode();
        this.renderPokedex(this.currentSortBy);
        this.updateStats();
        
        // Update the button text
        const toggleButton = document.getElementById('toggle-dex-mode');
        toggleButton.textContent = this.game.isDexShinyMode ? 
          'Show Normal Pokédex' : 'Show Shiny Pokédex';
      });
  }

  updateStats() {
      // Update player stats in UI
      document.getElementById('coins').textContent = this.game.coins;
      document.getElementById('total-caught').textContent = this.game.totalCaught;
      document.getElementById('catch-speed').textContent = (this.game.catchInterval / 1000).toFixed(1);
      document.getElementById('catch-amount').textContent = this.game.catchAmount;
      document.getElementById('current-gen').textContent = this.game.currentGen;
      document.getElementById('quality-level').textContent = this.game.qualityLevel || 0;
      document.getElementById('coin-multiplier').textContent = `${this.game.coinMultiplier || 1}x`;
      document.getElementById('auto-release').textContent = this.game.autoReleaseEnabled ? 'Active' : 'Inactive';
      document.getElementById('mythicalBoosterCost').textContent = this.game.getMythicalBoosterCost();

      document.getElementById('total-shiny-caught').textContent = this.game.totalShinyCaught || 0;
      document.getElementById('unique-shiny-count').textContent = this.game.uniqueShinyCount || 0;

      const shinyChance = this.game.getShinyChance();
      if (document.getElementById('shiny-chance')) {
        document.getElementById('shiny-chance').textContent = `1/${Math.round(1/shinyChance)}`;
      }
      
      // Update Pokédex progress
      const stats = this.game.getPokedexStats();
      document.getElementById('pokedex-progress').textContent = `(${stats.caught}/${stats.total})`;
      
      // Add this line to update the catch rate UI
      this.updateCatchRateUI();

      // Update upgrade button states
      this.updateUpgradeButtons();
      
      // Update Pokeball statuses
      this.updatePokeballStatus();
      
      // Update Generation Mastery status
      this.updateGenMasteryStatus();
  }

  updateUpgradeButtons() {
      // Speed upgrade
      const speedBtn = document.getElementById('upgrade-speed');
      speedBtn.disabled = this.game.coins < GAME_CONFIG.speedUpgradeCost || this.game.catchInterval <= GAME_CONFIG.minCatchInterval;
      speedBtn.textContent = `Upgrade Catch Speed (Cost: ${GAME_CONFIG.speedUpgradeCost})`;
      
      // Quality upgrade
      const qualityBtn = document.getElementById('upgrade-quality');
      const qualityLevel = this.game.qualityLevel || 0;
      qualityBtn.disabled = this.game.coins < GAME_CONFIG.qualityUpgradeCost || qualityLevel >= GAME_CONFIG.maxQualityLevel;
      qualityBtn.textContent = `Upgrade Catch Quality (Cost: ${GAME_CONFIG.qualityUpgradeCost})`;
      
      // Coin multiplier upgrade
      const multiplierBtn = document.getElementById('upgrade-multiplier');
      const multiplierLevel = this.game.coinMultiplierLevel || 0;
      multiplierBtn.disabled = this.game.coins < GAME_CONFIG.coinMultiplierCost || multiplierLevel >= GAME_CONFIG.maxCoinMultiplierLevel;
      multiplierBtn.textContent = `Upgrade Coin Multiplier (Cost: ${GAME_CONFIG.coinMultiplierCost})`;
      
      // Auto-release upgrade
      const autoReleaseBtn = document.getElementById('upgrade-autorelease');
      autoReleaseBtn.disabled = this.game.coins < GAME_CONFIG.autoReleaseCost || this.game.autoReleaseEnabled;
      autoReleaseBtn.textContent = `Unlock Auto-Release (Cost: ${GAME_CONFIG.autoReleaseCost})`;

      const mythicalBoosterBtn = document.getElementById('upgrade-mythicalbooster');
      mythicalBoosterBtn.disabled = this.game.coins < this.game.getMythicalBoosterCost();
  }
  
  updatePokeballStatus() {
      // Great Ball status
      const greatBallStatus = document.getElementById('greatball-status');
      const greatBallBtn = document.getElementById('upgrade-greatball');
      
      if (this.game.pokeBalls && this.game.pokeBalls.greatBall) {
      greatBallStatus.textContent = 'Active';
      greatBallStatus.classList.add('active-bonus');
      greatBallBtn.disabled = true;
      } else {
      greatBallStatus.textContent = 'Inactive';
      greatBallStatus.classList.remove('active-bonus');
      greatBallBtn.disabled = this.game.coins < GAME_CONFIG.pokeBallUpgrades.greatBall.cost || 
                              this.game.currentGen < GAME_CONFIG.pokeBallUpgrades.greatBall.unlockGen;
      }
      
      // Ultra Ball status
      const ultraBallStatus = document.getElementById('ultraball-status');
      const ultraBallBtn = document.getElementById('upgrade-ultraball');
      
      if (this.game.pokeBalls && this.game.pokeBalls.ultraBall) {
      ultraBallStatus.textContent = 'Active';
      ultraBallStatus.classList.add('active-bonus');
      ultraBallBtn.disabled = true;
      } else {
      ultraBallStatus.textContent = 'Inactive';
      ultraBallStatus.classList.remove('active-bonus');
      ultraBallBtn.disabled = this.game.coins < GAME_CONFIG.pokeBallUpgrades.ultraBall.cost || 
                              this.game.currentGen < GAME_CONFIG.pokeBallUpgrades.ultraBall.unlockGen;
      }
      
      // Master Ball status
      const masterBallStatus = document.getElementById('masterball-status');
      const masterBallBtn = document.getElementById('upgrade-masterball');
      
      if (this.game.pokeBalls && this.game.pokeBalls.masterBall) {
      masterBallStatus.textContent = 'Active';
      masterBallStatus.classList.add('active-bonus');
      masterBallBtn.disabled = true;
      } else {
      masterBallStatus.textContent = 'Inactive';
      masterBallStatus.classList.remove('active-bonus');
      masterBallBtn.disabled = this.game.coins < GAME_CONFIG.pokeBallUpgrades.masterBall.cost || 
                              this.game.currentGen < GAME_CONFIG.pokeBallUpgrades.masterBall.unlockGen;
      }
  }
  
  updateGenMasteryStatus() {
      // Update the generation mastery status for each generation
      for (let gen = 1; gen <= 5; gen++) {
      const genMasteryElement = document.getElementById(`gen${gen}-mastery`);
      if (this.game.genMastery && this.game.genMastery[gen]) {
          genMasteryElement.textContent = 'Mastered (2x coins)';
          genMasteryElement.classList.add('active-bonus');
      } else {
          genMasteryElement.textContent = 'Not Mastered';
          genMasteryElement.classList.remove('active-bonus');
      }
      }
  }
  
  // Show generation mastery notification
  showGenMasteryComplete(gen) {
      const banner = document.createElement('div');
      banner.classList.add('gen-complete');
      banner.innerHTML = `
      <h3>Generation ${gen} Mastered!</h3>
      <p>You've caught every Pokémon from Generation ${gen}!</p>
      <p>You now earn 2x coins for all Generation ${gen} Pokémon!</p>
      `;
      
      // Insert after the pokemon-card
      const pokemonCard = document.getElementById('pokemon-container');
      pokemonCard.parentNode.insertBefore(banner, pokemonCard.nextSibling);
      
      // Remove after 10 seconds
      setTimeout(() => {
      if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
      }
      }, 10000);
  }
  
  renderPokedex(sortBy = 'rarity') {
    const pokedexContainer = document.getElementById('pokedex');
    pokedexContainer.innerHTML = '';
    this.currentSortBy = sortBy;
    
    // Get the correct collection based on current mode
    const collection = this.game.getCurrentCollection();
    
    // Sort the collection
    const sortedPokemon = this.game.sortPokemon(sortBy);
    
    // Update mode indicator in UI
    document.getElementById('dex-mode-indicator').textContent = 
      this.game.isDexShinyMode ? 'Shiny Pokédex' : 'Normal Pokédex';
    
    sortedPokemon.forEach(pokemon => {
      this.fetchAndRenderPokemon(pokemon, pokedexContainer, this.game.isDexShinyMode);
    });
  }
  
  fetchAndRenderPokemon(pokemon, container, isShinyMode = false) {
    // Check if we have cached data for this Pokémon
    if (this.pokemonCache.has(pokemon.name.toLowerCase())) {
      const cachedData = this.pokemonCache.get(pokemon.name.toLowerCase());
      this.renderPokemonEntry(pokemon, cachedData, container, isShinyMode);
      return;
    }
    
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`)
      .then(response => response.json())
      .then(data => {
        // Cache the Pokémon data
        this.pokemonCache.set(pokemon.name.toLowerCase(), data);
        this.renderPokemonEntry(pokemon, data, container, isShinyMode);
      })
      .catch(error => {
        console.error(`Error fetching Pokémon ${pokemon.name}:`, error);
      });
  }
  
  renderPokemonEntry(pokemon, apiData, container, isShinyMode = false) {
    // Choose normal or shiny sprite based on mode
    const img = isShinyMode ? 
      (apiData.sprites.front_shiny || apiData.sprites.front_default) : 
      apiData.sprites.front_default;
    
    const entry = document.createElement('div');
    entry.classList.add('poke-entry');
    if (isShinyMode) entry.classList.add('shiny-entry');
    entry.id = `poke-${pokemon.name.toLowerCase()}${isShinyMode ? '-shiny' : ''}`;
    
    // Build type badges HTML
    const typeHtml = pokemon.types.map(type => 
      `<span class="type-badge" style="background-color: ${TYPE_COLORS[type] || '#999'}">${type}</span>`
    ).join('');
    
    entry.innerHTML = `
      ${pokemon.count > 1 ? `<div class="pokemon-counter">${pokemon.count}x</div>` : ''}
      <div class="gen-badge">Gen ${pokemon.gen}</div>
      <p>${pokemon.name}</p>
      <img src="${img}" alt="${pokemon.name}${isShinyMode ? ' Shiny' : ''}">
      <div class="rarity ${pokemon.rarity}">${pokemon.rarity}</div>
      <div class="types">${typeHtml}</div>
    `;
    
    container.appendChild(entry);
  }
  
  // Update a single Pokémon entry without re-rendering the entire Pokédex
  updatePokemonEntry(pokemon) {
    const existingEntry = document.getElementById(`poke-${pokemon.name.toLowerCase()}`);
    
    if (existingEntry) {
      // Just update the counter
      const counterElement = existingEntry.querySelector('.pokemon-counter');
      if (pokemon.count > 1) {
        if (counterElement) {
          counterElement.textContent = `${pokemon.count}x`;
        } else {
          const counter = document.createElement('div');
          counter.classList.add('pokemon-counter');
          counter.textContent = `${pokemon.count}x`;
          existingEntry.appendChild(counter);
        }
      }
    } else {
      // It's a new Pokémon, add it to the Pokédex
      // But we need to respect the current sort order
      const sortedPokemon = this.game.sortPokemon(this.currentSortBy);
      const pokedexContainer = document.getElementById('pokedex');
      
      this.renderPokedex(this.currentSortBy);
    }
  }
  
  displayCatchResults(results) {
    const pokemonContainer = document.getElementById('pokemon-container');
    
    if (results.length === 1) {
      // Single catch display
      const result = results[0];
      if (!result.caught) {
        pokemonContainer.innerHTML = `
          <p>You encountered a <strong>${result.error ? 'mysterious' : result.rarity}</strong> Pokémon... but it escaped!</p>
        `;
        // Remove shiny class if it exists
        pokemonContainer.classList.remove('shiny-catch');
        return;
      }
      
      // Add or remove shiny class based on whether it's shiny
      if (result.isShiny) {
        pokemonContainer.classList.add('shiny-catch');
      } else {
        pokemonContainer.classList.remove('shiny-catch');
      }

      const shinyText = result.isShiny ? '<span class="shiny-label">✨ SHINY ✨</span>' : '';
      
      pokemonContainer.innerHTML = `
        <h3>You caught: ${result.name} ${shinyText}</h3>
        <img src="${result.img}" alt="${result.name}"/>
        <div class="rarity ${result.rarity}">${result.rarity}</div>
        <div class="types">
          ${result.types.map(type => 
            `<span class="type-badge" style="background-color: ${TYPE_COLORS[type] || '#999'}">${type}</span>`
          ).join('')}
        </div>
        ${result.autoReleased ? 
          `<p class="auto-released-text">Auto-released for ${GAME_CONFIG.autoReleaseValue[result.rarity.toLowerCase()]} extra coins!</p>` : 
          (result.isDuplicate ? 
            `<p>This is a duplicate${result.isShiny ? ' shiny' : ''}!</p>` : 
            `<p>New ${result.isShiny ? 'shiny ' : ''}Pokémon added to Pokédex!</p>`)}
        <p>You earned ${result.coinsEarned} coins!</p>
      `;
      
      // Update the specific Pokémon in the Pokédex if not auto-released
      if (result.caught && !result.autoReleased) {
        // If it's a shiny, update the shiny collection
        if (result.isShiny) {
          // Safely check if shinyPokemonCollection exists before using it
          if (this.game.shinyPokemonCollection && this.game.shinyPokemonCollection.has(result.name)) {
            this.updatePokemonEntry({
              name: result.name,
              count: this.game.shinyPokemonCollection.get(result.name).count,
              gen: result.generation,
              types: result.types,
              rarity: result.rarity
            }, true);
          } else {
            // This might be the first shiny of this Pokémon
            this.updatePokemonEntry({
              name: result.name,
              count: 1,
              gen: result.generation,
              types: result.types,
              rarity: result.rarity
            }, true);
          }
        } else {
          // Update normal collection
          if (this.game.pokemonCollection && this.game.pokemonCollection.has(result.name)) {
            this.updatePokemonEntry({
              name: result.name,
              count: this.game.pokemonCollection.get(result.name).count,
              gen: result.generation,
              types: result.types,
              rarity: result.rarity
            });
          }
        }
      }
    } else {
      // Multi-catch display
      let html = `<div class="pokemon-multi-catch">`;
      
      results.forEach(result => {
        if (!result.caught) {
          html += `
            <div class="catch-item">
              <p>A ${result.error ? 'mysterious' : result.rarity} Pokémon escaped!</p>
            </div>
          `;
        } else {
          // Add shiny class and indicator for multi-catch display
          const shinyClass = result.isShiny ? 'shiny-pokemon' : '';
          const shinyText = result.isShiny ? '<span class="shiny-label-small">✨</span>' : '';
          
          html += `
            <div class="catch-item ${result.autoReleased ? 'auto-released' : ''} ${result.isShiny ? 'shiny-catch' : ''}">
              <h4>${result.name} ${shinyText}</h4>
              <img src="${result.img}" alt="${result.name}" class="${shinyClass}" style="width: 60px; height: 60px;">
              <div class="rarity ${result.rarity}">${result.rarity}</div>
              ${result.autoReleased ? 
                `<small class="auto-released-text">Auto-released (+${GAME_CONFIG.autoReleaseValue[result.rarity.toLowerCase()]} coins)</small>` : 
                (result.isDuplicate ? 
                  `<small>Duplicate${result.isShiny ? ' Shiny' : ''}</small>` : 
                  `<small>${result.isShiny ? 'New Shiny!' : 'New!'}</small>`)}
              <small>+${result.coinsEarned} coins</small>
            </div>
          `;
          
          // Update each caught Pokémon in the Pokédex if not auto-released
          if (!result.autoReleased) {
            if (result.isShiny) {
              // Use the correct variable name shinyPokemonCollection
              if (this.game.shinyPokemonCollection && this.game.shinyPokemonCollection.has(result.name)) {
                this.updatePokemonEntry({
                  name: result.name,
                  count: this.game.shinyPokemonCollection.get(result.name).count,
                  gen: result.generation,
                  types: result.types,
                  rarity: result.rarity
                }, true);
              } else {
                // This might be the first shiny of this type
                this.updatePokemonEntry({
                  name: result.name,
                  count: 1,
                  gen: result.generation,
                  types: result.types,
                  rarity: result.rarity
                }, true);
              }
            } else {
              // Update normal collection
              if (this.game.pokemonCollection && this.game.pokemonCollection.has(result.name)) {
                this.updatePokemonEntry({
                  name: result.name,
                  count: this.game.pokemonCollection.get(result.name).count,
                  gen: result.generation,
                  types: result.types,
                  rarity: result.rarity
                });
              }
            }
          }
        }
      });
      
      html += `</div>`;
      pokemonContainer.innerHTML = html;
    }
  }
  
  showGenerationComplete(generation) {
    const banner = document.createElement('div');
    banner.classList.add('gen-complete');
    banner.innerHTML = `
      <h3>Generation ${generation} Complete!</h3>
      <p>You've caught all Pokémon from Generation ${generation}!</p>
      <p>Now you can catch Generation ${generation + 1} Pokémon!</p>
      <p>You can now catch ${Math.min(generation + 1, 3)} Pokémon at once!</p>
    `;
    
    // Insert after the pokemon-card
    const pokemonCard = document.getElementById('pokemon-container');
    pokemonCard.parentNode.insertBefore(banner, pokemonCard.nextSibling);
    
    // Remove after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 10000);
  }
  
  restartGameLoop() {
    if (this.game.intervalId) {
      clearInterval(this.game.intervalId);
    }
    this.startGameLoop();
  }
  
  startGameLoop() {
    this.game.intervalId = setInterval(async () => {
      const results = await this.game.catchPokemon();
      this.displayCatchResults(results);
      this.updateStats();
      
      // Check if we just completed a generation
      if (this.game.checkGenerationCompletion()) {
          this.showGenerationComplete(this.game.currentGen - 1);
      }
      
      // Check for newly achieved generation mastery
      for (let gen = 1; gen <= this.game.currentGen; gen++) {
          if (this.game.checkGenMastery(gen)) {
          this.showGenMasteryComplete(gen);
          }
      }
    }, this.game.catchInterval);
  }

  setupCollapsibleSections() {
      // Only apply collapsible functionality on mobile
      if (window.innerWidth > 768) return;
      
      // Sections to make collapsible
      const sections = [
          { title: 'Basic Upgrades', id: 'upgrades' },
          { title: 'Poké Ball Upgrades', id: 'poke-balls' },
          { title: 'Generation Mastery', id: 'gen-mastery' }
      ];
      
      sections.forEach((section, index) => {
          const container = document.querySelector(`.${section.id}`);
          if (!container) return;
          
          // Get the heading
          const heading = container.querySelector('h3');
          if (!heading) return;
          
          // Make heading clickable
          heading.style.cursor = 'pointer';
          heading.style.position = 'relative';
          heading.style.paddingRight = '20px';
          
          // Add indicator (+ or -)
          const indicator = document.createElement('span');
          indicator.style.position = 'absolute';
          indicator.style.right = '5px';
          indicator.style.fontWeight = 'bold';
          indicator.textContent = index === 0 ? '-' : '+';
          heading.appendChild(indicator);
          
          // Get all content elements after the heading
          const contentElements = [];
          let el = heading.nextElementSibling;
          while (el) {
              contentElements.push(el);
              el = el.nextElementSibling;
          }
          
          // Create a wrapper for the content
          const contentWrapper = document.createElement('div');
          contentWrapper.style.display = index === 0 ? 'block' : 'none';
          
          // Move elements into the wrapper
          contentElements.forEach(element => {
              contentWrapper.appendChild(element);
          });
          
          // Add the wrapper after the heading
          heading.parentNode.insertBefore(contentWrapper, heading.nextSibling);
          
          // Add click handler to toggle visibility
          heading.addEventListener('click', function() {
              if (contentWrapper.style.display === 'none') {
                  contentWrapper.style.display = 'block';
                  indicator.textContent = '-';
              } else {
                  contentWrapper.style.display = 'none';
                  indicator.textContent = '+';
              }
          });
      });
      
      // Listen for resize and revert to normal view on desktop
      window.addEventListener('resize', function() {
          if (window.innerWidth > 768) {
              sections.forEach(section => {
                  const container = document.querySelector(`.${section.id}`);
                  if (!container) return;
                  
                  const contentWrappers = container.querySelectorAll('div');
                  contentWrappers.forEach(wrapper => {
                      wrapper.style.display = 'block';
                  });
              });
          }
      });
  }

  updateCatchRateUI() {
    // Calculate the different bonus components
    const qualityBonus = this.game.qualityLevel ? this.game.qualityLevel * GAME_CONFIG.qualityUpgradeAmount : 0;
    
    let pokeballBonus = 0;
    if (this.game.pokeBalls) {
      if (this.game.pokeBalls.greatBall) pokeballBonus += GAME_CONFIG.pokeBallUpgrades.greatBall.bonus;
      if (this.game.pokeBalls.ultraBall) pokeballBonus += GAME_CONFIG.pokeBallUpgrades.ultraBall.bonus;
      if (this.game.pokeBalls.masterBall) pokeballBonus += GAME_CONFIG.pokeBallUpgrades.masterBall.bonus;
    }
    
    const totalBonus = this.game.getCatchRateBonus();
    const MythBonus = this.game.getMythicalBoosterBonus();
    
    // Update the UI elements
    document.getElementById('quality-bonus').textContent = `${(qualityBonus * 100).toFixed(0)}%`;
    document.getElementById('pokeball-bonus').textContent = `${(pokeballBonus * 100).toFixed(0)}%`;
    document.getElementById('total-bonus').textContent = `${(totalBonus * 100).toFixed(0)}%`;
    document.getElementById('mythical-bonus').textContent = `${(MythBonus * 100).toFixed(0)}%`;
    
    // Update the progress bar
    const catchRateBar = document.getElementById('catch-rate-bar');
    const catchRateValue = document.getElementById('catch-rate-value');
    
    // Set the width of the bar (max at 100%)
    const barWidth = Math.min(totalBonus * 100, 100);
    catchRateBar.style.width = `${barWidth}%`;
    catchRateValue.textContent = `${(totalBonus * 100).toFixed(0)}%`;
    
    // Change color based on the bonus amount
    if (totalBonus >= 0.75) {
      catchRateBar.style.backgroundColor = '#68d391'; // Green for high bonus
    } else if (totalBonus >= 0.4) {
      catchRateBar.style.backgroundColor = '#ffae00'; // Yellow/Orange for medium bonus
    } else {
      catchRateBar.style.backgroundColor = '#ff7b00'; // Orange for low bonus
    }
  }
}