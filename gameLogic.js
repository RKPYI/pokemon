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
          catchAmount: this.catchAmount,
          qualityLevel: this.qualityLevel || 0,
          coinMultiplierLevel: this.coinMultiplierLevel || 0,
          coinMultiplier: this.coinMultiplier || 1,
          catchRateBonus: this.catchRateBonus || 0,
          autoReleaseEnabled: this.autoReleaseEnabled || false,
          pokeBalls: this.pokeBalls || {},
          genMastery: this.genMastery || {},
          mythicalBoosterLevel: this.mythicalBoosterLevel || 0
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
            this.qualityLevel = gameData.qualityLevel || 0;
            this.coinMultiplierLevel = gameData.coinMultiplierLevel || 0;
            this.coinMultiplier = gameData.coinMultiplier || 1;
            this.catchRateBonus = gameData.catchRateBonus || 0;
            this.autoReleaseEnabled = gameData.autoReleaseEnabled || false;
            this.pokeBalls = gameData.pokeBalls || {};
            this.genMastery = gameData.genMastery || {};
            this.mythicalBoosterLevel = gameData.mythicalBoosterLevel || 0;
            
            // Load Pokemon collection
            if (gameData.pokemonCollection) {
              Object.keys(gameData.pokemonCollection).forEach(name => {
                this.pokemonCollection.set(name, gameData.pokemonCollection[name]);
              });
            }

            this.migrateTypeRarityData();
            
          }
        } catch (e) {
          console.error("Error loading saved game:", e);
        }
    }
      
    migrateTypeRarityData() {
      // Only proceed if we have Pokémon in the collection
      if (this.pokemonCollection.size === 0) return;
      
      console.log("Checking for type rarity migration needs...");
      let migrationCount = 0;
      
      // For each Pokémon in the collection
      this.pokemonCollection.forEach((data, name) => {
          // Skip if no types data
          if (!data.types || data.types.length === 0) return;
          
          // Calculate what the rarity should be based on current TYPE_RARITY
          const newRarity = this.getRarityByType(data.types, name);
          
          // If the rarity is different, update it
          if (data.rarity !== newRarity) {
              data.rarity = newRarity;
              migrationCount++;
          }
      });
      
      // Log the migration results
      if (migrationCount > 0) {
          console.log(`Updated rarity for ${migrationCount} Pokémon based on new type rarity settings.`);
          this.saveGame(); // Save the migrated data
      }
    }
    
    // Game mechanics
    getRarityByType(types, name) {
      // Check for legendary by name first
      if (MYTHICAL_POKEMON.has(name.toLowerCase())) return "mythical";
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
      if (rarity === 'mythical') return 0.8;   // 80% miss chance (can't be boosted)
      return 0;
    }
    
    getPokemonGeneration(id) {
      if (id <= GENERATIONS[1].end) return 1;
      if (id <= GENERATIONS[2].end) return 2;
      if (id <= GENERATIONS[3].end) return 3;
      if (id <= GENERATIONS[4].end) return 4;
      if (id <= GENERATIONS[5].end) return 5;
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
      if (this.coins >= GAME_CONFIG.speedUpgradeCost && this.catchInterval > GAME_CONFIG.minCatchInterval) {
        this.coins -= GAME_CONFIG.speedUpgradeCost;
        this.catchInterval -= GAME_CONFIG.upgradeSpeedDecrease;
        this.saveGame();
        return true;
      }
      return false;
    }
    
    // Game logic and mechanics - Only showing the updated catchPokemon function
    
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
        if (caughtInGen === pokemonInGenCount && gen === this.currentGen && gen < 5) {
          this.currentGen++;
          this.catchAmount = Math.min(this.currentGen, 3);
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
          const rarityOrder = { mythical: 0, legendary: 1, rare: 2, common: 3 };
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

    // Upgrade quality implementation
    upgradeQuality() {
        const cost = GAME_CONFIG.qualityUpgradeCost;
        const maxLevel = GAME_CONFIG.maxQualityLevel;
        
        // Check if we have current quality level data, if not initialize it
        if (!this.qualityLevel) this.qualityLevel = 0;
        
        // Check if we can upgrade
        if (this.coins >= cost && this.qualityLevel < maxLevel) {
        this.coins -= cost;
        this.qualityLevel++;
        this.catchRateBonus = this.qualityLevel * GAME_CONFIG.qualityUpgradeAmount;
        this.saveGame();
        return true;
        }
        return false;
    }
    
    // Upgrade coin multiplier implementation
    upgradeCoinMultiplier() {
        const cost = GAME_CONFIG.coinMultiplierCost;
        const maxLevel = GAME_CONFIG.maxCoinMultiplierLevel;
        
        // Check if we have current multiplier level data, if not initialize it
        if (!this.coinMultiplierLevel) this.coinMultiplierLevel = 0;
        
        // Check if we can upgrade
        if (this.coins >= cost && this.coinMultiplierLevel < maxLevel) {
        this.coins -= cost;
        this.coinMultiplierLevel++;
        this.coinMultiplier = 1 + (this.coinMultiplierLevel * GAME_CONFIG.coinMultiplierIncrease);
        this.saveGame();
        return true;
        }
        return false;
    }
    
    // Enable auto-release of duplicate Pokémon
    enableAutoRelease() {
        const cost = GAME_CONFIG.autoReleaseCost;
        
        // Check if we can enable
        if (this.coins >= cost && !this.autoReleaseEnabled) {
        this.coins -= cost;
        this.autoReleaseEnabled = true;
        this.saveGame();
        return true;
        }
        return false;
    }
    
    // Handle Pokeball upgrades
    upgradePokeBall(ballType) {
        const ballConfig = GAME_CONFIG.pokeBallUpgrades[ballType];
        
        // Check if the ball exists in config and if we have enough coins
        if (!ballConfig || this.coins < ballConfig.cost) {
        return false;
        }
        
        // Check if the generation requirement is met
        if (this.currentGen < ballConfig.unlockGen) {
        return false;
        }
        
        // Check if we already have this ball
        if (!this.pokeBalls) {
        this.pokeBalls = {};
        }
        
        if (this.pokeBalls[ballType]) {
        return false; // Already have this ball
        }
        
        // Purchase the ball
        this.coins -= ballConfig.cost;
        this.pokeBalls[ballType] = true;
        this.saveGame();
        return true;
    }
    
    // Get total catch rate bonus from all sources
    getCatchRateBonus() {
        let bonus = this.catchRateBonus || 0;
        
        // Add Pokeball bonuses if available
        if (this.pokeBalls) {
        if (this.pokeBalls.greatBall) bonus += GAME_CONFIG.pokeBallUpgrades.greatBall.bonus;
        if (this.pokeBalls.ultraBall) bonus += GAME_CONFIG.pokeBallUpgrades.ultraBall.bonus;
        if (this.pokeBalls.masterBall) bonus += GAME_CONFIG.pokeBallUpgrades.masterBall.bonus;
        }
        
        return bonus;
    }

    upgradeMythicalBooster() {
      // Initialize booster level if not exists
      if (!this.mythicalBoosterLevel) this.mythicalBoosterLevel = 0;
      
      // Calculate current upgrade cost
      const baseCost = GAME_CONFIG.mythicalBoosterConfig.baseCost;
      const costMultiplier = GAME_CONFIG.mythicalBoosterConfig.costMultiplier;
      const currentCost = Math.floor(baseCost * Math.pow(costMultiplier, this.mythicalBoosterLevel));
      
      // Check if player can afford it
      if (this.coins >= currentCost) {
        this.coins -= currentCost;
        this.mythicalBoosterLevel++;
        this.saveGame();
        return true;
      }
      return false;
    }
    
    // Calculate next mythical booster upgrade cost
    getMythicalBoosterCost() {
      if (!this.mythicalBoosterLevel) this.mythicalBoosterLevel = 0;
      
      const baseCost = GAME_CONFIG.mythicalBoosterConfig.baseCost;
      const costMultiplier = GAME_CONFIG.mythicalBoosterConfig.costMultiplier;
      return Math.floor(baseCost * Math.pow(costMultiplier, this.mythicalBoosterLevel));
    }
    
    getMythicalBoosterBonus() {
      if (!this.mythicalBoosterLevel) return 0;
      
      return this.mythicalBoosterLevel * GAME_CONFIG.mythicalBoosterConfig.bonusPerLevel;
    }
    
    // Check generation mastery
    checkGenMastery(gen) {
        if (!this.genMastery) this.genMastery = {};
        
        const genRange = GENERATIONS[gen];
        const pokemonInGenCount = genRange.end - genRange.start + 1;
        
        // Count how many we have from this generation
        let caughtInGen = 0;
        this.pokemonCollection.forEach((data) => {
        if (data.gen === gen) caughtInGen++;
        });
        
        // If we caught all Pokémon in this generation, mark it as mastered
        if (caughtInGen === pokemonInGenCount && !this.genMastery[gen]) {
        this.genMastery[gen] = true;
        this.saveGame();
        return true;
        }
        
        return false;
    }
    
    // Get coin bonus for a specific generation based on mastery
    getGenMasteryBonus(gen) {
        if (this.genMastery && this.genMastery[gen]) {
        return 2; // 2x coins for mastered generations
        }
        return 1;
    }
    
    // Calculate coins earned for a catch with all bonuses
    calculateCoinReward(rarity, generation) {
        // Base reward
        let coins = GAME_CONFIG.catchReward;
        
        // Apply rarity bonus
        if (rarity === 'rare') coins *= 2;
        if (rarity === 'legendary') coins *= 5;
        
        // Apply coin multiplier if available
        if (this.coinMultiplier) {
        coins *= this.coinMultiplier;
        }
        
        // Apply generation mastery bonus if available
        coins *= this.getGenMasteryBonus(generation);
        
        return Math.round(coins);
    }
    
    // Modified catchPokemon method to include auto-release and coin calculations
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
        
        // Apply catch rate bonus to miss chance
        const missChance = Math.max(0, this.getMissChance(rarity) - this.getCatchRateBonus());
        
        // Miss logic
        if (rarity === "mythical") {
          const mythicalMissChance = Math.max(0, missChance - this.getMythicalBoosterBonus());

          if (Math.random() < mythicalMissChance) {
            results.push({
            caught: false,
            rarity: rarity
            });
            return;
          }
        } else {
          if (Math.random() < missChance) {
            results.push({
            caught: false,
            rarity: rarity
            });
            return;
          }
        }
        
        // Success - calculate coins earned
        const coinsEarned = this.calculateCoinReward(rarity, generation);
        let autoReleased = false;
        
        // Check for auto-release
        const isDuplicate = this.pokemonCollection.has(name);
        if (isDuplicate && this.autoReleaseEnabled) {
            // Auto-release for extra coins
            const extraCoins = GAME_CONFIG.autoReleaseValue[rarity.toLowerCase()];
            this.coins += coinsEarned + extraCoins;
            autoReleased = true;
        } else {
            // Normal catch
            this.coins += coinsEarned;
            
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
        }
        
        this.totalCaught++;
        const img = data.sprites.front_default;
        
        results.push({
            caught: true,
            name: name,
            img: img,
            types: types,
            rarity: rarity,
            isDuplicate: isDuplicate,
            generation: generation,
            coinsEarned: coinsEarned,
            autoReleased: autoReleased
        });
        });
        
        this.saveGame();
        
        // Check for generation mastery
        for (let gen = 1; gen <= this.currentGen; gen++) {
        this.checkGenMastery(gen);
        }
        
        return results;
    }
  }