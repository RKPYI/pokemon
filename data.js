// Pokemon data and game constants

// Generation ranges
const GENERATIONS = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 },
    6: { start: 650, end: 721 },
    7: { start: 722, end: 809 },
    8: { start: 810, end: 905 },
    9: { start: 906, end: 1025 } // As of Pokémon Scarlet & Violet + DLC
  };
  
  
  // Legendary Pokémon by name
  const LEGENDARY_POKEMON = new Set([
    // Gen 1
    "mewtwo", "articuno", "zapdos", "moltres", "mew",
    // Gen 2
    "entei", "raikou", "suicune", "lugia", "ho-oh", "celebi",
    // Gen 3
    "regirock", "regice", "registeel", "latias", "latios", "kyogre", "groudon", "rayquaza", "deoxys", "jirachi",
    // Gen 4
    "uxie", "mesprit", "azelf", "dialga", "palkia", "heatran", "regigigas", "giratina", "cresselia", "phione", "manaphy", "darkrai", "shaymin", "arceus",
    // Gen 5
    "cobalion", "terrakion", "virizion", "tornadus", "thundurus", "reshiram", "zekrom", "landorus", "kyurem", "keldeo", "meloetta", "genesect",
    // Gen 6
    "xerneas", "yveltal", "zygarde", "diancie", "hoopa", "volcanion",
    // Gen 7
    "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "type-null", "silvally", "cosmog", "cosmoem", "solgaleo", "lunala", "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "necrozma", "magearna", "marshadow", "zeraora", "meltan", "melmetal",
    // Gen 8
    "zacian", "zamazenta", "eternatus", "kubfu", "urshifu", "zarude", "regieleki", "regidrago", "glastrier", "spectrier", "calyrex",
    // Gen 9
    "wo-chien", "chien-pao", "ting-lu", "chi-yu", "koraidon", "miraidon", "walking-wake", "iron-leaves", "ogerpon", "terapagos"
  ]);

  // Mythical Pokémon by name
  const MYTHICAL_POKEMON = new Set([
    // Gen 1
    "mew",
    // Gen 2
    "celebi",
    // Gen 3
    "jirachi", "deoxys",
    // Gen 4
    "phione", "manaphy", "darkrai", "shaymin", "arceus",
    // Gen 5
    "victini", "keldeo", "meloetta", "genesect",
    // Gen 6
    "diancie", "hoopa", "volcanion",
    // Gen 7
    "magearna", "marshadow", "zeraora", "meltan", "melmetal",
    // Gen 8
    "zarude",
    // Gen 9
    "walking-wake", "iron-leaves"
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
    common: ["normal", "bug", "grass", "fire", "water", "electric", "flying", "poison", "ground", "rock", "ice", "steel"],
    rare: ["psychic", "ghost", "fairy", "dragon", "dark", "fighting"],
    legendary: [],
    mythical: []
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
      legendary: 10,
      mythical: 50
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