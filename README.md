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
- **Left Click** - Shoot
- **E** - Enter/Exit vehicle (when near a car)

### Game Objectives
- Eliminate other players and NPCs
- Steal vehicles for faster movement
- Survive and increase your kill count
- Explore the open world city

### Tips
- Use buildings as cover
- Cars are faster but make you a bigger target
- Watch your health bar
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Phaser 3 game framework
- Socket.IO for real-time communication
- Inspired by classic GTA gameplay

---

**Made with ❤️ for the gaming community**
