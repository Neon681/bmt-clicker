# ⚡ BMT Clicker 💎

An epic incremental clicker game with stunning visuals and addictive gameplay. Experience the thrill of progression through beautiful zones, hire powerful heroes, and ascend to new heights of power!

## Features

### Core Gameplay
- **Click Combat**: Click to attack monsters and deal damage
- **Auto-Combat**: Hire heroes to automatically deal DPS
- **Zone Progression**: Progress through 20 iconic OSRS locations
- **Monster Variety**: Fight different monsters in each zone with boss encounters every 5th zone

### Epic Content & Features
- **Multiple Zones**: Progress through diverse and challenging locations
- **Variety of Monsters**: Fight unique creatures with escalating difficulty
- **15 Powerful Heroes**: Hire legendary characters with unique abilities and scaling
- **Stunning Visual Design**: Modern UI with beautiful gradients, animations, and effects
- **Advanced Progression**: Perfectly balanced incremental mechanics for endless gameplay

### Game Systems
- **Hero Management**: Hire and upgrade heroes to increase your DPS
- **Ascension System**: Reset your progress at Zone 100+ for permanent Hero Soul bonuses
- **Auto-Save**: Your progress is automatically saved every 30 seconds
- **Exponential Scaling**: Monster HP, gold rewards, and costs scale exponentially for endless gameplay

## Setup Instructions

### For XAMPP/Localhost Testing

1. **Install XAMPP** (if not already installed)
   - Download from [https://www.apachefriends.org/](https://www.apachefriends.org/)
   - Install and start the Apache server

2. **Copy Game Files**
   - Copy the entire `bmt-clicker` folder to your XAMPP `htdocs` directory
   - Default location: `C:\xampp\htdocs\` (Windows) or `/Applications/XAMPP/htdocs/` (Mac)

3. **Access the Game**
   - Open your web browser
   - Navigate to: `http://localhost/bmt-clicker/`
   - Experience the stunning visual design and addictive gameplay!

### Alternative Setup (Simple HTTP Server)

If you don't want to use XAMPP, you can use any simple HTTP server:

1. **Python 3** (if installed):
   ```bash
   cd bmt-clicker
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000`

2. **Node.js** (if installed):
   ```bash
   cd bmt-clicker
   npx serve .
   ```

## How to Play

### Getting Started
1. Click the "Attack!" button to deal damage to monsters
2. Kill monsters to earn gold
3. Use gold to hire and upgrade heroes
4. Heroes automatically deal DPS even when you're not clicking

### Progression
- **Zones**: Progress through zones by killing 10 monsters per zone
- **Monsters**: Each zone has 5 different monsters that cycle
- **Bosses**: Every 5th zone features a boss with 10x HP and gold reward
- **Heroes**: Unlock stronger heroes as you progress and earn more gold

### Hero System
- **Hiring**: Hire heroes with gold to start dealing automatic DPS
- **Upgrading**: Upgrade heroes to increase their DPS contribution
- **Cost Scaling**: Each upgrade costs more (7% increase per level)
- **Progressive Unlocks**: New heroes unlock as you can afford them

### Ascension (Late Game)
- **Requirement**: Reach Zone 100 to unlock ascension
- **Hero Souls**: Gain Hero Souls based on how far past Zone 100 you've progressed
- **Permanent Bonus**: Each Hero Soul provides +10% DPS bonus that persists through ascensions
- **Reset**: Ascension resets your progress but keeps Hero Soul bonuses

### Tips for Success
1. **Balance clicking and heroes**: Early game relies on clicking, late game on hero DPS
2. **Upgrade efficiently**: Focus on your highest DPS heroes first
3. **Don't rush ascension**: Go as far as possible before ascending for maximum Hero Souls
4. **Check back regularly**: The game continues to progress with hero DPS when you're away

## Game Mechanics

### Damage Calculation
- **Click Damage**: Base 1 + Hero Soul bonus (10% per soul)
- **Hero DPS**: Sum of all hired heroes' DPS + Hero Soul bonus
- **Boss Encounters**: 10x HP and gold every 5 zones

### Scaling Formulas
- **Monster HP**: 10 × 1.55^(zone-1)
- **Gold Reward**: 1.025^(zone-1)
- **Hero Cost**: baseCost × 1.07^level

### Save System
- **Auto-Save**: Every 30 seconds
- **Manual Save**: On page close/refresh
- **Local Storage**: Saves to browser's local storage
- **Cross-Session**: Progress persists between browser sessions

## File Structure
```
bmt-clicker/
├── index.html      # Main game interface with stunning design
├── game.js         # Advanced game logic and mechanics
├── styles.css      # Modern CSS with beautiful animations
└── README.md       # This file
```

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript**: ES6+ features used (classes, arrow functions, etc.)
- **Local Storage**: Required for save/load functionality

## Recent Enhancements (Version 2.0)
- **🎨 Stunning Visual Redesign**: Complete UI overhaul with modern gradients and animations
- **⚡ Enhanced Header**: Beautiful animated banner with floating icons and shimmer effects
- **🌈 Advanced Color Scheme**: Vibrant cyan, purple, and orange color palette
- **💫 Smooth Animations**: Floating elements, pulsing effects, and interactive hover states
- **📱 Premium Mobile Experience**: Fully responsive design optimized for all devices

## Future Enhancements
- **🔊 Audio System**: Dynamic sound effects and ambient music
- **🏆 Advanced Achievements**: Expanded milestone system with rewards
- **⚡ Performance Optimizations**: Even smoother gameplay experience
- **🌟 Prestige System**: Deep progression mechanics with Hero Soul upgrades
- **🎮 Additional Content**: More zones, heroes, and gameplay mechanics

---

**🎮 Experience the ultimate clicker adventure with BMT Clicker! 🎮**
