# 🎮 GTA 2D - Multiplayer Action Game

A real-time multiplayer 2D top-down shooter game inspired by classic GTA gameplay. Built with Node.js, Socket.IO, and Phaser 3.

![Game Preview](https://img.shields.io/badge/status-live-brightgreen)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

### Core Gameplay
- **Real-time Multiplayer** - Play with friends in real-time using WebSocket technology
- **Smooth Player Movement** - WASD controls with mouse aim
- **Combat System** - Shoot other players and NPCs with realistic bullet physics
- **Vehicle System** - Enter and drive various cars across the map
- **NPC AI** - 20 AI-controlled NPCs that roam the city
- **Open World Map** - Large 3000x3000 city with roads, buildings, and cover

### 🔫 Advanced Weapon System
- **5 Unique Weapons** - Pistol (free), Shotgun ($500), SMG ($800), Rifle ($1200), Sniper ($2000)
- **Realistic Ballistics** - Each weapon has unique damage, fire rate, range, and spread
- **Ammo Management** - Magazine and reserve ammo with reload mechanics
- **Weapon Switching** - Quick switch with 1-5 number keys
- **Automatic & Semi-Auto** - SMG auto-fire vs. manual shooting

### 💰 Economy & Shop System
- **Starting Money** - Begin with $500
- **Earn Money** - $100 per player kill, $25 per NPC kill
- **Shop Interface** - Press B to open shop
- **Purchasable Items**:
  - Weapons: $500-$2000
  - Ammo: $50 per magazine
  - Health: $100 for full restoration
  - Armor: $150 for protection

### 💬 Real-Time Chat System
- **Text Chat** - Press T to chat with all players
- **System Messages** - Kill notifications and game events
- **Chat History** - Last 20 messages visible
- **Non-intrusive** - Chat doesn't block gameplay

### 🎵 Sound Effects System
- **Weapon Sounds** - Unique gunshot sounds for each weapon
- **Reload Audio** - Satisfying reload click and slide
- **Car Engine** - Engine sounds when entering vehicles
- **Hit Effects** - Impact sounds when bullets hit
- **Purchase Chime** - Positive feedback for shop purchases
- **Volume Control** - Adjustable master volume

### 🗺️ Mini-Map
- **Corner Radar** - Always-on mini-map in top-right
- **Player Indicators** - See yourself (cyan triangle) and other players (yellow dots)
- **NPC Markers** - Track NPC positions (red dots)
- **Vehicle Icons** - Locate available cars (orange squares)
- **Building Outlines** - Navigate city layout
- **Real-time Updates** - Synchronized with game world

### Game Mechanics
- **Health System** - Take damage and regenerate on respawn
- **Kill/Death Tracking** - Competitive scoring system
- **Car Destruction** - Vehicles can be destroyed with gunfire
- **Collision Detection** - Realistic physics with buildings and vehicles
- **Responsive Camera** - Smooth camera follow with the player

### Visual Features
- **Dynamic HUD** - Health bar, kills, deaths, and player count
- **Particle Effects** - Muzzle flashes, explosions, and hit effects
- **Multiple Vehicle Types** - 3 different car models
- **Varied Buildings** - 3 building types for strategic gameplay
- **Camera Shake** - Impact feedback for explosions and hits

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Real-time Communication**: Socket.IO
- **Game Engine**: Phaser 3
- **Graphics**: SVG assets
- **Deployment**: Compatible with Render, Railway, Heroku

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SilkyCleanComputationalscience
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎮 How to Play

### Controls
- **WASD** - Move your character
- **Mouse** - Aim weapon
- **Left Click** - Shoot (hold for automatic weapons)
- **E** - Enter/Exit vehicle (when near a car)
- **1-5** - Switch weapons (Pistol, Shotgun, SMG, Rifle, Sniper)
- **R** - Reload current weapon
- **B** - Open shop menu
- **T** - Open chat input
- **Enter** - Send chat message
- **ESC** - Close shop/chat

### Game Objectives
- Eliminate other players and NPCs to earn money
- Purchase better weapons and upgrades from the shop
- Steal vehicles for faster movement
- Survive and increase your kill count
- Explore the open world city
- Chat with other players

### Tips
- Use buildings as cover
- Cars are faster but make you a bigger target
- Watch your health bar and armor
- Buy ammo before running out
- Use the mini-map to track enemies
- Different weapons excel at different ranges
- Reload in safe spots
- Work with other players or go solo

## 🌐 Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Deploy!

### Deploy to Railway

1. Sign up at [Railway](https://railway.app)
2. Create a new project from GitHub
3. Railway auto-detects Node.js
4. Deploy automatically

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Push: `git push heroku main`

## 🏗️ Project Structure

```
SilkyCleanComputationalscience/
├── server.js              # Node.js server with Socket.IO
├── package.json           # Dependencies and scripts
├── public/                # Client-side files
│   ├── index.html        # Game HTML structure
│   ├── style.css         # Styling and HUD
│   ├── game.js           # Phaser game logic
│   └── assets/           # SVG game assets
│       ├── player.svg
│       ├── car.svg
│       ├── car2.svg
│       ├── car3.svg
│       ├── building1.svg
│       ├── building2.svg
│       ├── building3.svg
│       ├── npc.svg
│       └── bullet.svg
└── README.md             # This file
```

## 🔧 Configuration

### Server Port
Default port is 5000. Change in `server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

### Game World Size
Modify map boundaries in `game.js`:
```javascript
this.cameras.main.setBounds(0, 0, 3000, 3000);
this.physics.world.setBounds(0, 0, 3000, 3000);
```

### Player Speed
Adjust movement speed in `game.js`:
```javascript
const speed = playerInCar ? 300 : 200;
```

## 🐛 Known Issues

- Bullet collision may occasionally miss at high speeds
- Multiple players entering the same car simultaneously
- Camera shake on lower-end devices may affect performance

## 🚧 Roadmap

### Version 2.0 (Upcoming)
- [ ] Shop system for weapon upgrades
- [ ] Multiple weapon types (shotgun, rifle, sniper)
- [ ] Power-ups and health packs
- [ ] Mini-map for navigation
- [ ] Player customization (skins, colors)
- [ ] Team-based gameplay modes
- [ ] Voice chat integration
- [ ] Leaderboard system
- [ ] Mobile touch controls
- [ ] Better graphics and animations
- [ ] Tutorial mode for new players
- [ ] Sound effects and background music
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] More vehicle types (bikes, trucks)

## 🌐 Deploy to GitHub Pages (24/7 Free Hosting!)

**Your game can be hosted FREE on GitHub Pages - accessible 24/7 worldwide!**

### Quick Setup (2 minutes):

1. **Enable GitHub Pages:**
   - Go to your repo: [Settings](https://github.com/ZEROAGI-prakash/fungta/settings/pages)
   - Under **Source**, select: `main` branch
   - Click **Save**
   - Wait 2-3 minutes

2. **Your game is LIVE at:**
   ```
   https://zeroagi-prakash.github.io/fungta/
   ```

3. **Share with everyone!** 🎮
   - Game loads instantly
   - Works on all devices
   - No server costs
   - Always online 24/7

### For Full Multiplayer:

The frontend (game interface) runs on GitHub Pages. For multiplayer to work with multiple players, you need a backend server:

**Option A: Deploy Backend to Render (Free)**
1. Go to [Render.com](https://render.com)
2. Connect your GitHub account
3. Deploy `fungta` as Web Service
4. Update `public/game.js` line ~250 with your Render URL

**Your game will then support unlimited players online!**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

**This project is licensed under the MIT License** - see the [LICENSE](LICENSE) file for details.

This means **everyone can:**
- ✅ Use the game freely
- ✅ Modify and customize
- ✅ Share with others
- ✅ Use for commercial purposes
- ✅ Play and enjoy 24/7!

**Just keep the license notice!** ❤️

## 👤 Author

**PRAKASH (ZEROAGI)** - [@ZEROAGI-prakash](https://github.com/ZEROAGI-prakash)

Project Link: [https://github.com/ZEROAGI-prakash/fungta](https://github.com/ZEROAGI-prakash/fungta)

Live Demo: [https://zeroagi-prakash.github.io/fungta/](https://zeroagi-prakash.github.io/fungta/)

## 🙏 Acknowledgments

- Phaser 3 game framework
- Socket.IO for real-time communication
- Inspired by classic GTA gameplay

---

**Made with ❤️ for the gaming community**
