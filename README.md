# Idle Pokémon Catcher

## Overview
Idle Pokémon Catcher is a browser-based idle game where you automatically catch Pokémon, build your Pokédex, and upgrade your catching abilities. Collect Pokémon from different generations, earn coins, and work toward mastering each generation!

## Features

### Core Gameplay
- **Automatic Catching**: Passively catch Pokémon at regular intervals
- **Pokédex Collection**: Fill your Pokédex with Pokémon you've caught
- **Coin Economy**: Earn coins for catching Pokémon and use them for upgrades
- **Multiple Generations**: Start with Gen 1 and unlock more generations as you progress

### Player Stats
- Total Caught Pokémon
- Coins
- Catch Speed (time between catches)
- Catch Amount (Pokémon caught at once)
- Current Generation
- Quality Level (affects catch rates)
- Coin Multiplier
- Auto-Release Status

### Upgrades
#### Basic Upgrades
- **Catch Speed**: Reduce time between catches (down to 1 second minimum)
- **Catch Quality**: Increase catch rate by 10% per level (max level: 5)
- **Coin Multiplier**: Earn more coins per catch (max level: 5)
- **Auto-Release**: Automatically convert duplicates to coins (Common: 1, Rare: 3, Legendary: 10)

#### Poké Ball Upgrades
- **Great Ball**: +15% catch rate for all Pokémon
- **Ultra Ball**: +30% catch rate (unlocks in Gen 2)
- **Master Ball**: +50% catch rate (unlocks in Gen 3)

### Generation Mastery
- Complete a generation's Pokédex to earn 2x coins for all Pokémon in that generation
- Three generations available: Gen 1, Gen 2, and Gen 3

### Sorting Options
Sort your Pokédex collection by:
- Rarity
- Amount
- Generation
- Type

### Audio Features
- Catch sound effects
- Generation completion sounds
- Legendary encounter sounds
- Miss sounds
- Level up sounds
- Background theme music

## Technical Structure
The game consists of the following files:
- `index.html`: Main game interface
- `style.css`: Game styling
- `welcome.js`: Welcome screen logic
- `data.js`: Pokémon data and game constants
- `gameLogic.js`: Core game mechanics
- `ui.js`: User interface interactions
- `main.js`: Main game initialization and loop

## Getting Started
1. Clone or download the repository
2. Open `index.html` in your browser
3. Start catching Pokémon and building your collection!
4. or just click here! [https://rkpyi.github.io/pokemon/]

## Requirements
- Modern web browser with JavaScript enabled
- No server or special installation required

## Credits
- Pokémon images sourced from PokeAPI
- Pokémon is a trademark of Nintendo/Game Freak