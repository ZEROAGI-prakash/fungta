const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    players: Object.keys(players).length,
    uptime: process.uptime()
  });
});

const players = {};
const npcs = {};
const bullets = [];
const cars = {};

let npcIdCounter = 0;
let carIdCounter = 0;

for (let i = 0; i < 20; i++) {
  const npcId = `npc_${npcIdCounter++}`;
  npcs[npcId] = {
    id: npcId,
    x: Math.random() * 3000,
    y: Math.random() * 3000,
    rotation: Math.random() * Math.PI * 2,
    velocityX: 0,
    velocityY: 0
  };
}

for (let i = 0; i < 15; i++) {
  const carId = `car_${carIdCounter++}`;
  cars[carId] = {
    id: carId,
    x: Math.random() * 3000,
    y: Math.random() * 3000,
    rotation: Math.random() * Math.PI * 2,
    velocityX: 0,
    velocityY: 0,
    driver: null,
    health: 100
  };
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 400 + Math.random() * 200,
    y: 300 + Math.random() * 200,
    rotation: 0,
    health: 100,
    kills: 0,
    deaths: 0,
    inCar: null,
    velocityX: 0,
    velocityY: 0
  };

  socket.emit('init', {
    id: socket.id,
    players: players,
    npcs: npcs,
    cars: cars
  });

  socket.broadcast.emit('playerJoined', players[socket.id]);

  socket.on('playerMove', (data) => {
    try {
      if (players[socket.id] && data) {
        players[socket.id].x = Math.max(0, Math.min(3000, data.x || 0));
        players[socket.id].y = Math.max(0, Math.min(3000, data.y || 0));
        players[socket.id].rotation = data.rotation || 0;
        players[socket.id].velocityX = data.velocityX || 0;
        players[socket.id].velocityY = data.velocityY || 0;
      }
    } catch (error) {
      console.error('Error in playerMove:', error);
    }
  });

  socket.on('playerShoot', (data) => {
    io.emit('playerShot', {
      playerId: socket.id,
      x: data.x,
      y: data.y,
      rotation: data.rotation,
      velocityX: data.velocityX,
      velocityY: data.velocityY
    });
  });

  socket.on('bulletHit', (data) => {
    try {
      if (!data || !data.targetType || !data.targetId) return;
      
      if (data.targetType === 'player' && players[data.targetId]) {
        players[data.targetId].health -= 20;
        
        if (players[data.targetId].health <= 0) {
          players[data.targetId].health = 100;
          players[data.targetId].deaths++;
          
          if (players[socket.id]) {
            players[socket.id].kills++;
          }
          
          const spawnX = 400 + Math.random() * 200;
          const spawnY = 300 + Math.random() * 200;
          players[data.targetId].x = spawnX;
          players[data.targetId].y = spawnY;
          players[data.targetId].inCar = null;
          
          io.emit('playerKilled', {
            killedId: data.targetId,
            killerId: socket.id,
            spawnX: spawnX,
            spawnY: spawnY
          });
        } else {
          io.emit('playerHit', {
            playerId: data.targetId,
            health: players[data.targetId].health
          });
        }
      } else if (data.targetType === 'npc' && npcs[data.targetId]) {
        delete npcs[data.targetId];
        io.emit('npcKilled', data.targetId);
      } else if (data.targetType === 'car' && cars[data.targetId]) {
        cars[data.targetId].health -= 20;
        
        if (cars[data.targetId].health <= 0) {
          const driverId = cars[data.targetId].driver;
          if (driverId && players[driverId]) {
            players[driverId].inCar = null;
          }
          delete cars[data.targetId];
          io.emit('carDestroyed', data.targetId);
        }
      }
    } catch (error) {
      console.error('Error in bulletHit:', error);
    }
  });

  socket.on('enterCar', (carId) => {
    if (cars[carId] && !cars[carId].driver && players[socket.id]) {
      cars[carId].driver = socket.id;
      players[socket.id].inCar = carId;
      io.emit('playerEnteredCar', {
        playerId: socket.id,
        carId: carId
      });
    }
  });

  socket.on('exitCar', () => {
    if (players[socket.id] && players[socket.id].inCar) {
      const carId = players[socket.id].inCar;
      if (cars[carId]) {
        cars[carId].driver = null;
      }
      players[socket.id].inCar = null;
      io.emit('playerExitedCar', {
        playerId: socket.id,
        carId: carId
      });
    }
  });

  socket.on('carMove', (data) => {
    if (cars[data.carId] && cars[data.carId].driver === socket.id) {
      cars[data.carId].x = data.x;
      cars[data.carId].y = data.y;
      cars[data.carId].rotation = data.rotation;
      cars[data.carId].velocityX = data.velocityX;
      cars[data.carId].velocityY = data.velocityY;
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    if (players[socket.id] && players[socket.id].inCar) {
      const carId = players[socket.id].inCar;
      if (cars[carId]) {
        cars[carId].driver = null;
      }
    }
    
    delete players[socket.id];
    io.emit('playerLeft', socket.id);
  });
});

setInterval(() => {
  Object.values(npcs).forEach(npc => {
    if (Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      npc.velocityX = Math.cos(angle) * 50;
      npc.velocityY = Math.sin(angle) * 50;
      npc.rotation = angle;
    }
    
    npc.x += npc.velocityX * 0.016;
    npc.y += npc.velocityY * 0.016;
    
    npc.x = Math.max(0, Math.min(3000, npc.x));
    npc.y = Math.max(0, Math.min(3000, npc.y));
    
    npc.velocityX *= 0.98;
    npc.velocityY *= 0.98;
  });
  
  io.emit('npcUpdate', npcs);
}, 100);

setInterval(() => {
  io.emit('gameState', {
    players: players,
    cars: cars
  });
}, 50);

const PORT = process.env.PORT || 5000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 GTA 2D Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  http.close(() => {
    console.log('HTTP server closed');
  });
});
