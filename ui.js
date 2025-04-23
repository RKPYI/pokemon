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
      
      // Set up event listeners
      document.getElementById('upgrade-speed').addEventListener('click', () => {
        if (this.game.upgradeSpeed()) {
          this.updateStats();
          this.restartGameLoop();
        }
      });
      
      document.getElementById('sort-by').addEventListener('change', (e) => {
        this.currentSortBy = e.target.value;
        this.renderPokedex(this.currentSortBy);
      });
    }
    
    updateStats() {
      // Update player stats in UI
      document.getElementById('coins').textContent = this.game.coins;
      document.getElementById('total-caught').textContent = this.game.totalCaught;
      document.getElementById('catch-speed').textContent = (this.game.catchInterval / 1000).toFixed(1);
      document.getElementById('catch-amount').textContent = this.game.catchAmount;
      document.getElementById('current-gen').textContent = this.game.currentGen;
      
      // Update Pokédex progress
      const stats = this.game.getPokedexStats();
      document.getElementById('pokedex-progress').textContent = `(${stats.caught}/${stats.total})`;
      
      // Update upgrade button state
      const upgradeBtn = document.getElementById('upgrade-speed');
      if (this.game.coins < GAME_CONFIG.upgradeCost || this.game.catchInterval <= GAME_CONFIG.minCatchInterval) {
        upgradeBtn.disabled = true;
      } else {
        upgradeBtn.disabled = false;
      }
    }
    
    renderPokedex(sortBy = 'rarity') {
      const pokedexContainer = document.getElementById('pokedex');
      pokedexContainer.innerHTML = '';
      this.currentSortBy = sortBy;
      
      const sortedPokemon = this.game.sortPokemon(sortBy);
      
      sortedPokemon.forEach(pokemon => {
        this.fetchAndRenderPokemon(pokemon, pokedexContainer);
      });
    }
    
    fetchAndRenderPokemon(pokemon, container) {
      // Check if we have cached data for this Pokémon
      if (this.pokemonCache.has(pokemon.name.toLowerCase())) {
        const cachedData = this.pokemonCache.get(pokemon.name.toLowerCase());
        this.renderPokemonEntry(pokemon, cachedData, container);
        return;
      }
      
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
          // Cache the Pokémon data
          this.pokemonCache.set(pokemon.name.toLowerCase(), data);
          this.renderPokemonEntry(pokemon, data, container);
        })
        .catch(error => {
          console.error(`Error fetching Pokémon ${pokemon.name}:`, error);
        });
    }
    
    renderPokemonEntry(pokemon, apiData, container) {
      const img = apiData.sprites.front_default;
      const entry = document.createElement('div');
      entry.classList.add('poke-entry');
      entry.id = `poke-${pokemon.name.toLowerCase()}`;
      
      // Build type badges HTML
      const typeHtml = pokemon.types.map(type => 
        `<span class="type-badge" style="background-color: ${TYPE_COLORS[type] || '#999'}">${type}</span>`
      ).join('');
      
      entry.innerHTML = `
        ${pokemon.count > 1 ? `<div class="pokemon-counter">${pokemon.count}x</div>` : ''}
        <div class="gen-badge">Gen ${pokemon.gen}</div>
        <p>${pokemon.name}</p>
        <img src="${img}" alt="${pokemon.name}">
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
        
        // Clear and rebuild if this is a new entry (rare case, only happens when first catching a Pokémon)
        // This ensures proper sort order
        if (this.game.uniquePokemonCount === 1 || this.currentSortBy !== 'rarity') {
          this.renderPokedex(this.currentSortBy);
        } else {
          // Just add the new entry
          this.fetchAndRenderPokemon(pokemon, pokedexContainer);
        }
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
            return;
            }
            
            pokemonContainer.innerHTML = `
            <h3>You caught: ${result.name}</h3>
            <img src="${result.img}" alt="${result.name}" />
            <div class="rarity ${result.rarity}">${result.rarity}</div>
            <div class="types">
                ${result.types.map(type => 
                `<span class="type-badge" style="background-color: ${TYPE_COLORS[type] || '#999'}">${type}</span>`
                ).join('')}
            </div>
            ${result.autoReleased ? 
                `<p class="auto-released-text">Auto-released for ${GAME_CONFIG.autoReleaseValue[result.rarity.toLowerCase()]} extra coins!</p>` : 
                (result.isDuplicate ? '<p>This is a duplicate!</p>' : '<p>New Pokémon added to Pokédex!</p>')}
            <p>You earned ${result.coinsEarned} coins!</p>
            `;
            
            // Update the specific Pokémon in the Pokédex if not auto-released
            if (result.caught && !result.autoReleased) {
            this.updatePokemonEntry({
                name: result.name,
                count: this.game.pokemonCollection.get(result.name).count,
                gen: result.generation,
                types: result.types,
                rarity: result.rarity
            });
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
                html += `
                <div class="catch-item ${result.autoReleased ? 'auto-released' : ''}">
                    <h4>${result.name}</h4>
                    <img src="${result.img}" alt="${result.name}" style="width: 60px; height: 60px;">
                    <div class="rarity ${result.rarity}">${result.rarity}</div>
                    ${result.autoReleased ? 
                    `<small class="auto-released-text">Auto-released (+${GAME_CONFIG.autoReleaseValue[result.rarity.toLowerCase()]} coins)</small>` : 
                    (result.isDuplicate ? '<small>Duplicate</small>' : '<small>New!</small>')}
                    <small>+${result.coinsEarned} coins</small>
                </div>
                `;
                
                // Update each caught Pokémon in the Pokédex if not auto-released
                if (!result.autoReleased) {
                this.updatePokemonEntry({
                    name: result.name,
                    count: this.game.pokemonCollection.get(result.name).count,
                    gen: result.generation,
                    types: result.types,
                    rarity: result.rarity
                });
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
        <p>You can now catch ${generation + 1} Pokémon at once!</p>
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
      }, this.game.catchInterval);
    }
  }