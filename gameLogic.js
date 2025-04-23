// Game logic and mechanics

class PokemonGame {
    constructor() {
      // Game state
      this.coins = GAME_CONFIG.initialCoins;
      this.catchInterval = GAME_CONFIG.initialCatchInterval;
      this.pokemonCollection = new Map(); // Map of name -> {count, gen, types, rarity}
      this.uniquePokemonCount = 0;
      this.totalCaught = 0;
      this.currentGen = 1;
      this.catchAmount = 1;
      this.intervalId = null;
      
      // Load saved data
      this.loadGame();
    }
    
    // Game save/load methods
    saveGame() {
      // Convert Map to Object for localStorage
      const collectionObj = {};
      this.pokemonCollection.forEach((data, name) => {
        collectionObj[name] = data;
      });
      
      const gameData = {
        coins: this.coins,
        catchInterval: this.catchInterval,
        pokemonCollection: collectionObj,
        uniquePokemonCount: this.uniquePokemonCount,
        totalCaught: this.totalCaught,
        currentGen: this.currentGen,
        catchAmount: this.catchAmount
      };
      
      localStorage.setItem("idlePokemonGame", JSON.stringify(gameData));
    }
    
    loadGame() {
      try {
        const savedData = localStorage.getItem("idlePokemonGame");
        if (savedData) {
          const gameData = JSON.parse(savedData);
          
          this.coins = gameData.coins || GAME_CONFIG.initialCoins;
          this.catchInterval = gameData.catchInterval || GAME_CONFIG.initialCatchInterval;
          this.uniquePokemonCount = gameData.uniquePokemonCount || 0;
          this.totalCaught = gameData.totalCaught || 0;
          this.currentGen = gameData.currentGen || 1;
          this.catchAmount = gameData.catchAmount || 1;
          
          // Load Pokemon collection
          if (gameData.pokemonCollection) {
            Object.keys(gameData.pokemonCollection).forEach(name => {
              this.pokemonCollection.set(name, gameData.pokemonCollection[name]);
            });
          }
        }
      } catch (e) {
        console.error("Error loading saved game:", e);
      }
    }
    
    // Game mechanics
    getRarityByType(types, name) {
      // Check for legendary by name first
      if (LEGENDARY_POKEMON.has(name.toLowerCase())) return "legendary";
      
      // Check types for rarity
      for (let type of types) {
        if (TYPE_RARITY.legendary.includes(type)) return "legendary";
      }
      for (let type of types) {
        if (TYPE_RARITY.rare.includes(type)) return "rare";
      }
      
      return "common";
    }
    
    getMissChance(rarity) {
      if (rarity === 'common') return 0.1;      // 10% miss chance
      if (rarity === 'rare') return 0.5;        // 50% miss chance
      if (rarity === 'legendary') return 0.8;   // 80% miss chance
      return 0;
    }
    
    getPokemonGeneration(id) {
      if (id <= GENERATIONS[1].end) return 1;
      if (id <= GENERATIONS[2].end) return 2;
      if (id <= GENERATIONS[3].end) return 3;
      return 1; // Default to Gen 1 if ID is out of range
    }
    
    getRandomPokemonId() {
      // Choose from available generations based on progress
      let maxGen = this.currentGen;
      let minId = GENERATIONS[1].start;
      let maxId = GENERATIONS[maxGen].end;
      
      return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    }
    
    upgradeSpeed() {
      if (this.coins >= GAME_CONFIG.upgradeCost && this.catchInterval > GAME_CONFIG.minCatchInterval) {
        this.coins -= GAME_CONFIG.upgradeCost;
        this.catchInterval -= GAME_CONFIG.upgradeSpeedDecrease;
        this.saveGame();
        return true;
      }
      return false;
    }
    
// Game logic and mechanics - Only showing the updated catchPokemon function

    async catchPokemon() {
        const results = [];
        const pokemonPromises = [];
        
        // Create all fetch promises at once
        for (let i = 0; i < this.catchAmount; i++) {
        const id = this.getRandomPokemonId();
        pokemonPromises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(res => res.json())
            .catch(error => {
            console.error(`Error fetching Pokémon #${id}:`, error);
            return { error: true, id: id };
            }));
        }
        
