// Game logic and mechanics

class PokemonGame {
  constructor() {
    // Game state
    this.coins = GAME_CONFIG.initialCoins;
    this.catchInterval = GAME_CONFIG.initialCatchInterval;
    this.pokemonCollection = new Map(); // Map of name -> {count, gen, types, rarity}
    this.shinyPokemonCollection = new Map(); // Map of name -> {count, gen, types, rarity}
    this.uniquePokemonCount = 0;
    this.uniqueShinyCount = 0;
    this.totalCaught = 0;
    this.totalShinyCaught = 0;
    this.currentGen = 1;
    this.catchAmount = 1;
    this.intervalId = null;
    this.rebirthLevel = 0; // Track rebirth level for shiny rate bonus
    this.isDexShinyMode = false; // Flag to toggle between normal and shiny Pokédex
    
    this.rebirthUpgrades = {
      permanentCatchSpeed: 0,
      permanentCoinBoost: 0,
      shinyBoost: 0
    };

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
      
      // Convert shiny Map to Object for localStorage
      const shinyCollectionObj = {};
      this.shinyPokemonCollection.forEach((data, name) => {
        shinyCollectionObj[name] = data;
      });
      
      const gameData = {
        coins: this.coins,
        catchInterval: this.catchInterval,
        pokemonCollection: collectionObj,
        shinyPokemonCollection: shinyCollectionObj,
        uniquePokemonCount: this.uniquePokemonCount,
        uniqueShinyCount: this.uniqueShinyCount,
        totalCaught: this.totalCaught,
        totalShinyCaught: this.totalShinyCaught,
        currentGen: this.currentGen,
        catchAmount: this.catchAmount,
        qualityLevel: this.qualityLevel || 0,
        coinMultiplierLevel: this.coinMultiplierLevel || 0,
        coinMultiplier: this.coinMultiplier || 1,
        catchRateBonus: this.catchRateBonus || 0,
        autoReleaseEnabled: this.autoReleaseEnabled || false,
        pokeBalls: this.pokeBalls || {},
        genMastery: this.genMastery || {},
        mythicalBoosterLevel: this.mythicalBoosterLevel || 0,
        rebirthLevel: this.rebirthLevel || 0,
        isDexShinyMode: this.isDexShinyMode || false,
        rebirthUpgrades: this.rebirthUpgrades
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
          this.uniqueShinyCount = gameData.uniqueShinyCount || 0;
          this.totalCaught = gameData.totalCaught || 0;
          this.totalShinyCaught = gameData.totalShinyCaught || 0;
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
          this.rebirthLevel = gameData.rebirthLevel || 0;
          this.isDexShinyMode = gameData.isDexShinyMode || false;
          this.rebirthUpgrades = gameData.rebirthUpgrades || {
            permanentCatchSpeed: 0,
            permanentCoinBoost: 0,
            shinyBoost: 0
          };
          
          // Load Pokemon collection
          if (gameData.pokemonCollection) {
            Object.keys(gameData.pokemonCollection).forEach(name => {
              this.pokemonCollection.set(name, gameData.pokemonCollection[name]);
            });
          }
          
          // Load Shiny Pokemon collection
          if (gameData.shinyPokemonCollection) {
            Object.keys(gameData.shinyPokemonCollection).forEach(name => {
              this.shinyPokemonCollection.set(name, gameData.shinyPokemonCollection[name]);
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
    
    // Also check shiny collection
    this.shinyPokemonCollection.forEach((data, name) => {
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
  
  // Toggle between normal and shiny Pokédex mode
  toggleDexMode() {
    this.isDexShinyMode = !this.isDexShinyMode;
    this.saveGame();
    return this.isDexShinyMode;
  }
  
  // Get the current Pokédex collection based on mode
  getCurrentCollection() {
    return this.isDexShinyMode ? this.shinyPokemonCollection : this.pokemonCollection;
  }
  
  // Get the appropriate Pokédex stats based on mode
  getPokedexStats() {
    // Calculate total available based on the generations unlocked
    let totalAvailable = 0;
    for (let gen = 1; gen <= this.currentGen; gen++) {
      totalAvailable += GENERATIONS[gen].end - GENERATIONS[gen].start + 1;
    }
    
    if (this.isDexShinyMode) {
      return {
        caught: this.uniqueShinyCount,
        total: totalAvailable,
        percent: Math.round((this.uniqueShinyCount / totalAvailable) * 100),
        isShiny: true
      };
    } else {
      return {
        caught: this.uniquePokemonCount,
        total: totalAvailable,
        percent: Math.round((this.uniquePokemonCount / totalAvailable) * 100),
        isShiny: false
      };
    }
  }
  
  // Calculate shiny chance
  getShinyChance() {
    let chance = GAME_CONFIG.shinyConfig.baseShinyRate + 
                (this.rebirthLevel * GAME_CONFIG.shinyConfig.shinyBonusPerRebirth);
    
    // Apply permanent shiny boost
    if (this.rebirthUpgrades && this.rebirthUpgrades.shinyBoost > 0) {
      chance += this.rebirthUpgrades.shinyBoost * 
               GAME_CONFIG.rebirthUpgrades.shinyBoost.effectPerLevel;
    }
    
    return chance;
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
    if (id <= GENERATIONS[6].end) return 6;
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
  
  // Game logic and mechanics
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
      if (caughtInGen === pokemonInGenCount && gen === this.currentGen && gen < (this.rebirthLevel+1) && gen < 6) {
        this.currentGen++;
        this.catchAmount = Math.min(this.currentGen, 3);
        this.saveGame();
        return true;
      }
    }
    return false;
  }
  
  sortPokemon(sortBy = 'rarity') {
    // Convert collection to array for sorting
    const currentCollection = this.getCurrentCollection();
    const pokemonArray = Array.from(currentCollection, ([name, data]) => ({
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
  calculateCoinReward(rarity, generation, isShiny) {
      // Base reward
      let coins = GAME_CONFIG.catchReward;
      
      // Apply rarity bonus
      if (rarity === 'rare') coins *= 2;
      if (rarity === 'legendary') coins *= 5;
      if (rarity === 'mythical') coins *= 10;
      
      // Apply shiny bonus if applicable
      if (isShiny) {
        coins *= GAME_CONFIG.shinyConfig.shinyCoinsMultiplier;
      }
      
      // Apply coin multiplier if available
      if (this.coinMultiplier) {
        coins *= this.coinMultiplier;
      }
      
      // Apply generation mastery bonus if available
      coins *= this.getGenMasteryBonus(generation);

      // Apply permanent coin boost from rebirth upgrades
      if (this.rebirthUpgrades && this.rebirthUpgrades.permanentCoinBoost > 0) {
        const coinBoost = this.rebirthUpgrades.permanentCoinBoost * 
                         GAME_CONFIG.rebirthUpgrades.permanentCoinBoost.effectPerLevel;
        coins *= (1 + coinBoost);
      }
      
      return Math.round(coins);
  }
  
  // Calculate auto-release coin value with bonuses
  calculateAutoReleaseValue(rarity, isShiny) {
    let value = GAME_CONFIG.autoReleaseValue[rarity.toLowerCase()] || 1;
    
    // Apply shiny bonus if applicable
    if (isShiny) {
      value *= GAME_CONFIG.shinyConfig.shinyAutoReleaseBonus;
    }
    
    return value;
  }
  
  // Modified catchPokemon method to include shiny chance, auto-release and coin calculations
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
        
        // Determine if this is a shiny encounter
        const isShiny = Math.random() < this.getShinyChance();
        
        // Apply catch rate bonus to miss chance
        const missChance = Math.max(0, this.getMissChance(rarity) - this.getCatchRateBonus());

        // Miss logic
        if (rarity === "mythical") {
          const mythicalMissChance = Math.max(0, this.getMissChance(rarity) - this.getMythicalBoosterBonus());

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
        const coinsEarned = this.calculateCoinReward(rarity, generation, isShiny);
        let autoReleased = false;
        
        // Check for auto-release - different logic for normal vs shiny
        const currentCollection = isShiny ? this.shinyPokemonCollection : this.pokemonCollection;
        const isDuplicate = currentCollection.has(name);
        
        if (isDuplicate && this.autoReleaseEnabled) {
          // Auto-release for extra coins
          const extraCoins = this.calculateAutoReleaseValue(rarity, isShiny);
          this.coins += coinsEarned + extraCoins;
          autoReleased = true;
        } else {
          // Normal catch
          this.coins += coinsEarned;
          
          // Update collection
          if (isDuplicate) {
            const pokemonData = currentCollection.get(name);
            pokemonData.count++;
            currentCollection.set(name, pokemonData);
          } else {
            currentCollection.set(name, {
              count: 1,
              gen: generation,
              types: types,
              rarity: rarity,
              id: data.id,
              isShiny: isShiny
            });
            
            // Update unique counter
            if (isShiny) {
              this.uniqueShinyCount++;
            } else {
              this.uniquePokemonCount++;
            }
          }
        }
        
        // Update total catch counters
        if (isShiny) {
          this.totalShinyCaught++;
        } else {
          this.totalCaught++;
        }
        
        // Get appropriate sprite based on shiny status
        const img = isShiny ? data.sprites.front_shiny : data.sprites.front_default;
        
        results.push({
          caught: true,
          name: name,
          img: img,
          types: types,
          rarity: rarity,
          isDuplicate: isDuplicate,
          generation: generation,
          coinsEarned: coinsEarned,
          autoReleased: autoReleased,
          isShiny: isShiny
        });
      });
      
      this.saveGame();
      
      // Check for generation mastery
      for (let gen = 1; gen <= this.currentGen; gen++) {
        this.checkGenMastery(gen);
      }
      
      return results;
  }

  checkRebirthUpgrade(upgradeType) {
    const upgradeConfig = GAME_CONFIG.rebirthUpgrades[upgradeType];
    
    // Check if upgrade exists
    if (!upgradeConfig) return false;
    
    // Check if player has required rebirth level
    if (this.rebirthLevel < upgradeConfig.rebirthRequired) return false;
    
    // Check if player has enough coins
    if (this.coins < upgradeConfig.cost) return false;
    
    // Check if upgrade is at max level
    if (this.rebirthUpgrades[upgradeType] >= upgradeConfig.maxLevel) return false;

    return true
  }

  purchaseRebirthUpgrade(upgradeType) {
    const upgradeConfig = GAME_CONFIG.rebirthUpgrades[upgradeType];
    
    if (!this.checkRebirthUpgrade(upgradeType)) {
      return false; // Upgrade not available
    }
    
    // Purchase upgrade
    this.coins -= upgradeConfig.cost;
    this.rebirthUpgrades[upgradeType]++;
    this.saveGame();
    return true;
  }
  
  rebirthEligibility() {
    if (!this.genMastery) this.genMastery = {};
    
    const requiredGenForRebirth = this.rebirthLevel + 1;
    if (!this.genMastery[requiredGenForRebirth]) {
      return false;
    } else {
      return true;
    }
  }
  // Rebirth system - reset game but keep some permanent bonuses
  rebirth() {
    if (!this.rebirthEligibility()) {
      return false;
    }
    
    // Increment rebirth level
    this.rebirthLevel = (this.rebirthLevel || 0) + 1;
    
    // Save current rebirth upgrades
    const savedRebirthUpgrades = {...this.rebirthUpgrades};

    // Reset game state but keep permanent bonuses
    this.coins = GAME_CONFIG.initialCoins;
    this.catchInterval = GAME_CONFIG.initialCatchInterval;
    this.pokemonCollection = new Map();
    this.uniquePokemonCount = 0;
    // this.totalCaught = 0; // keep total caught
    this.currentGen = 1;
    this.catchAmount = 1;
    this.qualityLevel = 0;
    this.coinMultiplierLevel = 0;
    this.coinMultiplier = 1;
    this.catchRateBonus = 0;
    this.autoReleaseEnabled = false;
    this.pokeBalls = {};
    this.genMastery = {};
    this.mythicalBoosterLevel = 0;

    // Restore rebirth upgrades
    this.rebirthUpgrades = savedRebirthUpgrades;
    
    // Keep shiny collection intact across rebirths
    // (we don't reset shinyPokemonCollection, uniqueShinyCount, or totalShinyCaught)
    
    this.saveGame();
    return true;
  }
}