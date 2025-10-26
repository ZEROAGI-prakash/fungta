# GTA 2D - Multiplayer Action Game

## Overview
A browser-based multiplayer 2D action game inspired by GTA 2, built with Phaser.js, Socket.io, and Node.js. Players can shoot, drive cars, explore a city map, and compete in real-time multiplayer combat.

## Project Status
**Current State:** MVP Complete - All core features implemented
**Last Updated:** October 26, 2025

## Features Implemented
✅ **Multiplayer System**
- Real-time player connections via Socket.io
- Player synchronization across clients
- Host-join game model

✅ **Combat System**
- Gun shooting mechanics
- Bullet physics with collision detection
- Kill/death tracking
- Damage system
- Respawn system

✅ **Vehicle System**
- Drivable cars with realistic physics
- Enter/exit vehicles (E key)
- Shooting while driving
- Car health and destruction
- Explosion effects when cars are destroyed

✅ **NPCs**
- 20 AI-controlled characters
- Random movement patterns
- Can be killed by players

✅ **Map & Environment**
- 3000x3000 pixel city map with proper roads
- Gray asphalt roads with yellow lane markings
- Grid layout with roads every 300 pixels
- 57 buildings with 3 distinct types (tall gray, very tall gray, orange residential)
- Deterministic building placement for multiplayer sync
- Green park patches at block corners
- Realistic city feel with varied building architecture

✅ **UI/HUD**
- Health bar with color indicators
- Kill/death statistics
- Player count display
- Weapon information
- Animated menu screen

## Tech Stack
- **Frontend:** Phaser.js 3.60 (2D game framework)
- **Backend:** Node.js + Express
- **Networking:** Socket.io (WebSockets)
- **Graphics:** SVG-based sprites
- **Physics:** Arcade Physics (Phaser)

## Game Controls
- **WASD / Arrow Keys** - Move player/drive car
- **Mouse** - Aim
- **Left Click** - Shoot
- **E** - Enter/Exit car

## Architecture
```
├── server.js          # Game server + Socket.io logic
├── public/
│   ├── index.html     # Main HTML entry point
│   ├── game.js        # Phaser game client
│   └── style.css      # UI styling
└── package.json       # Dependencies
```

## Server Architecture
- Express serves static files
- Socket.io manages real-time connections
- Server maintains authoritative game state
- NPC AI runs on server (100ms updates)
- Game state sync (50ms updates)

## Game Mechanics
### Player System
- 100 HP health
- 200 speed (on foot), 300 speed (in car)
- Respawns on death with full health
- Can enter any unoccupied vehicle

### Combat
- Instant hit bullets (600 speed)
- 20 damage per hit
- 5 hits to kill
- Bullets collide with buildings, players, NPCs, and cars

### Vehicles
- 15 cars spawn on map with 3 different types (red, blue, green)
- Detailed sprites with headlights, taillights, windows, and wheels
- 100 HP per car
- Can be destroyed by shooting
- Only one player per car
- Explosion effect on destruction

## Recent Changes
- **Oct 26, 2025:** Map & Vehicle Improvements
  - Enhanced city map with proper gray roads and yellow lane markings
  - Added 3 different building types for visual variety
  - Fixed critical multiplayer desync with deterministic building placement
  - Improved car sprites with 3 different types (red, blue, green)
  - Added detailed car features: headlights, taillights, windows, wheels
  - Increased bullet pool capacity to 500 for heavy combat
  - Added safety checks to prevent bullet pool crashes
  
- **Oct 26, 2025:** Initial MVP implementation
  - Complete multiplayer system
  - All core features working
  - Beautiful UI with animations

## Next Potential Improvements
- Add sound effects and music
- More weapon types
- Power-ups and health packs
- Minimap implementation
- Chat system
- Better graphics/sprites
- Mobile controls
- Game modes (Deathmatch, Team modes)

## Running the Game
The game runs on port 5000 via the "Game Server" workflow.
Players can join by opening the same URL in multiple browsers.