        // Wait for all fetch operations to complete in parallel
        const pokemonData = await Promise.all(pokemonPromises);
        
        // Process catch results
        pokemonData.forEach(data => {
        if (data.error) {
            results.push({
            caught: false,
            error: true
            });
            return;
        }
        
        const name = data.name.toUpperCase();
        const types = data.types.map(type => type.type.name);
        const generation = this.getPokemonGeneration(data.id);
        const rarity = this.getRarityByType(types, name);
        const missChance = this.getMissChance(rarity);
        
        // Miss logic
        if (Math.random() < missChance) {
            results.push({
            caught: false,
            rarity: rarity
            });
            return;
        }
        
        // Success
        this.coins += GAME_CONFIG.catchReward;
        this.totalCaught++;
        
        const img = data.sprites.front_default;
        
        // Check if this is a new Pokémon
        const isDuplicate = this.pokemonCollection.has(name);
        
        // Update collection
        if (isDuplicate) {
            const pokemonData = this.pokemonCollection.get(name);
            pokemonData.count++;
            this.pokemonCollection.set(name, pokemonData);
        } else {
            this.pokemonCollection.set(name, {
            count: 1,
            gen: generation,
            types: types,
            rarity: rarity,
            id: data.id
            });
            this.uniquePokemonCount++;
        }
        
        results.push({
            caught: true,
            name: name,
            img: img,
            types: types,
            rarity: rarity,
            isDuplicate: isDuplicate,
            generation: generation
        });
        });
        
        this.saveGame();
        this.checkGenerationCompletion();
        
        return results;
    }
    
    checkGenerationCompletion() {
      // For each generation the player has access to
      for (let gen = 1; gen <= this.currentGen; gen++) {
        const genRange = GENERATIONS[gen];
        const pokemonInGenCount = genRange.end - genRange.start + 1;
        
        // Count how many we have from this generation
        let caughtInGen = 0;
        this.pokemonCollection.forEach((data) => {
          if (data.gen === gen) caughtInGen++;
        });
        
        // Check if we completed this generation and haven't unlocked next gen yet
        if (caughtInGen === pokemonInGenCount && gen === this.currentGen && gen < 3) {
          this.currentGen++;
          this.catchAmount = this.currentGen;
          this.saveGame();
          return true;
        }
      }
      return false;
    }
    
    getPokedexStats() {
      // Calculate total available based on the generations unlocked
      let totalAvailable = 0;
      for (let gen = 1; gen <= this.currentGen; gen++) {
        totalAvailable += GENERATIONS[gen].end - GENERATIONS[gen].start + 1;
      }
      
      return {
        caught: this.uniquePokemonCount,
        total: totalAvailable,
        percent: Math.round((this.uniquePokemonCount / totalAvailable) * 100)
      };
    }
    
    sortPokemon(sortBy) {
      // Convert collection to array for sorting
      const pokemonArray = Array.from(this.pokemonCollection, ([name, data]) => ({
        name: name,
        ...data
      }));
      
      switch(sortBy) {
        case 'rarity':
          // Sort by rarity (legendary > rare > common)
          const rarityOrder = { legendary: 0, rare: 1, common: 2 };
          return pokemonArray.sort((a, b) => 
            rarityOrder[a.rarity] - rarityOrder[b.rarity] || a.name.localeCompare(b.name)
          );
        
        case 'amount':
          // Sort by amount (highest to lowest)
          return pokemonArray.sort((a, b) => 
            b.count - a.count || a.name.localeCompare(b.name)
          );
        
        case 'gen':
          // Sort by generation, then ID
          return pokemonArray.sort((a, b) => 
            a.gen - b.gen || a.id - b.id
          );
        
        case 'type':
          // Sort by primary type
          return pokemonArray.sort((a, b) => 
            a.types[0].localeCompare(b.types[0]) || a.name.localeCompare(b.name)
          );
        
        default:
          return pokemonArray;
      }
    }
  }