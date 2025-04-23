// Pokemon data and game constants

// Generation ranges
const GENERATIONS = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 }
  };
  
  // Legendary Pokémon by name
  const LEGENDARY_POKEMON = new Set([
    // Gen 1
    "mewtwo", "articuno", "zapdos", "moltres", "mew",
    // Gen 2
    "entei", "raikou", "suicune", "lugia", "ho-oh", "celebi",
    // Gen 3
    "regirock", "regice", "registeel", "latias", "latios", "kyogre", "groudon", "rayquaza", "deoxys", "jirachi"
  ]);
  
  // Type colors for badges
  const TYPE_COLORS = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dark: "#705848",
    dragon: "#7038F8",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
  };
    
  // Type rarity categorization
  const TYPE_RARITY = {
    common: ["normal", "bug", "grass", "fire", "water", "electric"],
    rare: ["flying", "poison", "ground", "rock", "fighting", "psychic", "ghost", "ice", "fairy"],
    legendary: ["dragon", "dark", "steel"]
  };
  
  // Game configuration
  const GAME_CONFIG = {
    initialCoins: 0,
    initialCatchInterval: 5000, // 5 seconds
    
    // Speed upgrade
    speedUpgradeCost: 10,
    upgradeSpeedDecrease: 500, // 0.5 seconds faster
    minCatchInterval: 1000, // Minimum 1 second
    
    // Catch quality upgrade
    qualityUpgradeCost: 25,
    qualityUpgradeAmount: 0.1, // 10% better chance per level
    maxQualityLevel: 5,
    
    // Coin multiplier upgrade
    coinMultiplierCost: 50,
    coinMultiplierIncrease: 1, // +1 coin per catch per level
    maxCoinMultiplierLevel: 5,
    
    // Auto-release upgrade
    autoReleaseCost: 100,
    autoReleaseValue: {
      common: 1,
      rare: 3,
      legendary: 10
    },
    
    // Poké Ball upgrades
    pokeBallUpgrades: {
      greatBall: {
        cost: 200,
        bonus: 0.15, // 15% better catch rate
        unlockGen: 1
      },
      ultraBall: {
        cost: 500,
        bonus: 0.3, // 30% better catch rate
        unlockGen: 2
      },
      masterBall: {
        cost: 1000,
        bonus: 0.5, // 50% better catch rate
        unlockGen: 3
      }
    },
    
    // Base values
    catchReward: 1, // Base coins per catch
    catchRateBonus: 0, // Initial catch rate bonus
  };